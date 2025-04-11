import React, { useState, useEffect } from "react";
import {
  Typography,
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Divider,
  Row,
  Col,
  Pagination,
  Space,
  Card,
  Badge,
  AutoComplete,
  Tag,
  InputNumber,
  List,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  FileAddOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import StudentTag from "../../components/molecules/StudentTag";
import {
  getStudentPaymentList,
  updateStudentPayment,
  deleteStudentPayment,
  uploadPayments,
  searchStudents,
  getCourseList,
} from "../../api/crm";
import { useMediaQuery } from "react-responsive";
import { usePermission } from "../../hooks/usePermission";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const PAGE_SIZE = 20;

const PaymentManagementPage = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [page, setPage] = useState(1);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState({
    totalCount: 0,
    totalPage: 0,
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [courses, setCourses] = useState([]);

  const currentDate = dayjs();
  const startOfMonth = currentDate.startOf("month").format("YYYY-MM-DD");
  const endOfMonth = currentDate.endOf("month").format("YYYY-MM-DD");

  const [searchParams, setSearchParams] = useState({
    startDate: startOfMonth,
    endDate: endOfMonth,
    paymentMethod: null,
    monthOfClass: null,
    customerName: null,
  });

  const [activeFilters, setActiveFilters] = useState(1);
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const { checkPermission } = usePermission("MENU002");

  const generatePayload = (jsonData) => {
    return jsonData.map((row) => ({
      paymentDate: new Date(Math.floor((row.Date - 25569) * 86400 * 1000)),
      amount: Number(
        row["Gross Sales"].replace("¥", "").replace(",", "").trim()
      ),
      actualPayment: Number(
        row["Total Collected"]
          .replace("¥", "")
          .replace(",", "")
          .replace("(", "")
          .replace(")", "")
          .trim()
      ),
      refundAmount: Number(
        row["Partial Refunds"]
          .replace("¥", "")
          .replace(",", "")
          .replace("(", "")
          .replace(")", "")
          .trim()
      ),
      paymentMethod: row["Card"] !== "¥0" ? "카드" : "현금",
      customerName: row["Customer Name"],
      eventType: row["Event Type"],
      customerId: row["Customer ID"],
      memo: row["Description"],
      transactionId: row["Transaction ID"],
      paymentId: row["Payment ID"],
      monthOfClass: dayjs(
        new Date(Math.floor((row.Date - 25569) * 86400 * 1000))
      ).format("YYYY-MM"),
    }));
  };

  const handleStudentSearch = async (value) => {
    if (!value || value.length < 2) {
      setStudentOptions([]);
      return;
    }

    try {
      const response = await searchStudents(value);
      const students = response.data.data;

      setStudentOptions(
        students.map((student) => ({
          value: student.id,
          label: (
            <div style={{ padding: "8px 0" }}>
              <StudentTag student={student} clickable={false} />
            </div>
          ),
          student: student,
        }))
      );
    } catch (error) {
      console.error("학생 검색 중 오류:", error);
      message.error("학생 검색 중 오류가 발생했습니다");
    }
  };

  const handleStudentSelect = (value, option) => {
    setSelectedStudent(option.student);
    form.setFieldsValue({
      studentId: option.student.id,
    });
  };

  const handleFileUpload = async (e) => {
    try {
      const file = e.target.files[0];
      const reader = new FileReader();
      const fileType = file.name.split(".").pop().toLowerCase();

      reader.onload = async (e) => {
        let data;
        if (fileType === "csv") {
          data = e.target.result;
        } else {
          data = new Uint8Array(e.target.result);
        }

        const workbook = XLSX.read(data, {
          type: fileType === "csv" ? "string" : "array",
        });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const payload = generatePayload(jsonData);

        try {
          await uploadPayments({ payments: payload });
          message.success("파일이 성공적으로 업로드되었습니다.");
          fetchPayments();
        } catch (error) {
          console.error("파일 업로드 중 오류:", error);
          message.error("파일 업로드 중 오류가 발생했습니다.");
        }
      };

      if (fileType === "csv") {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    } catch (error) {
      console.error("파일 읽기 중 오류:", error);
      message.error("파일을 읽는 중 오류가 발생했습니다.");
    }
  };

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

  useEffect(() => {
    fetchCourses();
  }, []);

  const columns = [
    {
      title: "거래 ID",
      dataIndex: "transactionId",
      key: "transactionId",
      width: 100,
      render: (text) => (
        <Typography.Text copyable style={{ fontSize: "12px" }}>
          {text ? text.slice(0, 8) : "-"}
        </Typography.Text>
      ),
    },
    {
      title: "결제일",
      dataIndex: "paymentDate",
      key: "paymentDate",
      width: 100,
      render: (text) => dayjs(text).format("YYYY/MM/DD"),
    },
    {
      title: "거래 유형",
      dataIndex: "eventType",
      key: "eventType",
      align: "center",
      width: 80,
      render: (text) => (
        <Tag color={text === "Refund" ? "error" : "success"}>
          {text === "Refund" ? "환불" : "결제"}
        </Tag>
      ),
    },
    {
      title: "결제 금액",
      dataIndex: "actualPayment",
      key: "actualPayment",
      width: 120,
      render: (text, record) => (
        <Typography.Text
          style={{
            fontWeight: "bold",
            color: record.eventType === "Refund" ? "#f5222d" : "#389e0d",
          }}
        >
          {record.eventType === "Refund" ? "-" : ""}¥
          {Math.abs(text).toLocaleString()}
        </Typography.Text>
      ),
    },
    {
      title: "결제 방식",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 100,
      render: (text) => <Tag color="default">{text}</Tag>,
    },
    {
      title: "정가/환불",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (text, record) => {
        if (record.eventType === "Refund" && record.refundAmount) {
          return (
            <Typography.Text type="secondary">
              환불: ¥{record.refundAmount.toLocaleString()}
            </Typography.Text>
          );
        }
        if (text && text !== record.actualPayment) {
          return (
            <Typography.Text type="secondary">
              정가: ¥{text.toLocaleString()}
            </Typography.Text>
          );
        }
        return "-";
      },
    },
    {
      title: "학생 정보",
      dataIndex: "student",
      key: "student",
      width: 250,
      render: (_, record) =>
        record.student && <StudentTag student={record.student} />,
    },
    {
      title: "교실/그룹",
      dataIndex: "classroom",
      key: "classroom",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tag color="processing">{record.classroom}</Tag>
          {record.student?.group && (
            <Tag color="default">{record.student.group}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "수업월",
      dataIndex: "monthOfClass",
      key: "monthOfClass",
      width: 80,
      render: (text) => (text ? dayjs(text).format("YY.MM") : "-"),
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
      title: "메모",
      dataIndex: "memo",
      key: "memo",
      ellipsis: true,
      render: (text) => (
        <Typography.Text
          ellipsis={{ tooltip: text }}
          style={{ color: text ? "rgba(0, 0, 0, 0.85)" : "#ccc" }}
        >
          {text || "메모 없음"}
        </Typography.Text>
      ),
    },
  ];

  const handleRegisterClick = () => {
    if (!checkPermission("canCreate")) {
      Modal.error({
        title: "권한 없음",
        content: "결제 등록 권한이 없습니다.",
      });
      return;
    }
    navigate("/payment/register");
  };

  const showEditModal = (payment) => {
    if (!checkPermission("canUpdate")) {
      Modal.error({
        title: "권한 없음",
        content: "결제 정보 수정 권한이 없습니다.",
      });
      return;
    }
    setSelectedPayment(payment);
    setSelectedStudent(payment.student);
    form.setFieldsValue({
      ...payment,
      paymentDate: dayjs(payment.paymentDate),
      studentId: payment.student?.id,
      monthOfClass: payment.monthOfClass
        ? dayjs(payment.monthOfClass).format("YY.MM")
        : null,
    });
    setEditModalVisible(true);
  };

  const handleEdit = async (values) => {
    try {
      if (!selectedPayment) return;

      const monthOfClass = values.monthOfClass
        ? `20${values.monthOfClass.substring(
            0,
            2
          )}-${values.monthOfClass.substring(3, 5)}`
        : null;

      const payload = {
        paymentDate: dayjs(values.paymentDate).format("YYYY-MM-DD"),
        amount: Number(values.amount),
        actualPayment: Number(values.actualPayment),
        paymentMethod: values.paymentMethod,
        memberCode: values.memberCode,
        customerId: values.customerId,
        memo: values.memo,
        monthOfClass: monthOfClass,
        studentId: values.studentId,
        courseId: values.courseId,
      };

      await updateStudentPayment(selectedPayment.key, payload);
      message.success("결제 정보가 수정되었습니다.");
      setEditModalVisible(false);
      fetchPayments();
    } catch (error) {
      console.error("수정 중 오류:", error);
      message.error("수정 중 오류가 발생했습니다.");
    }
  };

  const handleSearch = (values) => {
    // monthOfClass가 YY.MM 형식인지 확인하고 처리
    let monthOfClass = null;
    if (values.monthOfClass) {
      try {
        const monthParts = values.monthOfClass.split(".");
        if (
          monthParts.length === 2 &&
          monthParts[0].length === 2 &&
          monthParts[1].length === 2
        ) {
          monthOfClass = `20${monthParts[0]}-${monthParts[1]}`;
        }
      } catch (error) {
        console.error("monthOfClass 형식 오류:", error);
      }
    }

    // 날짜 범위 검증
    let startDate = startOfMonth;
    let endDate = endOfMonth;

    if (
      values.dateRange &&
      Array.isArray(values.dateRange) &&
      values.dateRange.length === 2
    ) {
      if (values.dateRange[0] && dayjs(values.dateRange[0]).isValid()) {
        startDate = values.dateRange[0].format("YYYY-MM-DD");
      }

      if (values.dateRange[1] && dayjs(values.dateRange[1]).isValid()) {
        endDate = values.dateRange[1].format("YYYY-MM-DD");
      }
    }

    const params = {
      startDate: startDate,
      endDate: endDate,
      paymentMethod: values.paymentMethod || null,
      monthOfClass: monthOfClass,
      customerName: values.customerName || null,
    };

    console.log("검색 파라미터:", params);

    const activeFilterCount = Object.values(params).filter(
      (value) =>
        value !== null && value !== startOfMonth && value !== endOfMonth
    ).length;

    // 날짜 범위가 기본값이 아닌 경우에만 카운트에 포함
    if (startDate !== startOfMonth || endDate !== endOfMonth) {
      setActiveFilters(activeFilterCount + 1);
    } else {
      setActiveFilters(activeFilterCount);
    }

    setSearchParams(params);
    setPage(1);

    // URL 파라미터 업데이트
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null) {
        urlParams.set(key, value);
      }
    });

    // 페이지 값 초기화
    urlParams.delete("page");

    navigate({
      pathname: location.pathname,
      search: urlParams.toString(),
    });

    fetchPayments(1, params);
  };

  const handleReset = () => {
    searchForm.resetFields();
    const emptyParams = {
      startDate: startOfMonth,
      endDate: endOfMonth,
      paymentMethod: null,
      monthOfClass: null,
      customerName: null,
    };
    setSearchParams(emptyParams);
    setActiveFilters(0);
    setPage(1);
    navigate({
      pathname: location.pathname,
      search: new URLSearchParams(emptyParams).toString(),
    });
    fetchPayments(1, emptyParams);
  };

  const handleRemoveFilter = (filterName) => {
    const newParams = { ...searchParams };
    if (filterName === "dateRange") {
      newParams.startDate = startOfMonth;
      newParams.endDate = endOfMonth;
      searchForm.setFieldValue("dateRange", [
        dayjs(startOfMonth),
        dayjs(endOfMonth),
      ]);
    } else {
      newParams[filterName] = null;
      searchForm.setFieldValue(filterName, null);
    }

    const activeFilterCount = Object.values(newParams).filter(
      (value) => value !== null
    ).length;
    setActiveFilters(activeFilterCount);

    setSearchParams(newParams);
    setPage(1);
    navigate({
      pathname: location.pathname,
      search: new URLSearchParams(newParams).toString(),
    });
    fetchPayments(1, newParams);
  };

  const fetchPayments = async (currentPage = page, params = searchParams) => {
    try {
      setLoading(true);

      // 파라미터 유효성 검사 및 로깅
      console.log("fetchPayments 호출:", { currentPage, params });

      // 날짜 형식 검증
      if (params.startDate && !dayjs(params.startDate).isValid()) {
        console.error("시작일 형식 오류:", params.startDate);
        params.startDate = startOfMonth;
      }

      if (params.endDate && !dayjs(params.endDate).isValid()) {
        console.error("종료일 형식 오류:", params.endDate);
        params.endDate = endOfMonth;
      }

      const paymentResponse = await getStudentPaymentList(
        currentPage,
        PAGE_SIZE,
        params
      );
      const formattedPayments = paymentResponse.data.data.map((payment) => ({
        key: payment.id,
        paymentDate: payment.paymentDate,
        amount: payment.amount,
        actualPayment: payment.actualPayment,
        paymentMethod: payment.paymentMethod,
        memberCode: payment.memberCode,
        customerId: payment.customerId,
        memo: payment.memo,
        eventType: payment.eventType,
        transactionId: payment.transactionId,
        paymentId: payment.paymentId,
        refundAmount: payment.refundAmount,
        monthOfClass: payment.monthOfClass,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        student: payment.student,
        courseId: payment.courseId,
      }));

      setPayments(formattedPayments);
      setMetadata({
        totalCount: paymentResponse.data.total,
        totalPage: Math.ceil(paymentResponse.data.total / PAGE_SIZE),
      });
    } catch (error) {
      message.error("결제 목록을 불러오는데 실패했습니다.");
      console.error("결제 목록 조회 오류:", error);
      // 오류 시 빈 배열 설정
      setPayments([]);
      setMetadata({
        totalCount: 0,
        totalPage: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // URL 파라미터에서 초기 상태 설정
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const startDateParam = urlParams.get("startDate");
    const endDateParam = urlParams.get("endDate");
    const pageParam = urlParams.get("page");

    // 날짜 유효성 검사
    const validStartDate =
      startDateParam && dayjs(startDateParam).isValid()
        ? startDateParam
        : startOfMonth;

    const validEndDate =
      endDateParam && dayjs(endDateParam).isValid() ? endDateParam : endOfMonth;

    const initialParams = {
      startDate: validStartDate,
      endDate: validEndDate,
      paymentMethod: urlParams.get("paymentMethod") || null,
      monthOfClass: urlParams.get("monthOfClass") || null,
      customerName: urlParams.get("customerName") || null,
    };

    console.log("URL 파라미터에서 초기 상태 설정:", initialParams);

    setSearchParams(initialParams);

    // URL에 페이지 정보가 있으면 페이지 설정
    if (pageParam) {
      const parsedPage = parseInt(pageParam);
      if (!isNaN(parsedPage) && parsedPage > 0) {
        setPage(parsedPage);
      }
    } else {
      // 검색 조건이 변경되면 1페이지로 리셋
      setPage(1);
    }

    // 폼 값 설정
    searchForm.setFieldsValue({
      dateRange: [dayjs(validStartDate), dayjs(validEndDate)],
      paymentMethod: initialParams.paymentMethod,
      monthOfClass: initialParams.monthOfClass
        ? dayjs(initialParams.monthOfClass).format("YY.MM")
        : "",
      customerName: initialParams.customerName || "",
    });

    // 초기 데이터 로드 (URL에 페이지 정보가 있으면 해당 페이지, 없으면 1페이지)
    fetchPayments(pageParam ? parseInt(pageParam) : 1, initialParams);
  }, [location.search]);

  // 렌더링 최적화: 페이지 변경 효과는 이제 URL 변경을 통해 처리되므로 별도의 useEffect 불필요

  const handlePaginationChange = (newPage) => {
    setPage(newPage);
    // URL에 페이지 정보 추가하면서 기존 검색 파라미터 유지
    const params = new URLSearchParams(location.search);
    params.set("page", newPage);

    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: true }
    ); // replace를 사용해 브라우저 히스토리에 많은 항목이 쌓이지 않도록 함
  };

  const handleMonthOfClassChange = (e) => {
    const value = e.target.value;
    if (!value) return;

    // YY.MM 형식인지 확인
    const regex = /^\d{2}\.\d{2}$/;
    if (!regex.test(value)) {
      return;
    }

    // 형식이 맞으면 필드 값 업데이트
    searchForm.setFieldsValue({
      monthOfClass: value,
    });
  };

  const handleDeletePayment = (payment) => {
    if (!checkPermission("canDelete")) {
      Modal.error({
        title: "권한 없음",
        content: "결제 삭제 권한이 없습니다.",
      });
      return;
    }
    setDeletingPayment(payment);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteStudentPayment(deletingPayment.key);
      message.success("결제 정보가 삭제되었습니다.");
      setDeleteModalVisible(false);
      setEditModalVisible(false);

      // 현재 페이지의 아이템이 1개뿐이었다면 이전 페이지로 이동
      if (payments.length === 1 && page > 1) {
        handlePaginationChange(page - 1);
      } else {
        fetchPayments(page, searchParams);
      }
    } catch (error) {
      console.error("삭제 중 오류:", error);
      message.error("삭제 중 오류가 발생했습니다.");
    }
  };

  const renderActiveFilters = () => {
    const filters = [];

    if (
      (searchParams.startDate && searchParams.startDate !== startOfMonth) ||
      (searchParams.endDate && searchParams.endDate !== endOfMonth)
    ) {
      filters.push(
        <Tag
          key="dateRange"
          closable
          onClose={() => handleRemoveFilter("dateRange")}
          style={{ marginBottom: 8 }}
        >
          기간: {dayjs(searchParams.startDate).format("YYYY/MM/DD")} ~{" "}
          {dayjs(searchParams.endDate).format("YYYY/MM/DD")}
        </Tag>
      );
    }

    if (searchParams.paymentMethod) {
      filters.push(
        <Tag
          key="paymentMethod"
          closable
          onClose={() => handleRemoveFilter("paymentMethod")}
          style={{ marginBottom: 8 }}
        >
          결제방식: {searchParams.paymentMethod}
        </Tag>
      );
    }

    if (searchParams.monthOfClass) {
      filters.push(
        <Tag
          key="monthOfClass"
          closable
          onClose={() => handleRemoveFilter("monthOfClass")}
          style={{ marginBottom: 8 }}
        >
          수업월: {dayjs(searchParams.monthOfClass).format("YY.MM")}
        </Tag>
      );
    }

    if (searchParams.customerName) {
      filters.push(
        <Tag
          key="customerName"
          closable
          onClose={() => handleRemoveFilter("customerName")}
          style={{ marginBottom: 8 }}
        >
          이름: {searchParams.customerName}
        </Tag>
      );
    }

    return filters;
  };

  const renderMobileList = () => (
    <List
      dataSource={payments}
      loading={loading}
      renderItem={(payment) => (
        <List.Item
          onClick={() => showEditModal(payment)}
          style={{ cursor: "pointer" }}
        >
          <List.Item.Meta
            title={
              <Space>
                <Tag
                  color={payment.eventType === "Refund" ? "error" : "success"}
                >
                  {payment.eventType === "Refund" ? "환불" : "결제"}
                </Tag>
              </Space>
            }
            description={
              <Space direction="vertical" size="small">
                <Space>
                  <span style={{ color: "#666" }}>결제일:</span>
                  {dayjs(payment.paymentDate).format("YYYY/MM/DD")}
                </Space>
                <Space>
                  <span style={{ color: "#666" }}>금액:</span>
                  <span
                    style={{
                      color:
                        payment.eventType === "Refund" ? "#ff4d4f" : "#52c41a",
                    }}
                  >
                    ¥{payment.actualPayment?.toLocaleString() || 0}
                  </span>
                </Space>
                <Space>
                  <span style={{ color: "#666" }}>결제방식:</span>
                  {payment.paymentMethod}
                </Space>
                {payment.monthOfClass && (
                  <Space>
                    <span style={{ color: "#666" }}>수업월:</span>
                    {payment.monthOfClass}
                  </Space>
                )}
                {payment.transactionId && (
                  <Space>
                    <span style={{ color: "#666" }}>거래 ID:</span>
                    <span style={{ fontFamily: "monospace" }}>
                      {payment.transactionId}
                    </span>
                  </Space>
                )}
              </Space>
            }
          />
        </List.Item>
      )}
      pagination={{
        current: page,
        total: metadata.totalCount,
        pageSize: PAGE_SIZE,
        onChange: handlePaginationChange,
        size: "small",
        style: { textAlign: "center", marginTop: 16 },
      }}
    />
  );

  return (
    <div style={{ padding: isMobile ? 0 : "20px" }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            style={{
              borderRadius: isMobile ? 0 : undefined,
              border: isMobile ? "none" : undefined,
            }}
            styles={{ body: { padding: isMobile ? 0 : 24 } }}
          >
            <Row
              justify="space-between"
              align="middle"
              style={{
                padding: 0,
                marginBottom: isMobile ? 8 : 0,
              }}
            >
              <Col>
                <Title level={3} style={{ margin: 0 }}>
                  결제 관리 ({metadata.totalCount}건)
                </Title>
              </Col>
              <Col>
                <Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleRegisterClick}
                  >
                    {isMobile ? "" : "결제 등록"}
                  </Button>
                  <Button
                    icon={isMobile ? <FileAddOutlined /> : null}
                    onClick={() =>
                      document.getElementById("fileUploadInput").click()
                    }
                  >
                    {isMobile ? "" : "파일로 등록"}
                  </Button>
                  <input
                    type="file"
                    id="fileUploadInput"
                    style={{ display: "none" }}
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileUpload}
                  />
                </Space>
              </Col>
            </Row>

            {isMobile && <Divider style={{ margin: "24px 0 0 0" }} />}

            {!isMobile && (
              <>
                <Form
                  form={searchForm}
                  onFinish={handleSearch}
                  style={{ marginTop: 16 }}
                >
                  <Row gutter={16}>
                    <Col flex="auto">
                      <Space wrap>
                        <Form.Item name="dateRange" style={{ marginBottom: 0 }}>
                          <RangePicker
                            placeholder={["시작일", "종료일"]}
                            style={{ width: 240 }}
                          />
                        </Form.Item>
                        <Form.Item
                          name="paymentMethod"
                          style={{ marginBottom: 0 }}
                        >
                          <Select placeholder="결제방식" style={{ width: 120 }}>
                            <Option value="현금">현금</Option>
                            <Option value="카드">카드</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item
                          name="monthOfClass"
                          style={{ marginBottom: 0 }}
                        >
                          <Input
                            placeholder="수업월 (예: 24.03)"
                            style={{ width: 160 }}
                            onChange={handleMonthOfClassChange}
                          />
                        </Form.Item>
                        <Form.Item
                          name="customerName"
                          style={{ marginBottom: 0 }}
                        >
                          <Input
                            placeholder="이름 검색"
                            style={{ width: 160 }}
                          />
                        </Form.Item>
                      </Space>
                    </Col>
                    <Col>
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
                            <Button onClick={handleReset}>초기화</Button>
                          </Badge>
                        )}
                      </Space>
                    </Col>
                  </Row>

                  {activeFilters > 0 && (
                    <Row style={{ marginTop: 16 }}>
                      <Col span={24}>
                        <Space wrap>{renderActiveFilters()}</Space>
                      </Col>
                    </Row>
                  )}
                </Form>
                <Divider />
              </>
            )}

            {isMobile ? (
              renderMobileList()
            ) : (
              <>
                <Table
                  columns={columns}
                  dataSource={payments}
                  onRow={(record) => ({
                    onClick: () => showEditModal(record),
                  })}
                  style={{ cursor: "pointer" }}
                  pagination={false}
                  loading={loading}
                  size="small"
                />
                <div style={{ padding: "16px 24px", textAlign: "right" }}>
                  <Pagination
                    current={page}
                    total={metadata.totalCount}
                    pageSize={PAGE_SIZE}
                    onChange={handlePaginationChange}
                    showSizeChanger={false}
                    showTotal={(total, range) =>
                      `${range[0]}-${range[1]} / ${total}`
                    }
                  />
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="결제 정보 수정"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedStudent(null);
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleEdit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="studentId"
                label="학생"
                rules={[{ required: true, message: "학생을 선택해주세요" }]}
              >
                <div>
                  <AutoComplete
                    options={studentOptions}
                    onSearch={handleStudentSearch}
                    onSelect={handleStudentSelect}
                    placeholder="학생 이름으로 검색"
                    style={{ width: "100%", marginBottom: "8px" }}
                  />
                  {selectedStudent && <StudentTag student={selectedStudent} />}
                </div>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="paymentDate"
                label="결제일"
                rules={[{ required: true, message: "결제일을 입력해주세요" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="amount" label="정가">
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/¥\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="actualPayment"
                label="실제 결제금액"
                rules={[
                  { required: true, message: "실제 결제금액을 입력해주세요" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/¥\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="paymentMethod" label="결제방식">
                <Select>
                  <Option value="현금">현금</Option>
                  <Option value="카드">카드</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="monthOfClass" label="수업월">
                <Input placeholder="YY.MM" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item name="memberCode" label="회원코드">
                <Input />
              </Form.Item>
            </Col>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item name="customerId" label="Customer ID (Square)">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="courseId" label="수강 코스">
            <Select
              placeholder="수강 코스를 선택하세요"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.name} (₩{course.price.toLocaleString()})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="memo" label="메모">
            <TextArea rows={4} />
          </Form.Item>

          <Row justify="space-between" gutter={8}>
            <Col>
              <Button
                onClick={() => handleDeletePayment(selectedPayment)}
                danger
              >
                삭제
              </Button>
            </Col>

            <Col>
              <Button
                style={{ marginRight: 8 }}
                onClick={() => setEditModalVisible(false)}
              >
                취소
              </Button>
              <Button type="primary" htmlType="submit">
                수정
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="결제 정보 삭제"
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDeleteModalVisible(false)}>
            취소
          </Button>,
          <Button key="submit" danger onClick={confirmDelete}>
            삭제
          </Button>,
        ]}
      >
        <p>정말 삭제하시겠습니까?</p>
      </Modal>
    </div>
  );
};

export default PaymentManagementPage;
