import React from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
