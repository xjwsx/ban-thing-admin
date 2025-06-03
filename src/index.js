import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

// 로딩 화면 제거 함수
const removeLoadingScreen = () => {
  const loading = document.getElementById("loading");
  if (loading) {
    loading.style.opacity = "0";
    setTimeout(() => {
      loading.remove();
    }, 300);
  }
};

root.render(<App />);

// React 앱이 렌더링된 후 로딩 화면 제거
setTimeout(removeLoadingScreen, 100);
