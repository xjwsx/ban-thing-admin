import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { doctorLogin } from "../api/crm";
import {
  setAccessToken,
  setRefreshToken,
  getAccessToken,
} from "../utils/token";
import { getDeviceInfo } from "../utils/deviceInfo";

const LoginPage = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {    
    try {
      const { deviceType, deviceInfo } = getDeviceInfo();
      
      const loginPayload = {
        ...values,
        deviceType,
        deviceInfo
      };
      
      const response = await doctorLogin(loginPayload);
      console.log(response);
      if (response.status === 200 || response.status === 201) {
        if (response.data) {
          const { accessToken, refreshToken } = response.data;
          setAccessToken(accessToken);
          setRefreshToken(refreshToken);
        }
        navigate("/home");
      }
    } catch (e) {
      message.error("아이디 비밀번호가 일치하지 않습니다.");
      console.log(e);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      navigate("/home");
    }
  }, []);

  return (
    <div style={{ maxWidth: "300px", margin: "50px auto" }}>
      <Form
        name="basic"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="아이디"
          name="email"
          rules={[
            { required: true, message: "아이디를 입력해주세요." },
            { 
              type: 'email', 
              message: "올바른 이메일 형식으로 입력해주세요." 
            }
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="아이디" />
        </Form.Item>

        <Form.Item
          label="비밀번호"
          name="password"
          rules={[{ required: true, message: "비밀번호를 입력해주세요." }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            type="password"
            placeholder="비밀번호"
          />
        </Form.Item>
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            block
          >
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;
