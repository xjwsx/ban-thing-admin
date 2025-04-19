import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import {
  LogoutOutlined,
  HomeOutlined,
  FileTextOutlined,
  PayCircleOutlined,
  LineChartOutlined,
  TeamOutlined,
  UserOutlined,
  MenuOutlined,
  AuditOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme, Drawer, Modal } from "antd";
import { useDoctorStore } from "../stores/doctorStore";
const { Sider, Content } = Layout;

const BaseLayout = ({ children }) => {
  const navigate = useNavigate();
  const { fetchDoctorInfo, doctorInfo, logout } = useDoctorStore();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1200 });
  const isDesktop = useMediaQuery({ minWidth: 1201 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const checkPermission = (menuCode) => {
    if (!doctorInfo) return false;

    // admin role은 모든 페이지 접근 가능
    if (doctorInfo.role === "admin") return true;

    // doctor role은 permissions 체크
    const permission = doctorInfo.permissions.find(
      (p) => p.menuCode === menuCode
    );

    return permission?.canRead || false;
  };

  const handleMenuClick = (menuCode, path) => {
    if (menuCode === "MENU000") {
      // 홈 메뉴는 항상 접근 가능
      navigate(path);
      return;
    }

    if (!checkPermission(menuCode)) {
      Modal.error({
        title: "접근 권한 없음",
        content: "해당 메뉴에 대한 접근 권한이 없습니다.",
      });
      return;
    }

    navigate(path);
  };

  const allMenuItems = [
    {
      key: "1",
      icon: <HomeOutlined />,
      label: "홈",
      onClick: () => handleMenuClick("MENU000", "/home"),
      menuCode: "MENU000",
    },
    {
      key: "2",
      icon: <TeamOutlined />,
      label: "고객 관리",
      onClick: () => handleMenuClick("MENU001", "/customer"),
      menuCode: "MENU001",
    },
    {
      key: "3",
      icon: <PayCircleOutlined />,
      label: "결제 관리",
      onClick: () => handleMenuClick("MENU002", "/payment"),
      menuCode: "MENU002",
    },
    {
      key: "4",
      icon: <FileTextOutlined />,
      label: "할일 관리",
      onClick: () => handleMenuClick("MENU003", "/todo"),
      menuCode: "MENU003",
    },
    {
      key: "5",
      icon: <LineChartOutlined />,
      label: "통계",
      onClick: () => handleMenuClick("MENU004", "/statistics"),
      menuCode: "MENU004",
    },
    {
      key: "6",
      icon: <AuditOutlined />,
      label: "코스 관리",
      onClick: () => handleMenuClick("MENU005", "/course"),
      menuCode: "MENU005",
    },
    {
      key: "7",
      icon: <UserOutlined />,
      label: "의사 관리",
      onClick: () => handleMenuClick("MENU006", "/doctors"),
      menuCode: "MENU006",
    },
  ];

  const menuItems = React.useMemo(() => {
    if (!doctorInfo) return [];

    if (doctorInfo.role === "admin") {
      return allMenuItems;
    }

    if (doctorInfo.role === "doctor") {
      const allowedMenuCodes = ["MENU000", "MENU001", "MENU002", "MENU003"];
      return allMenuItems.filter((item) =>
        allowedMenuCodes.includes(item.menuCode)
      );
    }

    return allMenuItems;
  }, [doctorInfo]);

  const goToLogin = () => {
    Modal.confirm({
      title: "로그아웃",
      content: "정말 로그아웃 하시겠습니까?",
      okText: "확인",
      cancelText: "취소",
      onOk: async () => {
        await logout();
        navigate("/");
      },
    });
  };

  const bottomMenuItem = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "로그아웃",
      onClick: goToLogin,
    },
  ];

  useEffect(() => {
    const initializeDoctor = async () => {
      try {
        await fetchDoctorInfo();
      } catch (error) {
        console.error("Failed to fetch doctor info:", error);
        navigate("/");
      }
    };

    initializeDoctor();
  }, [fetchDoctorInfo, navigate]);

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Sider
        width={isTablet ? 150 : 200}
        style={{
          background: "#6A00FF",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          display: isMobile ? "none" : "block",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 50,
              color: "white",
              margin: 10,
              border: "none",
            }}
          >
            zarada
          </div>

          <Menu
            theme="green"
            mode="inline"
            defaultSelectedKeys={["1"]}
            items={menuItems}
            style={{
              background: "#6A00FF",
              color: "white",
              flex: "1 1 auto",
            }}
          />

          <Menu
            theme="green"
            mode="inline"
            items={bottomMenuItem}
            style={{
              background: "#6A00FF",
              color: "white",
              marginBottom: "23px",
            }}
          />
        </div>
      </Sider>
      <Layout
        style={{
          marginLeft: isMobile ? 0 : isTablet ? 150 : 200,
          height: "100vh",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {isMobile && (
          <>
            <div
              style={{
                padding: "15px 10px",
                background: "#6A00FF",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "white",
              }}
            >
              <span
                style={{ fontSize: "20px", marginLeft: "10px" }}
                onClick={() => navigate("/home")}
              >
                zarada
              </span>
              <MenuOutlined
                style={{ marginRight: "10px", fontSize: "15px" }}
                onClick={() => setMobileMenuOpen(true)}
              />
            </div>
            <Drawer
              title="메뉴"
              placement="right"
              onClose={() => setMobileMenuOpen(false)}
              open={mobileMenuOpen}
              styles={{ body: { padding: 0 } }}
            >
              <Menu
                theme="light"
                mode="vertical"
                items={menuItems}
                onClick={() => setMobileMenuOpen(false)}
                style={{ border: "none" }}
              />
              <Menu
                theme="light"
                mode="vertical"
                items={bottomMenuItem}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  border: "none",
                  position: "absolute",
                  bottom: "23px",
                  width: "100%",
                }}
              />
            </Drawer>
          </>
        )}
        <Content
          style={{
            margin: isMobile ? "8px" : "24px 16px",
            padding: isMobile ? 16 : 24,
            minHeight: "280px",
            flex: "1 0 auto",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default BaseLayout;
