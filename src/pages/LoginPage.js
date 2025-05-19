import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Lock, User } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.target);
    const username = formData.get("username");
    const password = formData.get("password");

    try {
      await login(username, password);
      navigate("/admin");
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message ||
          "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요."
      );
    } finally {
      setLoading(false);
    }
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
                className="pl-10 h-10 w-full"
                defaultValue="admin"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                name="password"
                type="password"
                placeholder="비밀번호"
                required
                className="pl-10 h-10 w-full"
                defaultValue="admin123"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 text-center">{error}</div>
          )}

          <Button type="submit" className="w-full h-10" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </Button>

          <div className="text-sm text-center text-gray-500 mt-4">
            테스트 계정: admin / admin123
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
