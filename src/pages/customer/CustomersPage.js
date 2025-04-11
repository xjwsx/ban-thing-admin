import React, { useState, useEffect } from "react";
import {
  Typography,
  Table,
  Calendar,
  Card,
  Badge,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Row,
  Col,
  Tabs,
  Tag,
  Space,
  Pagination,
  Divider,
  Tooltip,
  List,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  IdcardOutlined,
  IdcardTwoTone,
} from "@ant-design/icons";
import dayjs from "dayjs";
import DoctorTag from "../../components/molecules/DoctorTag";
import {
  getCustomerList,
  updateCustomer,
  createCustomer,
  getCustomersByRegistrationMonth,
  getCustomersByRegistrationYear,
  deleteCustomer,
  getDoctorList,
  getCourseList,
} from "../../api/crm";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { useDoctorStore } from "../../stores/doctorStore";
import { usePermission } from "../../hooks/usePermission";
const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// Constants
const PAGE_SIZE = 20;
const STATUS_COLORS = {
  방문중: "green",
  탈퇴: "red",
  그룹대기: "orange",
  휴면: "purple",
  회수권: "blue",
};

const DEFAULT_FILTERS = {
  name: "",
  memberCode: "",
  status: "방문중",
  classroom: "",
  group: "",
  doctorId: "",
  registrationDateStart: "",
  registrationDateEnd: "",
  birthDateStart: "",
  birthDateEnd: "",
};

// Utility functions
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return "";
  const cleaned = phoneNumber.replace(/-/g, "");
  if (cleaned.startsWith("080")) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  if (cleaned.startsWith("066")) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
};

const calculateAge = (birthDate) => {
  if (!birthDate || !dayjs(birthDate).isValid()) return "";
  const today = dayjs();
  const birth = dayjs(birthDate);
  return today.diff(birth, "year");
};

const formatDateValues = (values) => ({
  ...values,
  registrationDate: values.registrationDate?.format("YYYY-MM-DD"),
  birthDate: values.birthDate?.format("YYYY-MM-DD"),
  deadline: values.deadline?.format("YYYY-MM-DD"),
  experienceDate: values.experienceDate?.format("YYYY-MM-DD"),
  hopeDateText: values.hopeDateText,
});

const ManageCustomerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [metadata, setMetadata] = useState({
    totalCount: 0,
    totalPage: 0,
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [calendarCustomers, setCalendarCustomers] = useState([]);
  const [yearlyCustomers, setYearlyCustomers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState(() => {
    return {
      name: searchParams.get("name") || "",
      memberCode: searchParams.get("memberCode") || "",
      status: searchParams.get("status") || "방문중",
      classroom: searchParams.get("classroom") || "",
      group: searchParams.get("group") || "",
      doctorId: searchParams.get("doctorId") || "",
      registrationDateStart: searchParams.get("registrationDateStart") || "",
      registrationDateEnd: searchParams.get("registrationDateEnd") || "",
      birthDateStart: searchParams.get("birthDateStart") || "",
      birthDateEnd: searchParams.get("birthDateEnd") || "",
    };
  });

  const { doctorInfo } = useDoctorStore();
  const { checkPermission } = usePermission("MENU001");

  const updateQueryParams = (newFilters, newPage = page) => {
    const params = new URLSearchParams();
    params.set("page", newPage.toString());
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  };

  useEffect(() => {
    const formValues = {
      ...filters,
      registrationDateRange: filters.registrationDateStart
        ? [
            dayjs(filters.registrationDateStart),
            dayjs(filters.registrationDateEnd),
          ]
        : undefined,
      birthDateRange: filters.birthDateStart
        ? [dayjs(filters.birthDateStart), dayjs(filters.birthDateEnd)]
        : undefined,
    };

    searchForm.setFieldsValue(formValues);
    fetchCustomers(page, filters);
    fetchYearlyCustomers();
  }, [location.search]);

  useEffect(() => {
    searchForm.setFieldsValue({
      status: "방문중",
    });
  }, []);

  const fetchYearlyCustomers = async (year = dayjs().format("YYYY")) => {
    try {
      const response = await getCustomersByRegistrationYear(year);
      setYearlyCustomers(response.data);
    } catch (error) {
      console.error("Error fetching yearly customers:", error);
      message.error("연도별 고객 목록을 불러오는데 실패했습니다");
    }
  };

  const handleSearch = (values) => {
    const searchFilters = {
      ...DEFAULT_FILTERS,
      ...values,
      registrationDateStart:
        values.registrationDateRange?.[0]?.format("YYYY-MM-DD") || "",
      registrationDateEnd:
        values.registrationDateRange?.[1]?.format("YYYY-MM-DD") || "",
      birthDateStart: values.birthDateRange?.[0]?.format("YYYY-MM-DD") || "",
      birthDateEnd: values.birthDateRange?.[1]?.format("YYYY-MM-DD") || "",
    };

    setFilters(searchFilters);
    setPage(1);
    updateQueryParams(searchFilters, 1);
  };

  const resetSearch = () => {
    searchForm.resetFields();
    searchForm.setFieldsValue({ status: DEFAULT_FILTERS.status });
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    updateQueryParams(DEFAULT_FILTERS, 1);
  };

  const clearFilter = (filterName) => {
    const newFilters = { ...filters };
    if (filterName === "registrationDateRange") {
      newFilters.registrationDateStart = "";
      newFilters.registrationDateEnd = "";
      searchForm.setFieldValue("registrationDateRange", null);
    } else if (filterName === "birthDateRange") {
      newFilters.birthDateStart = "";
      newFilters.birthDateEnd = "";
      searchForm.setFieldValue("birthDateRange", null);
    } else {
      newFilters[filterName] = "";
      searchForm.setFieldValue(filterName, undefined);
    }

    setFilters(newFilters);
    updateQueryParams(newFilters);
    fetchCustomers(page, newFilters);
  };

  const renderActiveFilters = () => {
    const activeFilters = [];

    if (filters.name) {
      activeFilters.push(
        <Tag key="name" closable onClose={() => clearFilter("name")}>
          이름: {filters.name}
        </Tag>
      );
    }
    if (filters.memberCode) {
      activeFilters.push(
        <Tag
          key="memberCode"
          closable
          onClose={() => clearFilter("memberCode")}
        >
          회원코드: {filters.memberCode}
        </Tag>
      );
    }
    if (filters.status) {
      activeFilters.push(
        <Tag key="status" closable onClose={() => clearFilter("status")}>
          상태: {filters.status}
        </Tag>
      );
    }
    if (filters.classroom) {
      activeFilters.push(
        <Tag key="classroom" closable onClose={() => clearFilter("classroom")}>
          교실: {filters.classroom}
        </Tag>
      );
    }
    if (filters.group) {
      activeFilters.push(
        <Tag key="group" closable onClose={() => clearFilter("group")}>
          그룹: {filters.group}
        </Tag>
      );
    }
    if (filters.doctorId) {
      const doctor = doctors.find((t) => t.id === filters.doctorId);
      activeFilters.push(
        <Tag key="doctorId" closable onClose={() => clearFilter("doctorId")}>
          담당 의사: {doctor?.name || filters.doctorId}
        </Tag>
      );
    }
    if (filters.registrationDateStart || filters.registrationDateEnd) {
      activeFilters.push(
        <Tag
          key="registrationDate"
          closable
          onClose={() => clearFilter("registrationDateRange")}
        >
          등록일: {filters.registrationDateStart} ~{" "}
          {filters.registrationDateEnd}
        </Tag>
      );
    }
    if (filters.birthDateStart || filters.birthDateEnd) {
      activeFilters.push(
        <Tag
          key="birthDate"
          closable
          onClose={() => clearFilter("birthDateRange")}
        >
          생년월일: {filters.birthDateStart} ~ {filters.birthDateEnd}
        </Tag>
      );
    }

    return activeFilters.length > 0 ? (
      <div style={{ marginTop: 8 }}>
        <Space size={[0, 8]} wrap>
          {activeFilters}
        </Space>
      </div>
    ) : null;
  };

  const monthCellRender = (value) => {
    const year = value.year();
    const month = value.month() + 1;
    const formattedMonth = month < 10 ? `0${month}` : `${month}`;

    const customersInMonth = yearlyCustomers.filter(
      (customer) =>
        dayjs(customer.registrationDate).format("YYYY-MM") === `${year}-${formattedMonth}`
    );

    if (customersInMonth.length === 0) return null;

    return (
      <div className="notes-month">
        <section>
          <div className="register-count">
            {month}월: {customersInMonth.length}명
          </div>
          <ul className="events">
            {customersInMonth.map((customer) => (
              <li key={customer.id} style={{ whiteSpace: "nowrap" }}>
                {customer.name}
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  };

  const getListData = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    return calendarCustomers
      .filter(
        (customer) =>
          dayjs(customer.registrationDate).format("YYYY-MM-DD") === dateStr
      )
      .map((customer) => ({
        type: "success",
        content: `${customer.name}`,
        customer: customer,
      }));
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="events" style={{ listStyle: "none", padding: 0 }}>
        {listData.map((item) => (
          <li
            key={item.content}
            onClick={(e) => {
              e.stopPropagation();
              showEditModal(item.customer);
            }}
            style={{ cursor: "pointer", padding: "5px", borderRadius: "5px" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f0f0f0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  const cellRender = (current, info) => {
    if (info.type === "date") return dateCellRender(current);
    if (info.type === "month") return monthCellRender(current);
    return info.originNode;
  };

  const handleCalendarChange = (date, mode) => {
    if (mode === "month") {
      fetchCalendarCustomers(date);
    }
  };

  const fetchCalendarCustomers = async (date) => {
    try {
      const year = date.year();
      const month = date.month() + 1;
      const response = await getCustomersByRegistrationMonth(year, month);
      setCalendarCustomers(response.data);
    } catch (error) {
      console.error("Error fetching calendar customers:", error);
      message.error("월별 고객 목록을 불러오는데 실패했습니다");
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: "회원코드",
      dataIndex: "memberCode",
      key: "memberCode",
      width: 50,
    },
    {
      title: "이름(일문)",
      dataIndex: "name",
      key: "name",
      width: 90,
      render: (name, record) => (
        <Space>
          {name}
          <Tooltip
            title={record.customerId ? "고객 ID 등록됨" : "고객 ID 미등록"}
          >
            {record.customerId ? (
              <IdcardTwoTone
                twoToneColor="#52c41a"
                style={{ fontSize: "16px" }}
              />
            ) : (
              <IdcardOutlined style={{ color: "#d9d9d9", fontSize: "16px" }} />
            )}
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "이름(한글)",
      dataIndex: "koreanName",
      key: "koreanName",
      width: 90,
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "수강 코스",
      dataIndex: "courseId",
      key: "course",
      width: 150,
      render: (courseId) => {
        const course = courses.find((c) => c.id === courseId);
        if (!course) return "-";
        return (
          <Tooltip title={`₩${course.price.toLocaleString()}`}>
            {course.name}
          </Tooltip>
        );
      },
    },
    {
      title: "교실",
      dataIndex: "classroom",
      key: "classroom",
      width: 70,
    },
    {
      title: "그룹",
      dataIndex: "group",
      key: "group",
      width: 70,
    },
    {
      title: "담당 의사",
      dataIndex: "doctors",
      key: "doctors",
      width: 90,
      render: (doctors) => (
        <Space>
          {doctors?.map((doctor) => (
            <DoctorTag key={doctor.id} doctor={doctor} />
          ))}
        </Space>
      ),
    },
    {
      title: "전화번호",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 110,
      render: (phoneNumber) => formatPhoneNumber(phoneNumber),
    },
    {
      title: "나이",
      dataIndex: "birthDate",
      key: "age",
      width: 60,
      render: (birthDate) => (birthDate ? `${calculateAge(birthDate)}세` : ""),
    },
    {
      title: "등록일",
      dataIndex: "registrationDate",
      key: "registrationDate",
      width: 90,
      render: (date) =>
        dayjs(date).isValid() ? dayjs(date).format("YYYY-MM-DD") : "",
    },
  ];

  const handleDeleteCustomer = async (customer) => {
    if (!checkPermission("canDelete")) {
      Modal.error({
        title: "권한 없음",
        content: "고객 삭제 권한이 없습니다.",
      });
      return;
    }

    Modal.confirm({
      title: "고객 삭제",
      content: `${customer.name} 고객을 삭제하시겠습니까?`,
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      onOk: async () => {
        try {
          await deleteCustomer(customer.id);
          message.success("고객이 삭제되었습니다");
          fetchCustomers();
        } catch (error) {
          console.error("Error deleting customer:", error);
          message.error("고객 삭제에 실패했습니다");
        }
      },
    });
  };

  useEffect(() => {
    fetchCustomers(page, filters);
  }, [page, filters]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await getDoctorList(1, 1000);
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      message.error("의사 목록을 불러오는데 실패했습니다");
    }
  };

  // API calls
  const fetchCustomers = async (
    currentPage = page,
    currentFilters = filters
  ) => {
    setLoading(true);
    try {
      const response = await getCustomerList(currentPage, PAGE_SIZE, currentFilters);
      setCustomers(response.data.data || []);
      setMetadata({
        totalCount: response.data.totalCount || 0,
        totalPage: response.data.totalPage || 0,
      });
    } catch (error) {
      console.error("Error fetching customers:", error);
      message.error("고객 목록을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const showEditModal = (customer) => {
    if (!checkPermission("canUpdate")) {
      Modal.error({
        title: "권한 없음",
        content: "고객 수정 권한이 없습니다.",
      });
      return;
    }

    setSelectedCustomer(customer);
    setEditModalVisible(true);
    form.setFieldsValue({
      ...customer,
      registrationDate: dayjs(customer.registrationDate).isValid()
        ? dayjs(customer.registrationDate)
        : null,
      birthDate: dayjs(customer.birthDate).isValid()
        ? dayjs(customer.birthDate)
        : null,
      deadline: dayjs(customer.deadline).isValid()
        ? dayjs(customer.deadline)
        : null,
    });
  };

  // Event handlers
  const handleEdit = async (values) => {
    try {
      await updateCustomer(selectedCustomer.id, formatDateValues(values));
      message.success("고객 정보가 수정되었습니다");
      setEditModalVisible(false);
      form.resetFields();
      fetchCustomers();
    } catch (error) {
      message.error("고객 정보 수정에 실패했습니다");
    }
  };

  const handleRegister = async (values) => {
    try {
      await createCustomer(formatDateValues(values));
      message.success("고객이 등록되었습니다");
      setRegisterModalVisible(false);
      registerForm.resetFields();
      fetchCustomers();
    } catch (error) {
      message.error("고객 등록에 실패했습니다");
    }
  };

  // Form rendering
  const renderCustomerForm = (formInstance, onFinish, isEdit = false) => (
    <Form
      form={formInstance}
      layout="vertical"
      onFinish={onFinish}
      style={{
        background: "#fff",
        padding: isMobile ? "16px 0" : "32px",
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
              <Input type="number" disabled={isEdit} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item name="status" label="상태">
              <Select>
                <Option value="방문중">방문중</Option>
                <Option value="탈퇴">탈퇴</Option>
                <Option value="그룹대기">그룹대기</Option>
                <Option value="휴면">휴면</Option>
                <Option value="회수권">회수권</Option>
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
          <Col span={8}>
            <Form.Item name="customerId" label="Customer ID (Square)">
              <Input placeholder="Customer ID (Square)를 입력하세요" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="doctors" label="담당 의사">
              <Select mode="multiple" placeholder="담당 의사를 선택하세요">
                {doctors.map((doctor) => (
                  <Option key={doctor.id} value={doctor.id}>
                    {doctor.name}
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
          style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
        >
          <Button
            onClick={() =>
              isEdit
                ? setEditModalVisible(false)
                : setRegisterModalVisible(false)
            }
          >
            취소
          </Button>
          <Button type="primary" htmlType="submit">
            {isEdit ? "수정" : "등록"}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  useEffect(() => {
    let count = 0;
    if (filters.name) count++;
    if (filters.memberCode) count++;
    if (filters.status) count++;
    if (filters.classroom) count++;
    if (filters.group) count++;
    if (filters.doctorId) count++;
    if (filters.registrationDateStart || filters.registrationDateEnd) count++;
    if (filters.birthDateStart || filters.birthDateEnd) count++;
    setActiveFilters(count);
  }, [filters]);

  const handleRowClick = (record) => {
    if (record && record.id) {
      if (!checkPermission("canRead")) {
        Modal.error({
          title: "권한 없음",
          content: "고객 정보 조회 권한이 없습니다.",
        });
        return;
      }
      navigate(`/customer/${record.id}`);
    }
  };

  const handleRegisterClick = () => {
    if (!checkPermission("canCreate")) {
      Modal.error({
        title: "권한 없음",
        content: "고객 등록 권한이 없습니다.",
      });
      return;
    }
    setRegisterModalVisible(true);
    registerForm.resetFields();
  };

  // 코스 목록을 불러오는 함수
  const fetchCourses = async () => {
    try {
      const response = await getCourseList(1, 100);
      if (response) {
        const sortedCourses = [...response.data].sort((a, b) => b.id - a.id);
        setCourses(sortedCourses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("코스 목록을 불러오는데 실패했습니다");
    }
  };

  // 컴포넌트 마운트 시 코스 목록 불러오기
  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div style={{ padding: isMobile ? "0" : "0 0 12px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
          position: "relative",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          고객 관리 {!loading && `(${metadata.totalCount}명)`}
        </Title>
        <div style={{ position: "absolute", right: 0 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleRegisterClick}
            style={{ marginRight: 8 }}
          >
            {isMobile ? "" : "고객 등록"}
          </Button>
        </div>
      </div>
      <Divider />

      {!isMobile && (
        <Card
          style={{
            marginBottom: 16,
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            borderRadius: "8px",
          }}
          styles={{ body: { padding: "16px 24px" } }}
        >
          <Form form={searchForm} onFinish={handleSearch} layout="inline">
            <Form.Item name="name" style={{ marginBottom: 8 }}>
              <Input
                placeholder="이름 검색"
                prefix={<SearchOutlined />}
                allowClear
              />
            </Form.Item>
            <Form.Item name="memberCode" style={{ marginBottom: 8 }}>
              <Input placeholder="회원코드" allowClear />
            </Form.Item>
            <Form.Item name="status" style={{ marginBottom: 8 }}>
              <Select placeholder="상태" style={{ width: 120 }} allowClear>
                <Option value="방문중">방문중</Option>
                <Option value="탈퇴">탈퇴</Option>
                <Option value="그룹대기">그룹대기</Option>
                <Option value="휴면">휴면</Option>
                <Option value="회수권">회수권</Option>
              </Select>
            </Form.Item>
            <Form.Item name="classroom" style={{ marginBottom: 8 }}>
              <Input placeholder="교실" allowClear />
            </Form.Item>
            <Form.Item name="group" style={{ marginBottom: 8 }}>
              <Input placeholder="그룹" allowClear />
            </Form.Item>
            <Form.Item name="doctorId" style={{ marginBottom: 8 }}>
              <Select
                placeholder="담당 의사"
                style={{ width: 120 }}
                allowClear
              >
                {doctors.map((doctor) => (
                  <Option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="registrationDateRange" style={{ marginBottom: 8 }}>
              <RangePicker
                placeholder={["등록 시작일", "등록 종료일"]}
                allowClear
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 8 }}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                >
                  검색
                </Button>
                {activeFilters > 0 && (
                  <Badge count={activeFilters}>
                    <Button onClick={resetSearch}>초기화</Button>
                  </Badge>
                )}
              </Space>
            </Form.Item>
          </Form>
          {renderActiveFilters()}
        </Card>
      )}

      <Tabs
        activeKey={searchParams.get("tab") || "1"}
        onChange={(key) => {
          setSearchParams({ ...Object.fromEntries(searchParams), tab: key });
          if (key === "2") {
            const currentDate = dayjs();
            fetchCalendarCustomers(currentDate);
            fetchYearlyCustomers(currentDate.format("YYYY"));
          }
        }}
        items={[
          {
            key: "1",
            label: "고객 목록",
            children: (
              <Card>
                {!isMobile && (
                  <Row justify="end" style={{ marginBottom: 16 }}>
                    <Pagination
                      current={page}
                      total={metadata.totalCount}
                      pageSize={PAGE_SIZE}
                      onChange={(newPage) => {
                        setPage(newPage);
                        updateQueryParams(filters, newPage);
                      }}
                      showSizeChanger={false}
                      showTotal={(total, range) =>
                        `${range[0]}-${range[1]} / ${total}`
                      }
                    />
                  </Row>
                )}
                {isMobile ? (
                  <>
                    <List
                      dataSource={customers}
                      loading={loading}
                      renderItem={(customer) => (
                        <List.Item
                          onClick={() => handleRowClick(customer)}
                          style={{ cursor: "pointer" }}
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                {customer.name}
                                {customer.koreanName &&
                                  `(${customer.koreanName})`}
                                <Tag
                                  color={
                                    STATUS_COLORS[customer.status] || "default"
                                  }
                                >
                                  {customer.status}
                                </Tag>
                              </Space>
                            }
                            description={
                              <Space direction="vertical" size="small">
                                <Space>
                                  {customer.doctors?.map((doctor) => (
                                    <DoctorTag
                                      key={doctor.id}
                                      doctor={doctor}
                                    />
                                  ))}
                                </Space>
                                <div>{customer.phoneNumber}</div>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                    <Row justify="center" style={{ marginTop: 16 }}>
                      <Pagination
                        current={page}
                        total={metadata.totalCount}
                        pageSize={PAGE_SIZE}
                        onChange={(newPage) => {
                          setPage(newPage);
                          updateQueryParams(filters, newPage);
                        }}
                        showSizeChanger={false}
                        size="small"
                      />
                    </Row>
                  </>
                ) : (
                  <Table
                    columns={columns}
                    dataSource={customers}
                    loading={loading}
                    rowKey="id"
                    pagination={false}
                    onRow={(record) => ({
                      onClick: () => handleRowClick(record),
                    })}
                    style={{ cursor: "pointer" }}
                    size="small"
                  />
                )}
              </Card>
            ),
          },
          !isMobile && {
            key: "2",
            label: "등록자 현황",
            children: (
              <div style={{ flex: 1, overflow: "auto" }}>
                <Calendar
                  cellRender={cellRender}
                  style={{ height: "calc(100vh - 180px)" }}
                  onChange={(date) => {
                    fetchCalendarCustomers(date);
                  }}
                  onPanelChange={(date, mode) => {
                    if (mode === "year") {
                      fetchYearlyCustomers(date.format("YYYY"));
                    }
                  }}
                />
              </div>
            ),
          },
        ].filter(Boolean)}
      />

      <Modal
        title="고객 등록"
        open={registerModalVisible}
        onCancel={() => setRegisterModalVisible(false)}
        footer={null}
        width={1000}
        style={{ top: 20 }}
      >
        {renderCustomerForm(registerForm, handleRegister)}
      </Modal>

      <Modal
        title="고객 정보 수정"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={1000}
        style={{ top: 20 }}
      >
        {renderCustomerForm(form, handleEdit)}
      </Modal>
    </div>
  );
};

export default ManageCustomerPage;
