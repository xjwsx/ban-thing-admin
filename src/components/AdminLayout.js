import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Flag,
  Settings2,
} from "lucide-react";
import banthingIcon from "../assets/banthingicon.png";
// import { useAdminStore } from "../stores/adminStore"; // 개발용 비활성화

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // const { fetchAdminInfo } = useAdminStore(); // 개발용 비활성화
  const [isExpanded, setIsExpanded] = useState(true);

  const menuItems = [
    {
      key: "1",
      icon: <Settings2 size={16} />,
      label: "계정관리",
      onClick: () => navigate("/admin/accounts"),
      path: "/admin/accounts",
    },
    {
      key: "2",
      icon: <Flag size={16} />,
      label: "신고 내역",
      onClick: () => navigate("/admin/reports"),
      path: "/admin/reports",
    },
    {
      key: "3",
      icon: <LogOut size={16} />,
      label: "탈퇴 내역",
      onClick: () => navigate("/admin/withdrawals"),
      path: "/admin/withdrawals",
    },
  ];

  const getActivePath = () => {
    const { pathname } = location;
    return menuItems.find(item => pathname.startsWith(item.path))?.path || "/admin/accounts";
  };

  const activePath = getActivePath();

  // useEffect(() => {
  //   const initializeAdmin = async () => {
  //     try {
  //       await fetchAdminInfo();
  //     } catch (error) {
  //       console.error("Failed to fetch admin info:", error);
  //       navigate("/");
  //     }
  //   };

  //   initializeAdmin();
  // }, [fetchAdminInfo, navigate]);

  // 현재 경로에 따른 브레드크럼 생성
  const breadcrumbs = (() => {
    const { pathname } = location;
    const result = [];
    
    if (pathname.includes("/accounts")) {
      result.push({ label: "계정관리", path: "/admin/accounts" });
    } else if (pathname.includes("/reports")) {
      result.push({ label: "신고 내역", path: "/admin/reports" });
    } else if (pathname.includes("/withdrawals")) {
      result.push({ label: "탈퇴 내역", path: "/admin/withdrawals" });
    }
    
    return result;
  })();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className={`bg-[#FAFAFA] border-r border-gray-200 transition-all duration-300 flex flex-col ${
          isExpanded ? "w-[255px]" : "w-14"
        }`}
      >
        <div className={`py-4 flex flex-col h-full ${isExpanded ? "px-4" : "px-2"}`}>
          <div className={`flex items-center h-[52px] mb-4 ${isExpanded ? "justify-between" : "justify-center"}`}>
            <div
              className={`font-medium text-gray-800 cursor-pointer transition-opacity duration-300 ease-in-out overflow-hidden ${
                isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
              }`}
              onClick={() => navigate("/admin/accounts")}
            >
              <div className="flex items-center gap-3">
                <img 
                  src={banthingIcon} 
                  alt="BANTHING Icon" 
                  className="w-[32px] h-[32px] flex-shrink-0"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-[14px] leading-tight">BANTHING</span>
                  <span className="text-[12px]">V1.0.0</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 flex items-center justify-center"
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
            <div className={`px-2 py-1.5 text-xs font-semibold text-gray-500 transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0"}`}>
              admin
            </div>
            {menuItems.map((item) => (
              <div
                key={item.key}
                onClick={item.onClick}
                className={`flex items-center py-1.5 text-sm hover:bg-gray-100 rounded-md cursor-pointer transition-all text-gray-700 ${
                  activePath === item.path ? "bg-white" : ""
                } ${isExpanded ? "" : "justify-center px-0"}`}
              >
                {item.icon && (
                  <div className={`text-gray-500 ${isExpanded ? "min-w-[16px]" : "w-[16px] h-[16px] flex items-center justify-center"}`}>
                    {item.icon}
                  </div>
                )}
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Breadcrumb */}
        <div className="bg-white border-b p-4 px-6">
          <div className="flex items-center text-sm">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={item.path}>
                <span 
                  className={`${index === breadcrumbs.length - 1 ? 'font-medium' : 'text-gray-500 hover:text-gray-800 cursor-pointer'}`}
                  onClick={() => index !== breadcrumbs.length - 1 && navigate(item.path)}
                >
                  <span className="mr-1.5 text-gray-500">admin</span>
                  <span className="mx-1.5">&gt;</span>
                  <span className="ml-1.5">{item.label}</span>
                </span>
                {index < breadcrumbs.length - 1 && <span className="mx-2 text-gray-400">{">"}</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
        <main className="flex-1 overflow-auto bg-white">
          <div className="h-full px-6 pt-6 pb-3">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 