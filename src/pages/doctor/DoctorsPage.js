import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  message,
  Table,
  Card,
  Divider,
  Badge,
  List,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getDoctorList } from "../../api/crm";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

const { Title } = Typography;

const PAGE_SIZE = 20;

const DoctorsPage = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [metadata, setMetadata] = useState({
    totalCount: 0,
    totalPage: 0,
  });
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const fetchDoctors = async (currentPage = page) => {
    setLoading(true);
    try {
      const response = await getDoctorList(currentPage, PAGE_SIZE);
      setDoctors(response.data.data || []);
      setMetadata({
        totalCount: response.data.totalCount || 0,
        totalPage: response.data.totalPage || 0,
      });
    } catch (error) {
      console.error("의사 목록을 불러오는데 실패했습니다.", error);
      message.error("의사 목록을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(page);
  }, [page]);

  const columns = [
    {
      title: "이름",
      dataIndex: "name",
      key: "name",
      width: 120,
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/doctors/${record.id}`)}
          style={{ padding: 0, height: "auto", fontSize: "14px" }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: "과목",
      dataIndex: "subject",
      key: "subject",
      width: 120,
    },
    {
      title: "이메일",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
  ];

  const renderMobileList = () => (
    <List
      loading={loading}
      dataSource={doctors}
      renderItem={(doctor) => (
        <List.Item
          onClick={() => navigate(`/doctors/${doctor.id}`)}
          style={{ cursor: "pointer" }}
        >
          <List.Item.Meta
            title={doctor.name}
            description={
              <>
                <div>{doctor.subject}</div>
                <div>{doctor.email}</div>
              </>
            }
          />
        </List.Item>
      )}
      pagination={{
        current: page,
        total: metadata.totalCount,
        pageSize: PAGE_SIZE,
        onChange: (newPage) => setPage(newPage),
        showSizeChanger: false,
      }}
    />
  );

  return (
    <div style={{ padding: "0 0 12px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
          position: "relative",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          의사 관리 ({metadata.totalCount}명)
        </Title>
        <div style={{ position: "absolute", right: 0 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/doctors/register")}
            style={{ marginRight: 8 }}
          >
            의사 등록
          </Button>
        </div>
      </div>
      <Divider />

      <Card>
        {isMobile ? (
          renderMobileList()
        ) : (
          <Table
            columns={columns}
            dataSource={doctors}
            loading={loading}
            rowKey="id"
            pagination={{
              current: page,
              total: metadata.totalCount,
              pageSize: PAGE_SIZE,
              onChange: (newPage) => setPage(newPage),
              showSizeChanger: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
            }}
            onRow={(record) => ({
              onClick: () => navigate(`/doctors/${record.id}`),
            })}
            style={{ cursor: "pointer" }}
            size="small"
          />
        )}
      </Card>
    </div>
  );
};

export default DoctorsPage; 