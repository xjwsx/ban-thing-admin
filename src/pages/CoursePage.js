import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Row,
  Pagination,
  Typography,
  Divider,
  Switch,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import { Modal as AntModal } from "antd";
import {
  getCourseList,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../api/crm";

const { Title } = Typography;

// 페이지 사이즈 상수 추가
const PAGE_SIZE = 10;

const CoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const columns = [
    {
      title: "코스명",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "설명",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "-",
    },
    {
      title: "수강료",
      dataIndex: "price",
      key: "price",
      render: (price) => `₩${price.toLocaleString()}`,
    },
    {
      title: "상태",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (isActive ? "활성" : "비활성"),
    },
  ];

  const fetchCourses = async (currentPage = page) => {
    setLoading(true);
    try {
      const response = await getCourseList(currentPage, PAGE_SIZE);
      if (response) {
        const sortedCourses = [...response.data].sort((a, b) => b.id - a.id);
        setCourses(sortedCourses);
        setTotal(response.data.length);
      } else {
        setCourses([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("코스 목록을 불러오는데 실패했습니다.");
      setCourses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchCourses(newPage);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCourse(id);
      message.success("코스가 삭제되었습니다.");
      setIsModalVisible(false);
      fetchCourses(page);
    } catch (error) {
      console.error("Error deleting course:", error);
      message.error("코스 삭제에 실패했습니다.");
    }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();

      const formData = {
        ...values,
        price: Number(values.price),
      };

      if (editingId) {
        await updateCourse(editingId, formData);
        message.success("코스가 수정되었습니다.");
      } else {
        await createCourse(formData);
        message.success("코스가 추가되었습니다.");
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchCourses(page);
    } catch (error) {
      console.error("Error saving course:", error);
      message.error("코스 저장에 실패했습니다.");
    }
  };

  // 삭제 확인 모달
  const showDeleteConfirm = () => {
    AntModal.confirm({
      title: "코스 삭제",
      content: "이 코스를 삭제하시겠습니까?",
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      onOk: async () => {
        await handleDelete(editingId);
      },
    });
  };

  return (
    <div style={{ padding: isMobile ? "0" : "0 0 12px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
          position: "relative",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          코스 관리 ({total}개)
        </Title>
        <div style={{ position: "absolute", right: 0 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{ marginRight: 8 }}
          >
            {isMobile ? "" : "코스 등록"}
          </Button>
        </div>
      </div>
      <Divider />

      <Table
        columns={columns}
        dataSource={courses}
        rowKey="id"
        loading={loading}
        onRow={(record) => ({
          onClick: () => handleEdit(record),
          style: { cursor: "pointer" },
        })}
        pagination={false}
      />

      <Row justify="end" style={{ marginTop: 16 }}>
        <Pagination
          current={page}
          total={total}
          pageSize={PAGE_SIZE}
          onChange={handlePageChange}
          showTotal={(total, range) => `${range[0]}-${range[1]} / ${total}`}
          showSizeChanger={false}
        />
      </Row>

      <Modal
        title={editingId ? "코스 수정" : "코스 추가"}
        open={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalVisible(false)}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              {editingId && (
                <Button danger onClick={showDeleteConfirm}>
                  삭제
                </Button>
              )}
            </div>
            <div>
              <Button
                onClick={() => setIsModalVisible(false)}
                style={{ marginRight: 8 }}
              >
                취소
              </Button>
              <Button type="primary" onClick={handleModalSubmit}>
                {editingId ? "수정" : "추가"}
              </Button>
            </div>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="코스명"
            rules={[{ required: true, message: "코스명을 입력해주세요" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="설명">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="price"
            label="수강료"
            rules={[{ required: true, message: "수강료를 입력해주세요" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="isActive"
            label="상태"
            initialValue={true}
            valuePropName="checked"
          >
            <Switch checkedChildren="활성" unCheckedChildren="비활성" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CoursePage;
