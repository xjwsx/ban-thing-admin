import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import BaseLayout from "../components/BaseLayout";
import HomePage from "../pages/HomePage";
import HomeRegisterPage from "../pages/HomeRegisterPage";
import CustomersPage from "../pages/CustomersPage";
import CoursesPage from "../pages/CoursesPage";
import ReservationsPage from "../pages/ReservationsPage";
import NoticesPage from "../pages/NoticesPage";
import CustomerDetailPage from "../pages/CustomerDetailPage";
import TodoPage from "../pages/todo/TodoPage";
import PermissionsPage from "../pages/PermissionsPage";

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
    { path: "/customer/:id", Component: CustomerDetailPage },
    { path: "/customer", Component: CustomersPage },
    { path: "/course", Component: CoursesPage },
    { path: "/reservation", Component: ReservationsPage },
    { path: "/todo", Component: TodoPage },
    { path: "/notice", Component: NoticesPage },
    { path: "/permissions", Component: PermissionsPage },
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
