import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import BaseLayout from "../components/BaseLayout";
import HomePage from "../pages/HomePage";
import HomeRegisterPage from "../pages/HomeRegisterPage";

// 기존 페이지
import OldCustomersPage from "../pages/customer/CustomersPage";
import CustomerDetailPage from "../pages/customer/CustomerDetailPage";
import OldCoursePage from "../pages/CoursePage";
import OldNoticePage from "../pages/notice/NoticesPage";
import OldReservationsPage from "../pages/reservation/ReservationsPage";

// 새로운 Notion 스타일 페이지
import CustomersPage from "../pages/CustomersPage";
import CoursesPage from "../pages/CoursesPage";
import ReservationsPage from "../pages/ReservationsPage";
import NoticesPage from "../pages/NoticesPage";

import { getAccessToken } from "../utils/token";

const isAuthenticated = () => {
  const token = getAccessToken();
  return !!token; // 토큰이 존재하면 true, 그렇지 않으면 false를 반환합니다.
};

const PrivateRoute = ({ Component }) => {
  return isAuthenticated() ? (
    <BaseLayout>
      <Component />
    </BaseLayout>
  ) : (
    <Navigate to="/" />
  );
};

const Router = () => {
  const privateRoutes = [
    { path: "/home", Component: HomePage },
    { path: "/home/register", Component: HomeRegisterPage },
    
    // 기존 페이지 라우트 (일시적으로 다른 경로로 설정)
    { path: "/old-customer", Component: OldCustomersPage },
    { path: "/customer/:id", Component: CustomerDetailPage },
    { path: "/old-course", Component: OldCoursePage },
    { path: "/old-reservation", Component: OldReservationsPage },
    { path: "/old-notice", Component: OldNoticePage },
    
    // 새로운 Notion 스타일 페이지 라우트
    { path: "/customer", Component: CustomersPage },
    { path: "/course", Component: CoursesPage },
    { path: "/reservation", Component: ReservationsPage },
    { path: "/notice", Component: NoticesPage },
  ];

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        {privateRoutes.map(({ path, Component }) => (
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
