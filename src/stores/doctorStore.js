import { create } from "zustand";
import { getDoctorMe } from "../api/crm";
import {
  getAccessToken,
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
  logout: () => {
    removeAccessToken();
    removeRefreshToken();
    set({ doctorInfo: null });
  },

  // 의사 정보 초기화
  clearDoctorInfo: () => {
    set({ doctorInfo: null, error: null });
  },
}));

export default useDoctorStore; 