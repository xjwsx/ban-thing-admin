import React, { useState } from "react";
import {
  Typography,
  Form,
  Input,
  DatePicker,
  Button,
  Card,
  Select,
} from "antd";
import { useNavigate } from "react-router-dom";
import useTodoStore from "../stores/todoStore";

const { Title } = Typography;
const { TextArea } = Input;

const HomeRegisterPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const addTodo = useTodoStore((state) => state.addTodo);

  const onFinish = (values) => {
    const newTodo = {
      title: values.title,
      date: values.date.toDate(),
      description: values.description,
    };
    console.log("Adding todo:", newTodo);
    addTodo(newTodo);
    navigate("/home");
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px" }}>
      <Card>
        <Title level={2}>할 일 추가</Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="title"
            label="제목"
            rules={[{ required: true, message: "제목을 입력해주세요" }]}
          >
            <Input placeholder="할 일 제목을 입력하세요" />
          </Form.Item>

          <Form.Item
            name="date"
            label="날짜"
            rules={[{ required: true, message: "날짜를 선택해주세요" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="description" label="설명">
            <TextArea rows={4} placeholder="상세 설명을 입력하세요" />
          </Form.Item>

          <Form.Item>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <Button onClick={() => navigate("/home")}>취소</Button>
              <Button type="primary" htmlType="submit">
                저장
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default HomeRegisterPage;
