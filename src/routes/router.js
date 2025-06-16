import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import AdminLayout from "../components/AdminLayout";

// Admin Pages
import AccountsPage from "../pages/admin/AccountsPage";
import ReportsPage from "../pages/admin/ReportsPage";
import WithdrawalsPage from "../pages/admin/WithdrawalsPage";

import { getAccessToken } from "../utils/token";

// 인증 상태 확인 함수
const isAuthenticated = () => {
  const token = getAccessToken();
  return !!token; // 토큰이 존재하면 true, 그렇지 않으면 false를 반환합니다.
};

// 보호된 라우트 컴포넌트
const PrivateRoute = ({ Component, Layout = AdminLayout }) => {
  return isAuthenticated() ? (
    <Layout>
      <Component />
    </Layout>
  ) : (
    <Navigate to="/" />
  );
};

const Router = () => {
  const adminRoutes = [
    { path: "/admin/accounts", Component: AccountsPage },
    { path: "/admin/reports", Component: ReportsPage },
    { path: "/admin/withdrawals", Component: WithdrawalsPage },
  ];

  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 페이지 */}
        <Route path="/" element={<LoginPage />} />
        
        <Route path="/admin" element={<Navigate to="/admin/accounts" replace />} />
        {adminRoutes.map(({ path, Component }) => (
          <Route
            key={path}
            path={path}
            element={<PrivateRoute Component={Component} />}
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
