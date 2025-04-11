import React from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  message,
  Row,
  Col,
} from "antd";
import { useNavigate } from "react-router-dom";
import { UserOutlined, BookOutlined, MailOutlined } from "@ant-design/icons";
import { createDoctor } from "../../api/crm";
import { useMediaQuery } from "react-responsive";

const { Title } = Typography;

const DoctorRegisterPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const onFinish = async (values) => {
    try {
      await createDoctor(values);
      message.success("의사가 등록되었습니다");
      navigate("/doctors");
    } catch (error) {
      message.error("의사 등록에 실패했습니다");
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
        <Title level={3}>의사 등록</Title>
        <Divider />
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{
            background: "#fff",
            borderRadius: "8px",
          }}
        >
          <Row gutter={24}>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                name="name"
                label="이름"
                rules={[{ required: true, message: "이름을 입력해주세요" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="홍길동" />
              </Form.Item>
            </Col>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                name="subject"
                label="전문 분야"
                rules={[
                  { required: true, message: "전문 분야를 입력해주세요" },
                ]}
              >
                <Input prefix={<BookOutlined />} placeholder="내과" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                name="email"
                label="이메일"
                rules={[
                  { required: true, message: "이메일을 입력해주세요" },
                  { type: "email", message: "올바른 이메일 형식이 아닙니다" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="example@email.com"
                />
              </Form.Item>
            </Col>
            <Col span={isMobile ? 24 : 12}>
              <Form.Item
                name="password"
                label="비밀번호"
                rules={[
                  { required: true, message: "비밀번호를 입력해주세요" },
                  {
                    min: 6,
                    message: "비밀번호는 최소 6자 이상이어야 합니다",
                  },
                ]}
              >
                <Input.Password placeholder="비밀번호" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <Button onClick={() => navigate("/doctors")}>취소</Button>
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

export default DoctorRegisterPage; 