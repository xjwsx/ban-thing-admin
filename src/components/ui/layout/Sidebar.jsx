import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, ChevronLeft, Plus, Search, Users, BookOpen, Calendar, Bell, Home } from "lucide-react";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();

  const menuItems = [
    { path: "/home", label: "대시보드", icon: <Home size={20} /> },
    { path: "/customer", label: "고객 관리", icon: <Users size={20} /> },
    { path: "/course", label: "코스 관리", icon: <BookOpen size={20} /> },
    { path: "/reservation", label: "예약 관리", icon: <Calendar size={20} /> },
    { path: "/notice", label: "공지사항", icon: <Bell size={20} /> },
  ];

  return (
    <div
      className={`bg-card border-r border-border transition-all duration-300 ${
        isExpanded ? "w-64" : "w-16"
      } h-screen`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          {isExpanded && (
            <Link to="/home" className="font-semibold text-xl">
              Zarada Admin
            </Link>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-accent rounded-lg"
          >
            {isExpanded ? (
              <ChevronRight size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="검색..."
              className="w-full pl-9 py-2 text-sm bg-background border border-input rounded-md"
            />
          </div>
        )}

        <div className="mt-8">
          {isExpanded && (
            <div className="mb-4 px-2">
              <span className="text-xs font-semibold text-muted-foreground">메뉴</span>
            </div>
          )}

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                to={item.path}
                isExpanded={isExpanded}
                isActive={location.pathname === item.path}
              />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, to, isExpanded, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        isActive 
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent"
      }`}
    >
      <div className={isActive ? "text-primary-foreground" : "text-muted-foreground"}>
        {icon}
      </div>
      {isExpanded && <span>{label}</span>}
    </Link>
  );
};

export default Sidebar;
