import React, { useEffect } from "react";
import { useAdminStore } from "../../stores/adminStore";

const AdminPage = () => {
  const { fetchAdminInfo, adminInfo, isLoading } = useAdminStore();

  useEffect(() => {
    fetchAdminInfo();
  }, [fetchAdminInfo]);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">관리자 대시보드</h1>
      {adminInfo ? (
        <div>
          <p>환영합니다, 관리자님</p>
          <p>좌측 메뉴에서 원하는 관리 항목을 선택해주세요.</p>
        </div>
      ) : (
        <div>관리자 정보를 불러오는 중 오류가 발생했습니다.</div>
      )}
    </div>
  );
};

export default AdminPage; 