import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import {
  ChevronLeft,
  Home,
  Users,
  FileText,
  Calendar,
  Bell,
  LogOut,
  Menu as MenuIcon,
  Settings,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  CheckSquare,
} from "lucide-react";
import { useDoctorStore } from "../stores/doctorStore";
import { Modal } from "antd";

const BaseLayout = ({ children }) => {
  const navigate = useNavigate();
  const { fetchDoctorInfo, doctorInfo, logout } = useDoctorStore();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [isExpanded, setIsExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const checkPermission = (menuCode) => {
    if (!doctorInfo) return false;
    if (doctorInfo.role === "admin") return true;
    const permission = doctorInfo.permissions.find(
      (p) => p.menuCode === menuCode
    );
    return permission?.canRead || false;
  };

  const handleMenuClick = (menuCode, path) => {
    if (menuCode === "MENU000") {
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
      icon: <Home size={16} />,
      label: "홈",
      onClick: () => handleMenuClick("MENU000", "/home"),
      menuCode: "MENU000",
    },
    {
      key: "2",
      icon: <Users size={16} />,
      label: "고객 관리",
      onClick: () => handleMenuClick("MENU001", "/customer"),
      menuCode: "MENU001",
    },
    {
      key: "3",
      icon: <Settings size={16} />,
      label: "코스 관리",
      onClick: () => handleMenuClick("MENU002", "/course"),
      menuCode: "MENU002",
    },
    {
      key: "4",
      icon: <Calendar size={16} />,
      label: "예약 관리",
      onClick: () => handleMenuClick("MENU003", "/reservation"),
      menuCode: "MENU003",
    },
    {
      key: "5",
      icon: <CheckSquare size={16} />,
      label: "할일 관리",
      onClick: () => handleMenuClick("MENU006", "/todo"),
      menuCode: "MENU006",
    },
    {
      key: "6",
      icon: <Bell size={16} />,
      label: "공지사항",
      onClick: () => handleMenuClick("MENU004", "/notice"),
      menuCode: "MENU004",
    },
  ];

  const menuItems = React.useMemo(() => {
    if (!doctorInfo) return [];
    if (doctorInfo.role === "admin") return allMenuItems;
    if (doctorInfo.role === "doctor") {
      const allowedMenuCodes = [
        "MENU000",
        "MENU001",
        "MENU002",
        "MENU003",
        "MENU004",
        "MENU006",
      ];
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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
          isExpanded ? "w-60" : "w-14"
        } ${isMobile ? "hidden" : "block"}`}
      >
        <div className="px-3 py-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div
              className={`font-medium text-lg text-gray-800 cursor-pointer transition-opacity duration-300 ease-in-out overflow-hidden ${
                isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
              }`}
              onClick={() => navigate("/home")}
            >
              zarada
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded text-gray-500"
              title={isExpanded ? "메뉴 접기" : "메뉴 펼치기"}
            >
              {isExpanded ? (
                <PanelLeftClose size={18} />
              ) : (
                <PanelLeftOpen size={18} />
              )}
            </button>
          </div>

          <nav className="mt-4 space-y-1 flex-1">
            {menuItems.map((item) => (
              <div
                key={item.key}
                onClick={item.onClick}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-all"
              >
                <div className="text-gray-500 min-w-[16px]">{item.icon}</div>
                <div
                  className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
                    isExpanded
                      ? "max-w-[200px] opacity-100"
                      : "max-w-0 opacity-0"
                  }`}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </nav>

          {/* 로그아웃 버튼을 아래에 고정 */}
          <div
            onClick={goToLogin}
            className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-all mt-auto mb-2"
          >
            <div className="text-gray-500 min-w-[16px]">
              <LogOut size={16} />
            </div>
            <div
              className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
                isExpanded ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              로그아웃
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="fixed top-4 left-4 p-2 bg-white rounded-md z-50 shadow-sm text-gray-600"
        >
          <MenuIcon size={20} />
        </button>
      )}

      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed left-0 top-0 h-full w-60 bg-white p-4 shadow-lg flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="font-medium text-lg text-gray-800">zarada</div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 hover:bg-gray-100 rounded text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="space-y-1 flex-1">
              {menuItems.map((item) => (
                <div
                  key={item.key}
                  onClick={() => {
                    item.onClick();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-all"
                >
                  <div className="text-gray-500">{item.icon}</div>
                  <span>{item.label}</span>
                </div>
              ))}
            </nav>
            <div
              onClick={goToLogin}
              className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-all mt-auto mb-2"
            >
              <div className="text-gray-500">
                <LogOut size={16} />
              </div>
              <span>로그아웃</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto notion-style-scrollbar">
        <main className="h-full w-full">{children}</main>
      </div>
    </div>
  );
};

export default BaseLayout;
