import React, { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Lock, User } from "lucide-react";

const LoginPage = () => {
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);

    try {
      await login(formData.username, formData.password);
    } catch (error) {
      console.error("Login error:", error);
      
      // 로그인 실패 시 팝업 표시
      let errorMessage = "아이디 또는 비밀번호를 확인하세요.";
      
      if (error.response?.status === 401) {
        errorMessage = "아이디 또는 비밀번호를 확인하세요.";
      } else if (error.response?.status === 403) {
        errorMessage = "관리자 권한이 없습니다.";
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('서버에 연결할 수 없습니다')) {
        errorMessage = "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";
      } else if (error.response?.status >= 500) {
        errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(e);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-96 bg-white border rounded-lg shadow-sm p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold">BANTHING</h2>
          <p className="mt-2 text-gray-500">관리자 로그인</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                name="username"
                type="text"
                placeholder="아이디"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="pl-10 h-10 w-full"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                name="password"
                type="password"
                placeholder="비밀번호"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 h-10 w-full"
              />
            </div>
          </div>

          <Button 
            type="button" 
            onClick={handleButtonClick}
            className="w-full h-10" 
            disabled={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
