import React, { useEffect } from "react";
import { useAdminStore } from "../../stores/adminStore";
import { Table, Button, Space, Tag } from "antd";

const ReportsPage = () => {
  const { fetchReports, reports, isLoading } = useAdminStore();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "신고자",
      dataIndex: "reporter",
      key: "reporter",
    },
    {
      title: "피신고자",
      dataIndex: "reported",
      key: "reported",
    },
    {
      title: "신고 유형",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "신고일",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = 'blue';
        if (status === '처리완료') {
          color = 'green';
        } else if (status === '접수') {
          color = 'blue';
        } else if (status === '검토중') {
          color = 'orange';
        }
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: "액션",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" size="small">
            상세
          </Button>
          <Button type="link" size="small">
            처리
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">신고 내역</h1>
      <Table
        columns={columns}
        dataSource={reports}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default ReportsPage; 