import { create } from "zustand";
import { 
  getAdminMe, 
  getAccounts, 
  getReports, 
  getWithdrawals,
  adminLogout 
} from "../api/admin";
import {
  getAccessToken,
  getRefreshToken,
  removeAccessToken,
  removeRefreshToken,
} from "../utils/token";

export const useAdminStore = create((set) => ({
  adminInfo: null,
  accounts: [],
  reports: [],
  withdrawals: [],
  isLoading: false,
  error: null,

  // Admin 정보 가져오기
  fetchAdminInfo: async () => {
    try {
      set({ isLoading: true, error: null });
      const accessToken = getAccessToken();

      if (!accessToken) {
        throw new Error("No access token found");
      }
      
      const response = await getAdminMe();
      set({ adminInfo: response.data });
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 계정 목록 가져오기
  fetchAccounts: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await getAccounts();
      set({ accounts: response.data });
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 신고 내역 가져오기
  fetchReports: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await getReports();
      set({ reports: response.data });
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // 탈퇴 내역 가져오기
  fetchWithdrawals: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await getWithdrawals();
      set({ withdrawals: response.data });
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
        const response = await adminLogout(refreshToken);
        if (response.data && response.data.success === true) {
          removeAccessToken();
          removeRefreshToken();
          set({ adminInfo: null });
          return true;
        }
      } else {
        // 리프레시 토큰이 없는 경우에도 클라이언트에서 로그아웃 처리
        removeAccessToken();
        removeRefreshToken();
        set({ adminInfo: null });
        return true;
      }
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      // 서버 오류가 있더라도 클라이언트에서는 로그아웃 처리
      removeAccessToken();
      removeRefreshToken();
      set({ adminInfo: null });
      return false;
    }
  },

  // 관리자 정보 초기화
  clearAdminInfo: () => {
    set({ adminInfo: null, accounts: [], reports: [], withdrawals: [], error: null });
  },
}));

export default useAdminStore; 