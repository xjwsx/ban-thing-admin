import React from "react";
import ReactDOM from "react-dom/client";
import '@ant-design/v5-patch-for-react-19'; // antd v5와 React 19 호환 패치
import App from "./App";
import { Reset } from "styled-reset";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    <Reset />
  </React.StrictMode>
);
