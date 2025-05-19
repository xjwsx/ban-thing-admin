import React, { useEffect } from "react";
import { useAdminStore } from "../../stores/adminStore";
import { Table, Button, Space } from "antd";

const AccountsPage = () => {
  const { fetchAccounts, accounts, isLoading } = useAdminStore();

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

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
      title: "가입일",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "액션",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small">
            상세
          </Button>
          <Button type="link" danger size="small">
            계정 정지
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">계정 관리</h1>
      <Table
        columns={columns}
        dataSource={accounts}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default AccountsPage; 