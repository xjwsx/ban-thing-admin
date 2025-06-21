import axios from "axios";
import { getAccessToken } from "../utils/token";

// API 기본 URL 설정
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || "https://api.banthing.net";
  }
  return process.env.REACT_APP_API_URL || "https://api.banthing.net";
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
    // 로그인 API는 토큰 불필요
    if (config.url === '/admin/login') {
      return config;
    }
    
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

// 응답 인터셉터 - 오류 처리
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // 401 오류는 각 API에서 개별적으로 처리하도록 함
    // 자동 리다이렉트 없이 에러를 그대로 전달
    return Promise.reject(error);
  }
);

export default api;
