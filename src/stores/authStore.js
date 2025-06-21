import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adminLogin } from "../api/admin";
import api from "../api";
import { setAccessToken, setRefreshToken, removeAccessToken, removeRefreshToken } from "../utils/token";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      login: async (username, password) => {
        try {
          const response = await adminLogin({
            username,
            password,
          });

          // 실제 응답 구조에 맞게 수정
          const { token } = response.data.data;

          // 토큰에서 "Bearer " 접두사 제거 (이미 포함되어 있는 경우)
          const cleanToken = token.startsWith('Bearer ') ? token.replace('Bearer ', '') : token;

          // 토큰 저장
          setAccessToken(cleanToken);

          set({
            token: cleanToken,
            refreshToken: null, // 현재 응답에는 refreshToken이 없음
            user: { username }, // 기본 사용자 정보
          });

          // API 인스턴스에 토큰 설정
          api.defaults.headers.common["Authorization"] = `Bearer ${cleanToken}`;

          return response.data;
        } catch (error) {
          console.error("Login failed:", error);
          throw error;
        }
      },
      logout: () => {
        // 로그아웃 시 로컬 데이터만 정리
        removeAccessToken();
        removeRefreshToken();
        delete api.defaults.headers.common["Authorization"];
        set({ token: null, refreshToken: null, user: null });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
