import React, { useState, useEffect } from "react";
import {
  Typography,
  Table,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  TimePicker,
  Drawer,
  message,
  Pagination,
  Card,
  Row,
  Col,
  Divider,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useMediaQuery } from "react-responsive";
import {
  getReservationList,
  getReservationDetail,
  createReservation,
  updateReservation,
  deleteReservation,
  getReservationAvailableSlots,
  getCustomerList,
  getDoctorList,
} from "../../api/crm";
import { RESERVATION_STATUS, VISIT_TYPE } from "../../types/reservation";
import { usePermission } from "../../hooks/usePermission";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const statusColors = {
  [RESERVATION_STATUS.PENDING]: "orange",
  [RESERVATION_STATUS.CONFIRMED]: "green",
  [RESERVATION_STATUS.CANCELED]: "red",
  [RESERVATION_STATUS.COMPLETED]: "blue",
};

const statusLabels = {
  [RESERVATION_STATUS.PENDING]: "대기중",
  [RESERVATION_STATUS.CONFIRMED]: "확정됨",
  [RESERVATION_STATUS.CANCELED]: "취소됨",
  [RESERVATION_STATUS.COMPLETED]: "완료됨",
};

const ReservationsPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    customerName: null,
    customerId: null,
    doctorId: null,
    status: null,
    startDate: null,
    endDate: null,
    sessionTreatment: null,
    visitType: null,
  });
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [doctors, setDoctors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  const { checkPermission } = usePermission("MENU008"); // 예약 메뉴 코드 가정

  useEffect(() => {
    fetchReservations();
    fetchDoctors();
    fetchCustomers();
  }, [page, limit, filters]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await getReservationList(page, limit, filters);
      setReservations(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      message.error("예약 목록을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await getDoctorList(1, 100);
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      message.error("의사 목록을 불러오는데 실패했습니다");
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await getCustomerList(1, 100);
      setCustomers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      message.error("고객 목록을 불러오는데 실패했습니다");
    }
  };

  const fetchAvailableSlots = async (date, doctorId) => {
    if (!date) return;
    
    try {
      const formattedDate = dayjs(date).format("YYYY-MM-DD");
      const response = await getReservationAvailableSlots(formattedDate, doctorId);
      setAvailableSlots(response.data);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      message.error("예약 가능 시간을 불러오는데 실패했습니다");
    }
  };

  const handleSearch = (values) => {
    const newFilters = {
      ...filters,
      customerName: values.customerName || null,
      customerId: values.customerId || null,
      doctorId: values.doctorId || null,
      status: values.status || null,
      sessionTreatment: values.sessionTreatment || null,
      visitType: values.visitType || null,
    };

    if (values.dateRange && values.dateRange.length === 2) {
      newFilters.startDate = values.dateRange[0].format("YYYY-MM-DD");
      newFilters.endDate = values.dateRange[1].format("YYYY-MM-DD");
    } else {
      newFilters.startDate = null;
      newFilters.endDate = null;
    }

    setFilters(newFilters);
    setPage(1);
  };

  const resetFilters = () => {
    searchForm.resetFields();
    setFilters({
      customerName: null,
      customerId: null,
      doctorId: null,
      status: null,
      startDate: null,
      endDate: null,
      sessionTreatment: null,
      visitType: null,
    });
    setPage(1);
  };

  const showCreateForm = () => {
    if (!checkPermission("canCreate")) {
      Modal.error({
        title: "권한 없음",
        content: "예약 생성 권한이 없습니다",
      });
      return;
    }

    form.resetFields();
    setEditingReservation(null);
    setSelectedDate(null);
    setSelectedDoctorId(null);
    setAvailableSlots([]);
    setDrawerVisible(true);
  };

  const showEditForm = async (id) => {
    if (!checkPermission("canUpdate")) {
      Modal.error({
        title: "권한 없음",
        content: "예약 수정 권한이 없습니다",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await getReservationDetail(id);
      const reservation = response.data;

      setEditingReservation(reservation);
      form.setFieldsValue({
        customerId: reservation.customerId,
        doctorId: reservation.doctorId,
        reservationDate: dayjs(reservation.reservationDate),
        startTime: dayjs(reservation.startTime, "HH:mm"),
        endTime: dayjs(reservation.endTime, "HH:mm"),
        duration: reservation.duration,
        visitRoute: reservation.visitRoute,
        visitType: reservation.visitType,
        sessionTreatment: reservation.sessionTreatment,
        hasPriorExperience: reservation.hasPriorExperience,
        status: reservation.status,
        notes: reservation.notes,
      });

      setSelectedDate(dayjs(reservation.reservationDate));
      setSelectedDoctorId(reservation.doctorId);
      fetchAvailableSlots(
        dayjs(reservation.reservationDate),
        reservation.doctorId
      );
      setDrawerVisible(true);
    } catch (error) {
      console.error("Error fetching reservation details:", error);
      message.error("예약 정보를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        reservationDate: values.reservationDate.format("YYYY-MM-DD"),
        startTime: values.startTime.format("HH:mm"),
        endTime: values.endTime.format("HH:mm"),
      };

      if (editingReservation) {
        await updateReservation(editingReservation.id, formattedValues);
        message.success("예약이 수정되었습니다");
      } else {
        await createReservation(formattedValues);
        message.success("예약이 생성되었습니다");
      }

      setDrawerVisible(false);
      fetchReservations();
    } catch (error) {
      console.error("Error saving reservation:", error);
      message.error("예약 저장에 실패했습니다");
    }
  };

  const handleDelete = (id) => {
    if (!checkPermission("canDelete")) {
      Modal.error({
        title: "권한 없음",
        content: "예약 삭제 권한이 없습니다",
      });
      return;
    }

    Modal.confirm({
      title: "예약 삭제",
      content: "정말 이 예약을 삭제하시겠습니까?",
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      onOk: async () => {
        try {
          await deleteReservation(id);
          message.success("예약이 삭제되었습니다");
          fetchReservations();
        } catch (error) {
          console.error("Error deleting reservation:", error);
          message.error("예약 삭제에 실패했습니다");
        }
      },
    });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedDoctorId(form.getFieldValue("doctorId"));
    fetchAvailableSlots(date, form.getFieldValue("doctorId"));
  };

  const handleDoctorChange = (doctorId) => {
    setSelectedDoctorId(doctorId);
    fetchAvailableSlots(selectedDate, doctorId);
  };

  const columns = [
    {
      title: "예약 번호",
      dataIndex: "reservationNumber",
      key: "reservationNumber",
      width: 120,
    },
    {
      title: "고객 정보",
      dataIndex: "customer",
      key: "customer",
      render: (customer) => (
        <span>
          {customer?.name} ({customer?.phoneNumber})
        </span>
      ),
    },
    {
      title: "예약 일시",
      key: "reservationDate",
      render: (_, record) => (
        <span>
          {dayjs(record.reservationDate).format("YYYY-MM-DD")}{" "}
          {record.startTime} ~ {record.endTime}
        </span>
      ),
    },
    {
      title: "의사",
      dataIndex: "doctor",
      key: "doctor",
      render: (doctor) => doctor?.name,
    },
    {
      title: "시술",
      dataIndex: "sessionTreatment",
      key: "sessionTreatment",
    },
    {
      title: "방문 구분",
      dataIndex: "visitType",
      key: "visitType",
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: "액션",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showEditForm(record.id)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "0 0 24px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          예약 관리
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateForm}
        >
          예약 생성
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Form
          form={searchForm}
          layout="vertical"
          onFinish={handleSearch}
          initialValues={{ status: null }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="고객 이름" name="customerName">
                <Input placeholder="고객 이름" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="고객" name="customerId">
                <Select 
                  placeholder="고객 선택" 
                  allowClear
                  showSearch
                  optionFilterProp="children"
                >
                  {customers.map((customer) => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.phoneNumber})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="의사" name="doctorId">
                <Select placeholder="의사 선택" allowClear>
                  {doctors.map((doctor) => (
                    <Option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="상태" name="status">
                <Select placeholder="상태 선택" allowClear>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <Option key={value} value={value}>
                      {label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="예약 날짜" name="dateRange">
                <RangePicker 
                  style={{ width: "100%" }} 
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="시술" name="sessionTreatment">
                <Input placeholder="시술 종류" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="방문 구분" name="visitType">
                <Select placeholder="방문 구분" allowClear>
                  <Option value={VISIT_TYPE.NEW}>{VISIT_TYPE.NEW}</Option>
                  <Option value={VISIT_TYPE.EXISTING}>{VISIT_TYPE.EXISTING}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <Button onClick={resetFilters}>초기화</Button>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              검색
            </Button>
          </div>
        </Form>
      </Card>

      <Table
        columns={columns}
        dataSource={reservations}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: "max-content" }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 16,
        }}
      >
        <Pagination
          current={page}
          pageSize={limit}
          total={total}
          onChange={(newPage) => setPage(newPage)}
          showSizeChanger
          onShowSizeChange={(_, newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          showTotal={(total) => `총 ${total}개 항목`}
        />
      </div>

      <Drawer
        title={editingReservation ? "예약 수정" : "예약 생성"}
        width={isMobile ? "100%" : 600}
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <Button onClick={() => setDrawerVisible(false)}>취소</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
            >
              저장
            </Button>
          </div>
        }
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customerId"
                label="고객"
                rules={[{ required: true, message: "고객을 선택해주세요" }]}
              >
                <Select 
                  placeholder="고객 선택"
                  showSearch
                  optionFilterProp="children"
                  allowClear
                >
                  {customers.map((customer) => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.phoneNumber})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="doctorId"
                label="의사"
                rules={[{ required: true, message: "의사를 선택해주세요" }]}
              >
                <Select 
                  placeholder="의사 선택"
                  onChange={handleDoctorChange}
                >
                  {doctors.map((doctor) => (
                    <Option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="reservationDate"
                label="예약 날짜"
                rules={[{ required: true, message: "예약 날짜를 선택해주세요" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  onChange={handleDateChange}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="시작 시간"
                rules={[{ required: true, message: "시작 시간을 선택해주세요" }]}
              >
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="종료 시간"
                rules={[{ required: true, message: "종료 시간을 선택해주세요" }]}
              >
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          {selectedDate && selectedDoctorId && availableSlots.length > 0 && (
            <>
              <Divider orientation="left">예약 가능 시간</Divider>
              <div style={{ marginBottom: 16 }}>
                {availableSlots.map((slot, index) => (
                  <Tag
                    key={index}
                    color="blue"
                    style={{ margin: 4, cursor: "pointer" }}
                    onClick={() => {
                      form.setFieldsValue({
                        startTime: dayjs(slot.start, "HH:mm"),
                        endTime: dayjs(slot.end, "HH:mm"),
                      });
                    }}
                  >
                    {slot.start} - {slot.end}
                  </Tag>
                ))}
              </div>
            </>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="소요 시간 (분)"
                rules={[{ required: true, message: "소요 시간을 입력해주세요" }]}
              >
                <Input type="number" min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="visitRoute"
                label="방문 경로"
                rules={[{ required: true, message: "방문 경로를 선택해주세요" }]}
              >
                <Select placeholder="방문 경로 선택">
                  <Option value="인스타그램">인스타그램</Option>
                  <Option value="페이스북">페이스북</Option>
                  <Option value="네이버">네이버</Option>
                  <Option value="지인 소개">지인 소개</Option>
                  <Option value="기타">기타</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="visitType"
                label="방문 구분"
                rules={[{ required: true, message: "방문 구분을 선택해주세요" }]}
              >
                <Select placeholder="방문 구분 선택">
                  <Option value={VISIT_TYPE.NEW}>{VISIT_TYPE.NEW}</Option>
                  <Option value={VISIT_TYPE.EXISTING}>{VISIT_TYPE.EXISTING}</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sessionTreatment"
                label="시술 종류"
                rules={[{ required: true, message: "시술 종류를 입력해주세요" }]}
              >
                <Input placeholder="예) Lip (AC)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="hasPriorExperience"
                label="이전 경험 여부"
                rules={[{ required: true, message: "이전 경험 여부를 선택해주세요" }]}
              >
                <Select placeholder="이전 경험 여부">
                  <Option value={true}>있음</Option>
                  <Option value={false}>없음</Option>
                </Select>
              </Form.Item>
            </Col>
            {editingReservation && (
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="상태"
                  rules={[{ required: true, message: "상태를 선택해주세요" }]}
                >
                  <Select placeholder="상태 선택">
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <Option key={value} value={value}>
                        {label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="notes" label="특이사항">
                <Input.TextArea
                  rows={4}
                  placeholder="특이사항을 입력해주세요"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
};

export default ReservationsPage; 