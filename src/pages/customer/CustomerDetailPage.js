import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  message,
  Card,
  Row,
  Col,
  Tabs,
  Table,
  Space,
  Modal as AntModal,
  List,
  Descriptions,
  Tag,
  Divider,
  Timeline,
} from "antd";
import dayjs from "dayjs";
import {
  getCustomerDetail,
  updateCustomer,
  deleteCustomer,
  getCustomerDiaryList,
  createCustomerDiary,
  updateCustomerDiary,
  deleteCustomerDiary,
  getCustomerPaymentDetail,
  getDoctorList,
  getCustomerCourseList,
  createCustomerCourse,
  updateCustomerCourse,
  deleteCustomerCourse,
} from "../../api/crm";
import DoctorTag from "../../components/molecules/DoctorTag";
import { useMediaQuery } from "react-responsive";
import { useDoctorStore } from "../../stores/doctorStore";
import { usePermission } from "../../hooks/usePermission";
import {
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [diaryForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [diaries, setDiaries] = useState([]);
  const [diaryLoading, setDiaryLoading] = useState(false);
  const [diaryModalVisible, setDiaryModalVisible] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState(null);
  const [diaryPage, setDiaryPage] = useState(1);
  const [diaryMetadata, setDiaryMetadata] = useState({
    total: 0,
    page: 1,
    limit: 10,
  });
  const [payments, setPayments] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentMetadata, setPaymentMetadata] = useState({
    total: 0,
    page: 1,
    limit: 10,
  });
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { doctorInfo } = useDoctorStore();
  const { checkPermission } = usePermission("MENU001");

  useEffect(() => {
    fetchCustomerDetail();
    fetchTeachers();
    fetchCourses();
  }, [id]);

  const fetchTeachers = async () => {
    try {
      const response = await getDoctorList(1, 50);
      setTeachers(response.data.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      message.error("의사 목록을 불러오는데 실패했습니다");
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await getCustomerCourseList(id);
      if (response) {
        const sortedCourses = [...response.data].sort((a, b) => b.id - a.id);
        setCourses(sortedCourses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("코스 목록을 불러오는데 실패했습니다");
    }
  };

  const fetchCustomerDetail = async () => {
    setLoading(true);
    try {
      const response = await getCustomerDetail(id);
      setCustomer(response.data);
      form.setFieldsValue({
        ...response.data,
        registrationDate: response.data.registrationDate
          ? dayjs(response.data.registrationDate)
          : null,
        birthDate: response.data.birthDate
          ? dayjs(response.data.birthDate)
          : null,
        deadline: response.data.deadline ? dayjs(response.data.deadline) : null,
        experienceDate: response.data.experienceDate
          ? dayjs(response.data.experienceDate)
          : null,
        hopeDateText: response.data.hopeDateText || null,
        doctors: response.data.doctors?.map((doctor) => doctor.id) || [],
      });
    } catch (error) {
      console.error("Error fetching customer details:", error);
      message.error("고객 정보를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const fetchDiaries = async () => {
    setDiaryLoading(true);
    try {
      const response = await getCustomerDiaryList(id, diaryPage, 10);
      setDiaries(response.data.data);
      setDiaryMetadata({
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
      });
    } catch (error) {
      console.error("Error fetching diaries:", error);
      message.error("고객일지를 불러오는데 실패했습니다");
    } finally {
      setDiaryLoading(false);
    }
  };

  const handleEdit = async (values) => {
    try {
      const formattedValues = {};

      if (values.name) formattedValues.name = values.name;
      if (values.koreanName) formattedValues.koreanName = values.koreanName;
      if (values.memberCode) formattedValues.memberCode = values.memberCode;
      if (values.status) formattedValues.status = values.status;
      if (values.classroom) formattedValues.classroom = values.classroom;
      if (values.phoneNumber) formattedValues.phoneNumber = values.phoneNumber;
      if (values.customerId) formattedValues.customerId = values.customerId;
      if (values.courseId) formattedValues.courseId = values.courseId;
      if (values.doctors?.length) {
        formattedValues.doctors = values.doctors.map((doctorId) => ({
          id: doctorId,
        }));
      }
      if (values.birthDate) {
        formattedValues.birthDate = values.birthDate.format("YYYY-MM-DD");
      }
      if (values.registrationDate) {
        formattedValues.registrationDate =
          values.registrationDate.format("YYYY-MM-DD");
      }
      if (values.deadline) {
        formattedValues.deadline = values.deadline.format("YYYY-MM-DD");
      }
      if (values.experienceDate) {
        formattedValues.experienceDate =
          values.experienceDate.format("YYYY-MM-DD");
      }
      if (values.hopeDateText)
        formattedValues.hopeDateText = values.hopeDateText;
      if (values.experienceContent)
        formattedValues.experienceContent = values.experienceContent;
      if (values.memo) formattedValues.memo = values.memo;
      if ("group" in values) formattedValues.group = values.group;

      await updateCustomer(id, formattedValues);
      message.success("고객 정보가 수정되었습니다.");
      navigate("/customer");
    } catch (error) {
      console.error("Error updating customer:", error);
      message.error("수정 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!checkPermission("canDelete")) {
      AntModal.error({
        title: "권한 없음",
        content: "고객 삭제 권한이 없습니다.",
      });
      return;
    }

    try {
      AntModal.confirm({
        title: "고객 삭제",
        content: "정말 이 고객을 삭제하시겠습니까?",
        okText: "삭제",
        okType: "danger",
        cancelText: "취소",
        onOk: async () => {
          await deleteCustomer(id);
          message.success("고객이 삭제되었습니다.");
          navigate("/customer");
        },
      });
    } catch (error) {
      console.error("Error deleting customer:", error);
      message.error("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleDiarySubmit = async (values) => {
    try {
      if (selectedDiary) {
        await updateCustomerDiary(selectedDiary.id, {
          ...values,
          date: values.date ? values.date.format("YYYY-MM-DD") : null,
        });
        message.success("고객일지가 수정되었습니다.");
      } else {
        await createCustomerDiary({
          ...values,
          customerId: id,
          date: values.date ? values.date.format("YYYY-MM-DD") : null,
        });
        message.success("고객일지가 등록되었습니다.");
      }
      setDiaryModalVisible(false);
      diaryForm.resetFields();
      fetchDiaries();
    } catch (error) {
      console.error("Error saving diary:", error);
      message.error("고객일지 저장 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteDiary = async (diary) => {
    try {
      AntModal.confirm({
        title: "고객일지 삭제",
        content: "정말 삭제하시겠습니까?",
        okText: "삭제",
        okType: "danger",
        cancelText: "취소",
        onOk: async () => {
          await deleteCustomerDiary(diary.id);
          message.success("고객일지가 삭제되었습니다.");
          fetchDiaries();
        },
      });
    } catch (error) {
      console.error("Error deleting diary:", error);
      message.error("삭제 중 오류가 발생했습니다.");
    }
  };

  const diaryColumns = [
    {
      title: "날짜",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "제목",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "내용",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
    },
    {
      title: "작성자",
      dataIndex: "teacher",
      key: "teacher",
      width: 120,
      render: (_, record) => <DoctorTag doctorId={record.doctorId} />,
    },
    {
      title: "관리",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Button
          danger
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteDiary(record);
          }}
        >
          삭제
        </Button>
      ),
    },
  ];

  const renderCustomerForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleEdit}
      style={{
        background: "#fff",
        padding: isMobile ? 0 : "32px",
        borderRadius: "8px",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
      }}
    >
      <Card
        title="기본 정보"
        bordered={false}
        style={{ marginBottom: "24px" }}
        styles={{ body: { padding: isMobile ? "16px" : "24px" } }}
      >
        <Row gutter={16}>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item
              name="name"
              label="이름(일문)"
              rules={[{ required: true, message: "이름을 입력해주세요" }]}
            >
              <Input placeholder="タナカ タロウ" />
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item name="koreanName" label="이름(한글)">
              <Input placeholder="홍길동" />
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item
              name="memberCode"
              label="회원코드"
              rules={[{ required: true, message: "회원코드를 입력해주세요" }]}
            >
              <Input type="number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item name="status" label="상태">
              <Select>
                <Option value="수강중">수강중</Option>
                <Option value="대기">대기</Option>
                <Option value="휴학">휴학</Option>
                <Option value="퇴원">퇴원</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item name="courseId" label="수강 코스">
              <Select placeholder="수강 코스를 선택하세요" allowClear>
                {courses.map((course) => (
                  <Option key={course.id} value={course.id}>
                    {course.name} (₩{course.price.toLocaleString()})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item
              name="phoneNumber"
              label="전화번호"
              rules={[{ required: true, message: "전화번호를 입력해주세요" }]}
            >
              <Input placeholder="010-1234-5678" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item name="customerId" label="Customer ID (Square)">
              <Input placeholder="고객 ID를 입력하세요 (결제 시트 연동을 위해 필요한 정보입니다.)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="doctors" label="담당 의사">
              <Select mode="multiple" placeholder="담당 의사를 선택하세요">
                {teachers.map((teacher) => (
                  <Option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card
        title="날짜 정보"
        bordered={false}
        style={{ marginBottom: "24px" }}
        styles={{ body: { padding: isMobile ? "16px" : "24px" } }}
      >
        <Row gutter={16}>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item name="birthDate" label="생년월일">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item name="registrationDate" label="등록일">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item name="deadline" label="수강기한">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={isMobile ? 24 : 12}>
            <Form.Item name="experienceDate" label="체험일">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 12}>
            <Form.Item name="hopeDateText" label="희망일">
              <Input placeholder="희망일을 입력해주세요" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card
        title="추가 정보"
        bordered={false}
        style={{ marginBottom: "24px" }}
        styles={{ body: { padding: isMobile ? "16px" : "24px" } }}
      >
        <Row gutter={16}>
          <Col span={isMobile ? 24 : 12}>
            <Form.Item name="experienceContent" label="체험내용">
              <TextArea
                rows={4}
                placeholder="체험 수업에서의 특이사항이나 피드백을 입력해주세요"
                style={{ background: "#fafafa" }}
              />
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 12}>
            <Form.Item name="memo" label="메모">
              <TextArea
                rows={4}
                placeholder="추가 메모사항을 입력해주세요"
                style={{ background: "#fafafa" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="group" label="그룹">
              <Input placeholder="초급반" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Form.Item style={{ marginBottom: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "8px",
            padding: isMobile ? "0 16px" : 0,
          }}
        >
          <Button danger onClick={handleDelete}>
            삭제
          </Button>
          <Space>
            <Button onClick={() => navigate("/customer")}>취소</Button>
            <Button type="primary" htmlType="submit">
              저장
            </Button>
          </Space>
        </div>
      </Form.Item>
    </Form>
  );

  const fetchPayments = async () => {
    setPaymentLoading(true);
    try {
      const response = await getCustomerPaymentDetail(
        id,
        Math.max(
          1,
          paymentMetadata.total
            ? Math.ceil(paymentMetadata.total / 10) - paymentPage + 1
            : 1
        ),
        10
      );

      setPayments(response.data.data);
      setPaymentMetadata({
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
      });
    } catch (error) {
      console.error("Error fetching payments:", error);
      message.error("결제내역을 불러오는데 실패했습니다");
    } finally {
      setPaymentLoading(false);
    }
  };

  const paymentColumns = [
    {
      title: "결제일",
      dataIndex: "paymentDate",
      key: "paymentDate",
      width: 120,
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "수강 월",
      dataIndex: "monthOfClass",
      key: "monthOfClass",
      width: 100,
      render: (month) =>
        month ? dayjs(month.replace("-", "/")).format("YYYY-MM") : "-",
    },
    {
      title: "청구 금액",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      align: "right",
      render: (amount) => (amount ? amount.toLocaleString() + "円" : "-"),
    },
    {
      title: "실제 결제액",
      dataIndex: "actualPayment",
      key: "actualPayment",
      width: 120,
      align: "right",
      render: (amount) => (amount ? amount.toLocaleString() + "円" : "-"),
    },
    {
      title: "결제 방법",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 100,
      render: (method) => method || "-",
    },
    {
      title: "메모",
      dataIndex: "memo",
      key: "memo",
      ellipsis: true,
      render: (memo) => memo || "-",
    },
  ];

  return (
    <div style={{ padding: isMobile ? "16px" : "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          고객 정보
        </Title>
      </div>

      <Tabs
        defaultActiveKey="1"
        onChange={(key) => {
          if (key === "2") {
            fetchDiaries();
          } else if (key === "3") {
            fetchPayments();
          }
        }}
      >
        <TabPane tab="고객 정보" key="1">
          {renderCustomerForm()}
        </TabPane>
        <TabPane tab="고객일지" key="2">
          <div>
            <div style={{ marginBottom: 16, textAlign: "right" }}>
              <Button
                type="primary"
                onClick={() => {
                  setSelectedDiary(null);
                  diaryForm.resetFields();
                  setDiaryModalVisible(true);
                }}
              >
                일지 작성
              </Button>
            </div>
            {isMobile ? (
              <>
                <List
                  dataSource={diaries}
                  loading={diaryLoading}
                  renderItem={(diary) => (
                    <List.Item
                      onClick={() => {
                        setSelectedDiary(diary);
                        diaryForm.setFieldsValue({
                          ...diary,
                          date: diary.date ? dayjs(diary.date) : null,
                        });
                        setDiaryModalVisible(true);
                      }}
                      style={{ cursor: "pointer" }}
                      extra={
                        <Button
                          danger
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDiary(diary);
                          }}
                        >
                          삭제
                        </Button>
                      }
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            {diary.title}
                            <span style={{ color: "#999", fontSize: "0.9em" }}>
                              {diary.date
                                ? dayjs(diary.date).format("YYYY-MM-DD")
                                : "-"}
                            </span>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size="small">
                            <div style={{ color: "#666" }}>{diary.content}</div>
                            <DoctorTag doctorId={diary.doctorId} />
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                  pagination={{
                    current: diaryPage,
                    total: diaryMetadata.total,
                    pageSize: diaryMetadata.limit,
                    onChange: (newPage) => {
                      setDiaryPage(newPage);
                      fetchDiaries();
                    },
                    size: "small",
                    style: { textAlign: "center", marginTop: 16 },
                  }}
                />
              </>
            ) : (
              <Table
                columns={diaryColumns}
                dataSource={diaries}
                loading={diaryLoading}
                rowKey="id"
                onRow={(record) => ({
                  onClick: () => {
                    setSelectedDiary(record);
                    diaryForm.setFieldsValue({
                      ...record,
                      date: record.date ? dayjs(record.date) : null,
                    });
                    setDiaryModalVisible(true);
                  },
                  style: { cursor: "pointer" },
                })}
                pagination={{
                  current: diaryPage,
                  total: diaryMetadata.total,
                  pageSize: diaryMetadata.limit,
                  onChange: (newPage) => {
                    setDiaryPage(newPage);
                    fetchDiaries();
                  },
                  showSizeChanger: false,
                }}
                size="small"
              />
            )}
          </div>
        </TabPane>
        <TabPane tab="결제내역" key="3">
          <div style={{ padding: isMobile ? "0" : "24px" }}>
            {isMobile ? (
              <List
                dataSource={payments}
                loading={paymentLoading}
                renderItem={(payment) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <span style={{ fontWeight: "bold" }}>
                            {payment.monthOfClass
                              ? dayjs(
                                  payment.monthOfClass.replace("-", "/")
                                ).format("YYYY-MM")
                              : "-"}
                          </span>
                          <span style={{ color: "#999", fontSize: "0.9em" }}>
                            {payment.paymentDate
                              ? dayjs(payment.paymentDate).format("YYYY-MM-DD")
                              : "-"}
                          </span>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <div>
                            <span style={{ color: "#666" }}>청구 금액: </span>
                            <span style={{ color: "#1890ff" }}>
                              {payment.amount
                                ? `￥${payment.amount.toLocaleString()}`
                                : "-"}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: "#666" }}>실제 결제액: </span>
                            <span style={{ color: "#52c41a" }}>
                              {payment.actualPayment
                                ? `￥${payment.actualPayment.toLocaleString()}`
                                : "-"}
                            </span>
                          </div>
                          {payment.paymentMethod && (
                            <div>
                              <span style={{ color: "#666" }}>결제 방법: </span>
                              {payment.paymentMethod}
                            </div>
                          )}
                          {payment.memo && (
                            <div>
                              <span style={{ color: "#666" }}>메모: </span>
                              {payment.memo}
                            </div>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                pagination={{
                  current: paymentPage,
                  total: paymentMetadata.total,
                  pageSize: paymentMetadata.limit,
                  onChange: (newPage) => {
                    setPaymentPage(newPage);
                    fetchPayments();
                  },
                  size: "small",
                  style: { textAlign: "center", marginTop: 16 },
                }}
                footer={
                  <div style={{ padding: "12px 0" }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ color: "#666", marginBottom: 4 }}>
                            총 청구 금액
                          </div>
                          <div style={{ color: "#1890ff", fontWeight: "bold" }}>
                            ￥
                            {payments
                              .reduce(
                                (sum, item) => sum + (item.amount || 0),
                                0
                              )
                              .toLocaleString()}
                          </div>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ color: "#666", marginBottom: 4 }}>
                            총 결제액
                          </div>
                          <div style={{ color: "#52c41a", fontWeight: "bold" }}>
                            ￥
                            {payments
                              .reduce(
                                (sum, item) => sum + (item.actualPayment || 0),
                                0
                              )
                              .toLocaleString()}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                }
              />
            ) : (
              <Table
                columns={paymentColumns}
                dataSource={payments}
                loading={paymentLoading}
                rowKey="id"
                pagination={{
                  current: paymentPage,
                  total: paymentMetadata.total,
                  pageSize: paymentMetadata.limit,
                  onChange: (newPage) => {
                    setPaymentPage(newPage);
                    fetchPayments();
                  },
                  showSizeChanger: false,
                }}
                size="small"
                summary={(pageData) => {
                  let totalAmount = 0;
                  let totalActualPayment = 0;
                  pageData.forEach((item) => {
                    if (item.amount) totalAmount += item.amount;
                    if (item.actualPayment)
                      totalActualPayment += item.actualPayment;
                  });

                  return (
                    <Table.Summary fixed>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={2}>
                          합계
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          {totalAmount.toLocaleString()}円
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2} align="right">
                          {totalActualPayment.toLocaleString()}円
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3} colSpan={2} />
                      </Table.Summary.Row>
                    </Table.Summary>
                  );
                }}
              />
            )}
          </div>
        </TabPane>
      </Tabs>

      <AntModal
        title={selectedDiary ? "고객일지 수정" : "고객일지 작성"}
        open={diaryModalVisible}
        onCancel={() => setDiaryModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={diaryForm} layout="vertical" onFinish={handleDiarySubmit}>
          <Form.Item
            name="date"
            label="날짜"
            rules={[{ required: true, message: "날짜를 선택해주세요" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="title"
            label="제목"
            rules={[{ required: true, message: "제목을 입력해주세요" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="내용"
            rules={[{ required: true, message: "내용을 입력해주세요" }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setDiaryModalVisible(false)}>취소</Button>
              <Button type="primary" htmlType="submit">
                {selectedDiary ? "수정" : "등록"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </AntModal>
    </div>
  );
};

export default CustomerDetailPage;
