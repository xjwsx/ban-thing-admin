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

// 응답 인터셉터 - 토큰 만료 처리
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // 401 오류 (토큰 만료 또는 인증 실패) 처리
    if (error.response?.status === 401) {
      // 로그인 API 호출이 아닌 경우에만 자동 리다이렉트
      if (!error.config?.url?.includes('/admin/login')) {
        console.log('🔓 토큰이 만료되었습니다. 로그인 페이지로 이동합니다.');
        
        // 로컬 스토리지 정리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // API 헤더 정리
        delete api.defaults.headers.common["Authorization"];
        
        // 로그인 페이지로 리다이렉트
        window.location.href = "/";
        
        return Promise.reject(new Error('토큰이 만료되었습니다. 다시 로그인해주세요.'));
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
