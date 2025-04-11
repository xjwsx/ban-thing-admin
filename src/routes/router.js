import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import BaseLayout from "../components/BaseLayout";
import HomePage from "../pages/HomePage";
import StatisticsPage from "../pages/StatisticsPage";
import StudentsPage from "../pages/student/StudentsPage";
import StudentDetailPage from "../pages/student/StudentDetailPage";
import PaymentPage from "../pages/payment/PaymentPage";
import TodoManagementPage from "../pages/todo/TodoPage";
import HomeRegisterPage from "../pages/HomeRegisterPage";
import PaymentRegisterPage from "../pages/payment/PaymentRegisterPage";
import DoctorsPage from "../pages/doctor/DoctorsPage";
import DoctorRegisterPage from "../pages/doctor/DoctorRegisterPage";
import DoctorDetailPage from "../pages/doctor/DoctorDetailPage";
import { getAccessToken } from "../utils/token";
import CoursePage from "../pages/CoursePage";

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
    { path: "/statistics", Component: StatisticsPage },
    { path: "/student", Component: StudentsPage },
    { path: "/student/:id", Component: StudentDetailPage },
    { path: "/payment", Component: PaymentPage },
    {
      path: "/payment/register",
      Component: PaymentRegisterPage,
    },
    { path: "/todo", Component: TodoManagementPage },
    { path: "/doctors", Component: DoctorsPage },
    { path: "/doctors/register", Component: DoctorRegisterPage },
    { path: "/doctors/:id", Component: DoctorDetailPage },
    { path: "/course", Component: CoursePage },
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
