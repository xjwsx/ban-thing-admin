import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import AdminLayout from "../components/AdminLayout";

// Admin Pages
import AccountsPage from "../pages/admin/AccountsPage";
import ReportsPage from "../pages/admin/ReportsPage";
import WithdrawalsPage from "../pages/admin/WithdrawalsPage";

import { getAccessToken, isTokenExpired } from "../utils/token";

// 인증 상태 확인 함수
const isAuthenticated = () => {
  const token = getAccessToken();
  if (!token) return false;
  
  // 토큰 만료 체크
  if (isTokenExpired(token)) {
    console.log('🔓 토큰이 만료되었습니다.');
    // 만료된 토큰 정리
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return false;
  }
  
  return true;
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

// 공개 라우트 컴포넌트 (로그인 페이지용)
const PublicRoute = ({ Component }) => {
  return isAuthenticated() ? (
    <Navigate to="/admin/accounts" />
  ) : (
    <Component />
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
        {/* 로그인 페이지 - 토큰이 있으면 관리자 페이지로 리다이렉트 */}
        <Route path="/" element={<PublicRoute Component={LoginPage} />} />
        
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
