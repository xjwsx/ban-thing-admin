import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  Table,
  Switch,
  Select,
  Button,
  message,
  Spin,
  Alert,
} from "antd";
import { useDoctorStore } from "../stores/doctorStore";
import {
  getDoctorList,
  getDoctorPermissions,
  updateDoctorPermission,
} from "../api/crm";

const { Title } = Typography;
const { Option } = Select;

const PermissionsPage = () => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const { doctorInfo } = useDoctorStore();

  // 메뉴 코드와 이름 매핑
  const menuMap = {
    MENU000: "홈",
    MENU001: "고객 관리",
    MENU002: "코스 관리",
    MENU003: "예약 관리",
    MENU004: "공지사항",
    MENU005: "권한 관리",
  };

  const fetchDoctors = async () => {
    try {
      const response = await getDoctorList(1, 1000);
      const doctorList = response.data.items || response.data.data || [];
      setDoctors(doctorList);
    } catch (error) {
      console.error("의사 목록을 불러오는 중 오류 발생:", error);
      message.error("의사 목록을 불러오는데 실패했습니다");
    }
  };

  const fetchPermissions = async (doctorId) => {
    if (!doctorId) return;

    try {
      setLoading(true);
      const response = await getDoctorPermissions(doctorId);
      setPermissions(response.data || []);
    } catch (error) {
      console.error("권한 정보를 불러오는 중 오류 발생:", error);
      message.error("권한 정보를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchPermissions(selectedDoctor);
    } else {
      setPermissions([]);
    }
  }, [selectedDoctor]);

  const handleDoctorChange = (value) => {
    if (unsavedChanges) {
      if (window.confirm("저장되지 않은 변경사항이 있습니다. 계속하시겠습니까?")) {
        setSelectedDoctor(value);
        setUnsavedChanges(false);
      }
    } else {
      setSelectedDoctor(value);
    }
  };

  const handlePermissionChange = (permissionId, field, value) => {
    const updatedPermissions = permissions.map((permission) => {
      if (permission.id === permissionId) {
        return { ...permission, [field]: value };
      }
      return permission;
    });
    setPermissions(updatedPermissions);
    setUnsavedChanges(true);
  };

  const savePermissions = async () => {
    try {
      setLoading(true);
      for (const permission of permissions) {
        await updateDoctorPermission(permission.id, {
          canRead: permission.canRead,
          canCreate: permission.canCreate,
          canUpdate: permission.canUpdate,
          canDelete: permission.canDelete,
        });
      }
      message.success("권한이 성공적으로 저장되었습니다");
      setUnsavedChanges(false);
    } catch (error) {
      console.error("권한 저장 중 오류 발생:", error);
      message.error("권한 저장에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "메뉴",
      dataIndex: "menuCode",
      key: "menuCode",
      render: (menuCode) => menuMap[menuCode] || menuCode,
    },
    {
      title: "조회",
      dataIndex: "canRead",
      key: "canRead",
      render: (canRead, record) => (
        <Switch
          checked={canRead}
          onChange={(checked) => handlePermissionChange(record.id, "canRead", checked)}
          disabled={doctorInfo?.role !== "admin"}
        />
      ),
    },
    {
      title: "생성",
      dataIndex: "canCreate",
      key: "canCreate",
      render: (canCreate, record) => (
        <Switch
          checked={canCreate}
          onChange={(checked) => handlePermissionChange(record.id, "canCreate", checked)}
          disabled={doctorInfo?.role !== "admin"}
        />
      ),
    },
    {
      title: "수정",
      dataIndex: "canUpdate",
      key: "canUpdate",
      render: (canUpdate, record) => (
        <Switch
          checked={canUpdate}
          onChange={(checked) => handlePermissionChange(record.id, "canUpdate", checked)}
          disabled={doctorInfo?.role !== "admin"}
        />
      ),
    },
    {
      title: "삭제",
      dataIndex: "canDelete",
      key: "canDelete",
      render: (canDelete, record) => (
        <Switch
          checked={canDelete}
          onChange={(checked) => handlePermissionChange(record.id, "canDelete", checked)}
          disabled={doctorInfo?.role !== "admin"}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3}>권한 관리</Title>
      
      {doctorInfo?.role !== "admin" && (
        <Alert
          message="권한 관리는 관리자 계정만 사용할 수 있습니다"
          type="warning"
          showIcon
          style={{ marginBottom: "16px" }}
        />
      )}

      <Card style={{ marginTop: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <Select
            placeholder="의사 선택"
            style={{ width: "300px" }}
            onChange={handleDoctorChange}
            value={selectedDoctor}
            disabled={doctorInfo?.role !== "admin"}
          >
            {doctors.map((doctor) => (
              <Option key={doctor.id} value={doctor.id}>
                {doctor.name} ({doctor.role === "admin" ? "관리자" : "일반 사용자"})
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            onClick={savePermissions}
            disabled={!unsavedChanges || doctorInfo?.role !== "admin"}
          >
            저장
          </Button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={permissions}
            columns={columns}
            rowKey="id"
            pagination={false}
            locale={{ emptyText: "선택된 의사가 없거나 권한 정보가 없습니다" }}
          />
        )}
      </Card>
    </div>
  );
};

export default PermissionsPage; 