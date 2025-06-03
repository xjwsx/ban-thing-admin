import axios from "axios";
import { getAccessToken } from "../utils/token";

// API 기본 URL 설정
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || "https://your-production-api-url.com";
  }
  return process.env.REACT_APP_API_URL || "http://localhost:8080";
};

const baseURL = getBaseURL();

console.log('🔗 API Base URL:', baseURL);
console.log('🌍 Environment:', process.env.NODE_ENV);

// axios 인스턴스 생성
const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10초 타임아웃
});

// 요청 인터셉터 - 요청 전에 토큰을 헤더에 추가
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 만료된 토큰 처리, 오류 처리 등
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // 오류 응답 처리
    const originalRequest = error.config;

    // 401 오류 (인증 실패) 및 토큰 갱신이 아직 시도되지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 로그인 페이지로 리다이렉트
        window.location.href = "/";
        return Promise.reject(error);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
