import { create } from "zustand";
import { persist } from "zustand/middleware";
import { adminLogin, adminLogout } from "../api/admin";
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
          // API 연동 코드로 수정 예정 (현재는 모의 응답 사용)
          const response = await adminLogin({
            username,
            password,
          });

          const { accessToken, refreshToken } = response.data;

          // 토큰 저장
          setAccessToken(accessToken);
          setRefreshToken(refreshToken);

          set({
            token: accessToken,
            refreshToken: refreshToken,
            user: { username }, // 기본 사용자 정보
          });

          // API 인스턴스에 토큰 설정
          api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

          return response.data;
        } catch (error) {
          console.error("Login failed:", error);
          throw error;
        }
      },
      logout: async () => {
        try {
          const refreshToken = get().refreshToken;
          if (refreshToken) {
            await adminLogout(refreshToken);
          }
        } catch (error) {
          console.error("Logout failed:", error);
        } finally {
          removeAccessToken();
          removeRefreshToken();
          delete api.defaults.headers.common["Authorization"];
          set({ token: null, refreshToken: null, user: null });
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
