import axios from "axios";
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  removeAccessToken,
  removeRefreshToken,
} from "../utils/token";
import { doctorRefreshToken } from "./crm";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 토큰 만료로 인한 401 에러이고, 재시도하지 않았던 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 리프레시 토큰으로 새로운 액세스 토큰 발급 시도
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // refreshToken을 요청 본문에 포함
        const response = await doctorRefreshToken({ refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // 새로운 토큰 저장
        setAccessToken(accessToken);
        setRefreshToken(newRefreshToken);

        // 원래 요청의 헤더에 새 토큰 설정
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // 원래 요청 재시도
        return api(originalRequest);
      } catch (refreshError) {
        // 리프레시 토큰도 만료되었거나 갱신 실패
        console.error("Token refresh failed:", refreshError);
        removeAccessToken();
        removeRefreshToken();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    // 다른 에러 처리
    if (error.response) {
      console.error("API Error:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url,
      });
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Request error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
