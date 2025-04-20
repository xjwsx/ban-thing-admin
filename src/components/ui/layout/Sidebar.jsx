import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Plus, Search } from "lucide-react";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className={`bg-card border-r border-border transition-all duration-300 ${
        isExpanded ? "w-64" : "w-16"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          {isExpanded && (
            <Link to="/" className="font-semibold text-xl">
              Zarada Admin
            </Link>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-accent rounded-lg"
          >
            {isExpanded ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg cursor-pointer">
            <Search size={20} />
            {isExpanded && <span>Quick Search</span>}
          </div>
        </div>

        <div className="mt-6">
          {isExpanded && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">PAGES</span>
              <button className="p-1 hover:bg-accent rounded-lg">
                <Plus size={16} />
              </button>
            </div>
          )}

          <nav className="space-y-1">
            <SidebarItem
              icon={<div className="w-3 h-3 rounded bg-blue-500" />}
              label="Dashboard"
              isExpanded={isExpanded}
            />
            <SidebarItem
              icon={<div className="w-3 h-3 rounded bg-green-500" />}
              label="Users"
              isExpanded={isExpanded}
            />
            <SidebarItem
              icon={<div className="w-3 h-3 rounded bg-purple-500" />}
              label="Settings"
              isExpanded={isExpanded}
            />
          </nav>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, isExpanded }) => {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg text-sm"
    >
      {icon}
      {isExpanded && <span>{label}</span>}
    </Link>
  );
};

export default Sidebar;
