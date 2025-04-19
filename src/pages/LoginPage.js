import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Modal } from "antd";
import { UserOutlined, LockOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { doctorLogin } from "../api/crm";
import {
  setAccessToken,
  setRefreshToken,
  getAccessToken,
} from "../utils/token";
import { getDeviceInfo } from "../utils/deviceInfo";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      const { deviceType, deviceInfo } = getDeviceInfo();
      const loginPayload = {
        ...values,
        deviceType,
        deviceInfo,
      };
      
      const response = await doctorLogin(loginPayload);

      if (response.status === 200 || response.status === 201) {
        if (response.data) {
          const { accessToken, refreshToken } = response.data;
          setAccessToken(accessToken);
          setRefreshToken(refreshToken);
        }
        navigate("/home");
      }
      if (response.response && response.response.status === 400) {
        setErrorMessage("아이디를 이메일 형식으로 작성해주세요.");
        setIsModalVisible(true);
        // 입력 필드 포커스
        setTimeout(() => {
          form.getFieldInstance('email')?.focus();
        }, 100);
      } else if (response.response && response.response.status === 401) {
        // 인증 실패 (아이디/비밀번호 불일치)
        setErrorMessage("아이디 또는 비밀번호가 일치하지 않습니다.");
        setIsModalVisible(true);
      } else {
        // 그 외 다른 에러
        setErrorMessage("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
        setIsModalVisible(true);
      }
    } catch (e) {
      // 오류 처리
      // console.error("로그인 중 오류:", e);
      // setErrorMessage("아이디 또는 비밀번호가 일치하지 않습니다.");
      // setIsModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {    
    // 어떤 필드가 에러인지 확인
    const emailError = errorInfo.errorFields.find(field => field.name[0] === 'email');
    const passwordError = errorInfo.errorFields.find(field => field.name[0] === 'password');
    
    // 1. 이메일 형식 에러인지 먼저 체크 (값은 있지만 형식이 잘못된 경우)
    if (emailError && emailError.errors.some(err => err.includes('형식으로'))) {
      setErrorMessage("아이디를 이메일 형식으로 작성해주세요.");
    }
    // 2. 둘 다 누락된 경우
    else if (emailError && passwordError && 
             emailError.errors.some(err => err.includes('입력')) && 
             passwordError.errors.some(err => err.includes('입력'))) {
      setErrorMessage("아이디와 비밀번호를 모두 입력해주세요.");
    }
    // 3. 아이디만 누락된 경우 
    else if (emailError && emailError.errors.some(err => err.includes('입력'))) {
      setErrorMessage("아이디를 입력해주세요.");
      console.log(errorInfo);
    }
    // 4. 비밀번호만 누락된 경우
    else if (passwordError && passwordError.errors.some(err => err.includes('입력'))) {
      setErrorMessage("비밀번호를 입력해주세요.");
    }
    // 5. 기타 에러
    else {
      setErrorMessage("입력 정보를 확인해주세요.");
    }
    
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      navigate("/home");
    }
  }, []);

  return (
    <div style={{ maxWidth: "300px", margin: "50px auto" }}>
      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: '8px' }} />
            입력 오류
          </span>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalOk}
        footer={[
          <Button key="ok" type="primary" onClick={handleModalOk}>
            확인
          </Button>
        ]}
      >
        <p>{errorMessage}</p>
      </Modal>

      <Form
        form={form}
        name="basic"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        validateTrigger="onSubmit"
        preserve={false}
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Form.Item
          label="아이디"
          name="email"
          rules={[
            { required: true, message: "아이디를 입력하세요." },
            { 
              type: 'email', 
              message: "올바른 이메일 형식으로 입력하세요." 
            }
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="아이디" />
        </Form.Item>

        <Form.Item
          label="비밀번호"
          name="password"
          rules={[{ required: true, message: "비밀번호를 입력하세요." }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            type="password"
            placeholder="비밀번호"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;
