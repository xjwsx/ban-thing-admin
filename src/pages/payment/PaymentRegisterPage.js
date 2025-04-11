import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Typography,
  Divider,
  message,
  AutoComplete,
  Space,
  Tag,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  createStudentPayment,
  searchStudents,
  getCourseList,
} from "../../api/crm";
import StudentTag from "../../components/molecules/StudentTag";
import { CloseCircleOutlined } from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PaymentManagementRegisterPage = () => {
  const [form] = Form.useForm();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const navigate = useNavigate();
  const [studentOptions, setStudentOptions] = useState([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isRefund, setIsRefund] = useState(false);
  const [courses, setCourses] = useState([]);

  const handleStudentSearch = async (value) => {
    const koreanConsonantVowelOnly = /^[ㄱ-ㅎㅏ-ㅣ]+$/;

    if (!value || value.length < 2 || koreanConsonantVowelOnly.test(value)) {
      setStudentOptions([]);
      return;
    }

    try {
      setSearchingStudents(true);
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
    } finally {
      setSearchingStudents(false);
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

  const handleStudentSelect = (value, option) => {
    setSelectedStudent(option.student);
    form.setFieldsValue({
      studentId: option.student.id,
      koreanName: option.student.koreanName,
      memberCode: option.student.memberCode,
      status: option.student.status,
      customerName: `${option.student.name} ${option.student.koreanName}`,
      courseId: option.student.courseId,
    });
    form.setFieldValue("chineseName", "");
  };

  const handleRemoveStudent = () => {
    setSelectedStudent(null);
    form.resetFields([
      "studentId",
      "koreanName",
      "memberCode",
      "status",
      "customerName",
    ]);
  };

  const onFinish = async (values) => {
    if (!selectedStudent) {
      message.error("학생을 선택해주세요");
      return;
    }

    try {
      const monthOfClass = values.monthOfClass;
      const [year, month] = monthOfClass.split(".");
      const fullYear = `20${year}`;
      const formattedMonthOfClass = `${fullYear}-${month}`;

      const payload = {
        studentId: selectedStudent.id,
        paymentDate: values.paymentDate.format("YYYY-MM-DD"),
        amount: isRefund ? null : Number(values.amount),
        actualPayment: isRefund
          ? -Number(values.refundAmount || 0)
          : Number(values.actualPayment || values.amount),
        refundAmount: isRefund ? Number(values.refundAmount || 0) : null,
        paymentMethod: values.paymentMethod,
        courseId: values.courseId,
        monthOfClass: formattedMonthOfClass,
        eventType: isRefund ? "Refund" : "Payment",
        customerId: selectedStudent.customerId,
        customerName: selectedStudent.name,
        memo: values.memo,
        memberCode: values.memberCode,
      };

      await createStudentPayment(payload);
      message.success(
        isRefund ? "환불이 등록되었습니다." : "결제가 등록되었습니다."
      );
      navigate("/payment");
    } catch (error) {
      console.error("결제 등록 오류:", error);
      message.error("등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: isMobile ? 0 : "24px",
      }}
    >
      <Card>
        <Title level={3}>결제 등록</Title>
        <Divider />
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ type: "payment" }}
        >
          <Form.Item
            name="chineseName"
            label="학생 검색"
            rules={[
              { required: !selectedStudent, message: "학생을 선택해주세요" },
            ]}
          >
            <AutoComplete
              options={studentOptions}
              onSearch={handleStudentSearch}
              onSelect={handleStudentSelect}
              loading={searchingStudents}
              placeholder="학생 이름을 입력하세요"
            />
          </Form.Item>

          {selectedStudent && (
            <Card
              size="small"
              style={{ marginBottom: 24, background: "#f5f5f5" }}
            >
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%", position: "relative" }}
              >
                <Button
                  type="text"
                  icon={<CloseCircleOutlined />}
                  onClick={handleRemoveStudent}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                  }}
                />
                <div>
                  <Typography.Text type="secondary">
                    선택된 학생:
                  </Typography.Text>
                  <div style={{ marginTop: 8 }}>
                    <StudentTag student={selectedStudent} clickable={false} />
                  </div>
                </div>
                <Space style={{ marginTop: 8 }}>
                  <Tag color="blue">회원코드: {selectedStudent.memberCode}</Tag>
                  <Tag color="green">상태: {selectedStudent.status}</Tag>
                </Space>
              </Space>
            </Card>
          )}

          <Form.Item name="studentId" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="paymentDate"
            label="결제일"
            rules={[{ required: true, message: "결제일을 선택해주세요" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="paymentMethod"
            label="결제방식"
            rules={[{ required: true, message: "결제방식을 선택해주세요" }]}
          >
            <Select>
              <Option value="현금">현금</Option>
              <Option value="카드">카드</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="유형"
            rules={[{ required: true, message: "유형을 선택해주세요" }]}
          >
            <Select onChange={(value) => setIsRefund(value === "refund")}>
              <Option value="payment">결제</Option>
              <Option value="refund">환불</Option>
            </Select>
          </Form.Item>

          {!isRefund && (
            <>
              <Form.Item
                name="amount"
                label="결제액"
                rules={[{ required: true, message: "금액을 입력해주세요" }]}
              >
                <Input type="number" prefix="¥" />
              </Form.Item>

              <Form.Item
                name="actualPayment"
                label="실제 결제액"
                rules={[
                  { required: true, message: "실제 결제액을 입력해주세요" },
                ]}
              >
                <Input type="number" prefix="¥" />
              </Form.Item>
            </>
          )}

          {isRefund && (
            <Form.Item
              name="refundAmount"
              label="환불액"
              rules={[{ required: true, message: "환불액을 입력해주세요" }]}
            >
              <Input type="number" prefix="¥" />
            </Form.Item>
          )}

          <Form.Item
            name="courseId"
            label="수강 코스"
            rules={[{ required: true, message: "수강 코스를 선택해주세요" }]}
          >
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

          <Form.Item
            name="monthOfClass"
            label="수강월"
            rules={[
              { required: true, message: "수강월을 입력해주세요" },
              {
                pattern: /^\d{2}\.\d{2}$/,
                message: "YY.MM 형식으로 입력해주세요",
              },
            ]}
          >
            <Input placeholder="YY.MM" />
          </Form.Item>

          <Form.Item name="memo" label="메모">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <Button onClick={() => navigate("/payment")}>취소</Button>
              <Button type="primary" htmlType="submit">
                등록
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PaymentManagementRegisterPage;
