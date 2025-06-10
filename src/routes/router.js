import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import AdminLayout from "../components/AdminLayout";

// Admin Pages
import AccountsPage from "../pages/admin/AccountsPage";
import ReportsPage from "../pages/admin/ReportsPage";
import WithdrawalsPage from "../pages/admin/WithdrawalsPage";

// import { getAccessToken } from "../utils/token"; // 개발용 비활성화

// isAuthenticated 함수 비활성화 (개발용)
// const isAuthenticated = () => {
//   // 개발용: 로그인 체크 우회 (항상 true 반환)
//   return true;
//   
//   // 원래 로그인 체크 로직 (필요시 주석 해제)
//   // const token = getAccessToken();
//   // return !!token; // 토큰이 존재하면 true, 그렇지 않으면 false를 반환합니다.
// };

// PrivateRoute 비활성화 (개발용)
// const PrivateRoute = ({ Component, Layout = AdminLayout }) => {
//   return isAuthenticated() ? (
//     <Layout>
//       <Component />
//     </Layout>
//   ) : (
//     <Navigate to="/" />
//   );
// };

const Router = () => {
  const adminRoutes = [
    { path: "/admin/accounts", Component: AccountsPage },
    { path: "/admin/reports", Component: ReportsPage },
    { path: "/admin/withdrawals", Component: WithdrawalsPage },
  ];

  return (
    <BrowserRouter>
      <Routes>
        {/* 개발용: 바로 계정 관리 페이지로 이동 */}
        <Route path="/" element={<Navigate to="/admin/accounts" replace />} />
        
        {/* 원래 로그인 페이지 (필요시 주석 해제) */}
        {/* <Route path="/" element={<LoginPage />} /> */}
        
        <Route path="/admin" element={<Navigate to="/admin/accounts" replace />} />
        {adminRoutes.map(({ path, Component }) => (
          <Route
            key={path}
            path={path}
            element={
              <AdminLayout>
                <Component />
              </AdminLayout>
            }
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
