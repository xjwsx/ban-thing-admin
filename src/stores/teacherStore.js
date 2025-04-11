import { create } from "zustand";
import { getTeacherMe } from "../api/crm";
import {
  getAccessToken,
  removeAccessToken,
  removeRefreshToken,
} from "../utils/token";

export const useTeacherStore = create((set) => ({
  teacherInfo: null,
  isLoading: false,
  error: null,

  // 선생님 정보 가져오기
  fetchTeacherInfo: async () => {
    try {
      set({ isLoading: true, error: null });
      const accessToken = getAccessToken();

      if (!accessToken) {
        throw new Error("No access token found");
      }

      const response = await getTeacherMe();
      set({ teacherInfo: response.data });
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
    set({ teacherInfo: null });
  },

  // 선생님 정보 초기화
  clearTeacherInfo: () => {
    set({ teacherInfo: null, error: null });
  },
}));

export default useTeacherStore;
