import React, { useState } from "react";
import { createUser } from "../api/user";
import { Typography, Divider, Form, Input, Button, message, Rate } from "antd";
import { useNavigate } from "react-router-dom";
const { Title } = Typography;

const UserRegisterPage = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  // const onClick = async () => {
  //   if (!name || !phoneNumber || !status) {
  //     message.warning("내용을 입력해주세요.");
  //     return;
  //   }

  //   try {
  //     const response = await createUser({
  //       name,
  //       phoneNumber,
  //       status,
  //     });
  //     if (response.status === 200 || response.status === 201) {
  //       message.success("등록이 완료되었습니다.");
  //       navigate("/user");
  //     } else {
  //       message.error("다시 시도해주세요.");
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   } finally {
  //     // loading 종료
  //   }
  // };
  const onClick = () => {
    if (!name || !phoneNumber || !status) {
      message.warning("내용을 입력해주세요.");
    } else {
      const newUser = {
        name,
        phoneNumber,
        status,
      };
      const currentUsers = JSON.parse(localStorage.getItem("users")) || [];
      localStorage.setItem("users", JSON.stringify([...currentUsers, newUser]));
      message.success("등록이 완료되었습니다.");
      navigate("/user");
    }
  };

  return (
    <div>
      <Title level={2}>사용자 관리</Title>
      <Divider />
      <Form>
        <Form.Item
          label="name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please input name!",
            },
          ]}
        >
          <Input onChange={(e) => setName(e.target.value)} />
        </Form.Item>
        <Form.Item
          label="phoneNumber"
          name="phoneNumber"
          rules={[
            {
              required: true,
              message: "Please input phoneNumber!",
            },
          ]}
        >
          <Input onChange={(e) => setPhoneNumber(e.target.value)} />
        </Form.Item>
        <Form.Item
          label="status"
          name="status"
          rules={[
            {
              required: true,
              message: "Please input status!",
            },
          ]}
        >
          <Input onChange={(e) => setStatus(e.target.value)} />
        </Form.Item>
        <Button type="primary" htmlType="submit" onClick={onClick}>
          등록
        </Button>
      </Form>
    </div>
  );
};

export default UserRegisterPage;
