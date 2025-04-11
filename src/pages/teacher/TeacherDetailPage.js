import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Modal as AntModal,
  Typography,
  message,
  Input,
  Switch,
  Form,
  Card,
  Space,
  Tabs,
  Spin,
  Row,
  Col,
  Table,
} from "antd";
import { UserOutlined, BookOutlined, MailOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTeacherDetail,
  updateTeacher,
  deleteTeacher,
  updateTeacherPermission,
  getTeacherHistoryList,
  getTeacherPermissions,
} from "../../api/crm";
import { useMediaQuery } from "react-responsive";
import "./TeacherDetailPage.css";

const { Title } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const TeacherDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyMetadata, setHistoryMetadata] = useState({
    total: 0,
    page: 1,
    limit: 10,
  });
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const MENU_CONFIG = {
    MENU001: { name: "학생", icon: "👥" },
    MENU002: { name: "결제", icon: "💳" },
    MENU003: { name: "할일", icon: "📝" },
  };

  const PERMISSIONS = [
    { key: "canRead", name: "읽기" },
    { key: "canCreate", name: "생성" },
    { key: "canUpdate", name: "수정" },
    { key: "canDelete", name: "삭제" },
  ];

  const fetchTeacherDetail = useCallback(async () => {
    setLoading(true);
    try {
      const [teacherResponse, permissionsResponse] = await Promise.all([
        getTeacherDetail(id),
        getTeacherPermissions(id),
      ]);

      const teacherData = {
        ...teacherResponse.data,
        permissions: permissionsResponse.data.teachers[0].permissions,
      };

      setTeacher(teacherData);
      form.setFieldsValue(teacherData);
    } catch (error) {
      message.error("선생님 정보를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  }, [id, form]);

  useEffect(() => {
    fetchTeacherDetail();
  }, [fetchTeacherDetail]);

  const handleEdit = async (values) => {
    try {
      const updatedValues = { ...values };
      if (!updatedValues.password) {
        delete updatedValues.password;
      }

      await updateTeacher(id, updatedValues);
      message.success("선생님 정보가 수정되었습니다");
      fetchTeacherDetail();
      form.setFieldValue("password", "");
    } catch (error) {
      message.error("선생님 정보 수정에 실패했습니다");
    }
  };

  const handleDelete = async () => {
    try {
      AntModal.confirm({
        title: "선생님 삭제",
        content: "이 선생님을 삭제하시겠습니까?",
        okText: "삭제",
        okType: "danger",
        cancelText: "취소",
        onOk: async () => {
          await deleteTeacher(id);
          message.success("선생님이 삭제되었습니다");
          navigate("/teachers");
        },
      });
    } catch (error) {
      message.error("선생님 삭제에 실패했습니다");
    }
  };

  const handlePermissionChange = async (permission) => {
    try {
      await updateTeacherPermission(permission.id, permission);
      message.success("권한이 업데이트되었습니다");
      setTeacher((prev) => ({
        ...prev,
        permissions: prev.permissions.map((p) =>
          p.id === permission.id ? permission : p
        ),
      }));
    } catch (error) {
      message.error("권한 업데이트에 실패했습니다");
    }
  };

  const fetchTeacherHistory = async () => {
    try {
      const response = await getTeacherHistoryList(id, historyPage, 10);
      setHistoryData(response.data.data);
      setHistoryMetadata({
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
      });
    } catch (error) {
      message.error("히스토리 정보를 불러오는데 실패했습니다");
    }
  };

  const renderTeacherForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleEdit}
      style={{
        background: "#fff",
        padding: isMobile ? 0 : "32px",
        borderRadius: "8px",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
      }}
    >
      <Card
        title="기본 정보"
        bordered={false}
        style={{ marginBottom: "24px", padding: " 0 24px" }}
      >
        <Row gutter={24}>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item name="name" label="이름" rules={[{ required: true }]}>
              <Input prefix={<UserOutlined />} placeholder="홍길동" />
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item
              name="subject"
              label="담당 과목"
              rules={[{ required: true }]}
            >
              <Input prefix={<BookOutlined />} placeholder="수학" />
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item
              name="email"
              label="이메일"
              rules={[{ required: true, type: "email" }]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="example@email.com"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item name="color" label="테마 색상">
              <Input type="color" />
            </Form.Item>
          </Col>
          <Col span={isMobile ? 24 : 8}>
            <Form.Item
              name="password"
              label="비밀번호"
              rules={[
                {
                  min: 6,
                  message: "비밀번호는 최소 6자 이상이어야 합니다",
                },
              ]}
            >
              <Input.Password
                placeholder="새 비밀번호"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Form.Item style={{ marginBottom: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <Button danger onClick={handleDelete}>
            삭제
          </Button>
          <Space>
            <Button onClick={() => navigate("/teachers")}>취소</Button>
            <Button type="primary" htmlType="submit">
              저장
            </Button>
          </Space>
        </div>
      </Form.Item>
    </Form>
  );

  const permissionColumns = [
    {
      title: "페이지",
      dataIndex: "menuName",
      key: "menuName",
      width: "20%",
      render: (_, record) => (
        <Space>
          {!isMobile && MENU_CONFIG[record.menuCode].icon}{" "}
          {MENU_CONFIG[record.menuCode].name}
        </Space>
      ),
    },
    ...PERMISSIONS.map((permission) => ({
      title: permission.name,
      key: permission.key,
      width: "20%",
      align: "center",
      render: (_, record) => (
        <Switch
          size="small"
          checked={record.permission[permission.key]}
          onChange={(checked) => {
            handlePermissionChange({
              ...record.permission,
              [permission.key]: checked,
            });
          }}
        />
      ),
    })),
  ];

  const historyColumns = [
    {
      title: "일시",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "30%",
      render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "액션",
      dataIndex: "action",
      key: "action",
      width: "20%",
    },
    {
      title: "상세",
      dataIndex: "detail",
      key: "detail",
      width: "50%",
    },
  ];

  if (loading)
    return (
      <Spin size="large" style={{ margin: "200px auto", display: "block" }} />
    );
  if (!teacher) return null;

  return (
    <div style={{ padding: isMobile ? 0 : "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          선생님 정보
        </Title>
      </div>

      <Tabs
        defaultActiveKey="1"
        onChange={(key) => {
          if (key === "3") {
            fetchTeacherHistory();
          }
        }}
      >
        <TabPane tab="선생님 정보" key="1">
          {renderTeacherForm()}
        </TabPane>
        <TabPane tab="권한 관리" key="2">
          <Card
            style={{
              padding: isMobile ? 0 : "24px",
            }}
          >
            <Table
              columns={permissionColumns}
              dataSource={teacher?.permissions
                .filter((item) => MENU_CONFIG[item.menuCode])
                .sort((a, b) => a.menuCode.localeCompare(b.menuCode))
                .map((permission) => ({
                  key: permission.id,
                  menuCode: permission.menuCode,
                  permission,
                }))}
              pagination={false}
              style={{
                ".ant-table-cell": {
                  padding: isMobile ? "9px" : "16px",
                },
              }}
            />
          </Card>
        </TabPane>
        <TabPane tab="히스토리" key="3">
          <Card style={{ padding: isMobile ? 0 : "24px" }}>
            <Table
              columns={historyColumns}
              dataSource={historyData}
              rowKey="id"
              pagination={{
                current: historyPage,
                total: historyMetadata.total,
                pageSize: historyMetadata.limit,
                onChange: (newPage) => {
                  setHistoryPage(newPage);
                  fetchTeacherHistory();
                },
                showSizeChanger: false,
              }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TeacherDetailPage;
