import { create } from "zustand";
import { persist } from "zustand/middleware";
import { doctorLogin, doctorLogout as apiLogout } from "../api/crm";
import api from "../api";
import { setAccessToken, setRefreshToken } from "../utils/token";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      login: async (username, password) => {
        try {
          const response = await doctorLogin({
            email: username,
            password,
          });

          const { accessToken, refreshToken } = response.data;

          // 토큰 저장
          setAccessToken(accessToken);
          setRefreshToken(refreshToken);

          set({
            token: accessToken,
            refreshToken: refreshToken,
            user: { email: username }, // 기본 사용자 정보
          });

          // API 인스턴스에 토큰 설정
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;

          return response.data;
        } catch (error) {
          console.error("Login failed:", error);
          throw error;
        }
      },
      logout: async () => {
        try {
          await apiLogout();
        } catch (error) {
          console.error("Logout failed:", error);
        } finally {
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
