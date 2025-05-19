import React, { useEffect } from "react";
import { useAdminStore } from "../../stores/adminStore";
import { Table, Button } from "antd";

const WithdrawalsPage = () => {
  const { fetchWithdrawals, withdrawals, isLoading } = useAdminStore();

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "사용자명",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "이메일",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "탈퇴 사유",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "탈퇴일",
      dataIndex: "withdrawalDate",
      key: "withdrawalDate",
    },
    {
      title: "상세",
      key: "action",
      render: (_, record) => (
        <Button type="link" size="small">
          상세
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">탈퇴 내역</h1>
      <Table
        columns={columns}
        dataSource={withdrawals}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default WithdrawalsPage; 