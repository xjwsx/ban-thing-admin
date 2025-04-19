import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import BaseLayout from "../components/BaseLayout";
import HomePage from "../pages/HomePage";
import CustomersPage from "../pages/customer/CustomersPage";
import CustomerDetailPage from "../pages/customer/CustomerDetailPage";
import CoursePage from "../pages/CoursePage";
import HomeRegisterPage from "../pages/HomeRegisterPage";
import NoticePage from "../pages/notice/NoticesPage";
import ReservationsPage from "../pages/reservation/ReservationsPage";
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
    { path: "/customer", Component: CustomersPage },
    { path: "/customer/:id", Component: CustomerDetailPage },
    { path: "/course", Component: CoursePage },
    { path: "/reservation", Component: ReservationsPage },
    { path: "/notice", Component: NoticePage },
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
