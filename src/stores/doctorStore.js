import { create } from "zustand";
import { getDoctorMe, doctorLogout } from "../api/crm";
import {
  getAccessToken,
  getRefreshToken,
  removeAccessToken,
  removeRefreshToken,
} from "../utils/token";

export const useDoctorStore = create((set) => ({
  doctorInfo: null,
  isLoading: false,
  error: null,

  // 의사 정보 가져오기
  fetchDoctorInfo: async () => {
    try {
      set({ isLoading: true, error: null });
      const accessToken = getAccessToken();

      if (!accessToken) {
        throw new Error("No access token found");
      }

      const response = await getDoctorMe();
      set({ doctorInfo: response.data });
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        const response = await doctorLogout(refreshToken);
        if (response.data && response.data.success === true) {
          removeAccessToken();
          removeRefreshToken();
          set({ doctorInfo: null });
          return true;
        }
      } else {
        // 리프레시 토큰이 없는 경우에도 클라이언트에서 로그아웃 처리
        removeAccessToken();
        removeRefreshToken();
        set({ doctorInfo: null });
        return true;
      }
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      // 서버 오류가 있더라도 클라이언트에서는 로그아웃 처리
      removeAccessToken();
      removeRefreshToken();
      set({ doctorInfo: null });
      return false;
    }
  },

  // 의사 정보 초기화
  clearDoctorInfo: () => {
    set({ doctorInfo: null, error: null });
  },
}));

export default useDoctorStore; 