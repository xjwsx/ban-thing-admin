import React, { useState, useEffect } from "react";
import {
  getNoticeList,
  createNotice,
  updateNotice,
  deleteNotice,
  incrementNoticeViewCount,
} from "../../api/crm";
import { NOTICE_TARGET } from "../../types/notice";
import {
  Form,
  Input,
  Button,
  Table,
  Space,
  Modal,
  Select,
  Switch,
  DatePicker,
  Tag,
  Divider,
  Row,
  Col,
  Card,
  Typography,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const NoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    isImportant: null,
    target: "",
    startDate: null,
    endDate: null,
    isActive: true,
  });
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    authorId: 1,
    isImportant: false,
    target: NOTICE_TARGET.ALL,
    startDate: dayjs().format("YYYY-MM-DD"),
    endDate: dayjs().add(30, 'day').format("YYYY-MM-DD"),
    isActive: true,
  });

  const fetchNotices = async () => {
    try {
      const response = await getNoticeList(page + 1, rowsPerPage, filters);
      setNotices(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error("공지사항 목록을 불러오는 중 오류가 발생했습니다:", error);
    }
  };

  const handleOpenDialog = (mode, notice = null) => {
    setDialogMode(mode);
    if (notice) {
      setSelectedNotice(notice);
      setFormData({
        title: notice.title,
        content: notice.content,
        authorId: notice.author?.id || 1,
        isImportant: notice.isImportant,
        target: notice.target,
        startDate: notice.startDate.split("T")[0],
        endDate: notice.endDate.split("T")[0],
        isActive: notice.isActive,
      });
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      authorId: 1,
      isImportant: false,
      target: NOTICE_TARGET.ALL,
      startDate: dayjs().format("YYYY-MM-DD"),
      endDate: dayjs().add(30, 'day').format("YYYY-MM-DD"),
      isActive: true,
    });
    setSelectedNotice(null);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFilters({
      ...filters,
      [name]: type === "checkbox" ? checked : value,
    });
    setPage(0);
  };

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date ? dayjs(date).format("YYYY-MM-DD") : null,
    });
  };

  const handleFilterDateChange = (name, date) => {
    setFilters({
      ...filters,
      [name]: date ? dayjs(date).format("YYYY-MM-DD") : null,
    });
    setPage(0);
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === "create") {
        await createNotice(formData);
      } else {
        await updateNotice(selectedNotice.id, formData);
      }
      handleCloseDialog();
      fetchNotices();
    } catch (error) {
      console.error("공지사항 저장 중 오류가 발생했습니다:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
      try {
        await deleteNotice(id);
        fetchNotices();
      } catch (error) {
        console.error("공지사항 삭제 중 오류가 발생했습니다:", error);
      }
    }
  };

  const handleViewNotice = async (notice) => {
    try {
      await incrementNoticeViewCount(notice.id);
      setSelectedNotice(notice);
      setViewDialogOpen(true);
    } catch (error) {
      console.error("조회수 증가 중 오류가 발생했습니다:", error);
    }
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      isImportant: null,
      target: "",
      startDate: null,
      endDate: null,
      isActive: true,
    });
  };

  const getTargetLabel = (target) => {
    switch (target) {
      case NOTICE_TARGET.ALL:
        return "전체";
      case NOTICE_TARGET.DOCTORS:
        return "의사";
      case NOTICE_TARGET.STAFF:
        return "스태프";
      default:
        return "";
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [page, rowsPerPage, filters]);

  return (
    <Container>
      <Title level={4}>공지사항 관리</Title>

      {/* 필터 영역 */}
      <FilterWrapper>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Form.Item label="검색어">
                <Input
                  placeholder="제목 검색"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  prefix={<SearchOutlined />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6}>
              <Form.Item label="대상">
                <Select
                  placeholder="대상 선택"
                  style={{ width: '100%' }}
                  name="target"
                  value={filters.target}
                  onChange={(value) => setFilters({...filters, target: value})}
                >
                  <Option value="">전체</Option>
                  <Option value={NOTICE_TARGET.ALL}>모든 사용자</Option>
                  <Option value={NOTICE_TARGET.DOCTORS}>의사</Option>
                  <Option value={NOTICE_TARGET.STAFF}>스태프</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={4}>
              <Form.Item label="중요 공지">
                <Switch
                  checked={filters.isImportant || false}
                  onChange={(checked) => setFilters({...filters, isImportant: checked})}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={4}>
              <Form.Item label="활성화 공지">
                <Switch
                  checked={filters.isActive || false}
                  onChange={(checked) => setFilters({...filters, isActive: checked})}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={4}>
              <Form.Item label=" ">
                <Button onClick={resetFilters}>필터 초기화</Button>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="기간">
                <RangePicker
                  style={{ width: '100%' }}
                  value={[
                    filters.startDate ? dayjs(filters.startDate) : null,
                    filters.endDate ? dayjs(filters.endDate) : null
                  ]}
                  onChange={(dates) => {
                    if (dates) {
                      handleFilterDateChange("startDate", dates[0]);
                      handleFilterDateChange("endDate", dates[1]);
                    } else {
                      setFilters({
                        ...filters,
                        startDate: null,
                        endDate: null
                      });
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </FilterWrapper>

      {/* 공지사항 추가 버튼 */}
      <TableActions>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => handleOpenDialog("create")}
        >
          새 공지사항
        </Button>
      </TableActions>

      {/* 공지사항 테이블 */}
      <Table
        dataSource={notices}
        rowKey="id"
        pagination={{
          current: page + 1,
          pageSize: rowsPerPage,
          total: total,
          onChange: (page, pageSize) => {
            setPage(page - 1);
            setRowsPerPage(pageSize);
          },
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 25]
        }}
        columns={[
          {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: '5%'
          },
          {
            title: '제목',
            dataIndex: 'title',
            key: 'title',
            width: '40%',
            render: (text, record) => (
              <Space>
                {record.isImportant && (
                  <ImportantTag color="error">중요</ImportantTag>
                )}
                <StyledTag onClick={() => handleViewNotice(record)}>
                  {text}
                </StyledTag>
              </Space>
            )
          },
          {
            title: '대상',
            dataIndex: 'target',
            key: 'target',
            width: '15%',
            render: (target) => getTargetLabel(target)
          },
          {
            title: '중요',
            dataIndex: 'isImportant',
            key: 'isImportant',
            width: '10%',
            render: (isImportant) => isImportant ? '예' : '아니오'
          },
          {
            title: '조회수',
            dataIndex: 'viewCount',
            key: 'viewCount',
            width: '10%'
          },
          {
            title: '활성화',
            dataIndex: 'isActive',
            key: 'isActive',
            width: '10%',
            render: (isActive) => isActive ? '예' : '아니오'
          },
          {
            title: '작업',
            key: 'actions',
            width: '10%',
            render: (_, record) => (
              <Space>
                <Tooltip title="보기">
                  <Button 
                    icon={<EyeOutlined />} 
                    size="small" 
                    onClick={() => handleViewNotice(record)}
                  />
                </Tooltip>
                <Tooltip title="수정">
                  <Button 
                    icon={<EditOutlined />} 
                    size="small" 
                    onClick={() => handleOpenDialog("edit", record)}
                  />
                </Tooltip>
                <Tooltip title="삭제">
                  <Button 
                    icon={<DeleteOutlined />} 
                    size="small" 
                    danger
                    onClick={() => handleDelete(record.id)}
                  />
                </Tooltip>
              </Space>
            )
          }
        ]}
        locale={{
          emptyText: '공지사항이 없습니다.'
        }}
      />

      {/* 공지사항 생성/수정 모달 */}
      <Modal
        title={dialogMode === "create" ? "공지사항 생성" : "공지사항 수정"}
        open={openDialog}
        onCancel={handleCloseDialog}
        footer={[
          <Button key="cancel" onClick={handleCloseDialog}>
            취소
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleSubmit}
          >
            저장
          </Button>
        ]}
        width={800}
      >
        <Form layout="vertical">
          <Form.Item 
            label="제목" 
            required
          >
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item 
            label="내용" 
            required
          >
            <TextArea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={8}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="대상" 
              >
                <Select
                  name="target"
                  value={formData.target}
                  onChange={(value) => setFormData({...formData, target: value})}
                  style={{ width: '100%' }}
                >
                  <Option value={NOTICE_TARGET.ALL}>모든 사용자</Option>
                  <Option value={NOTICE_TARGET.DOCTORS}>의사</Option>
                  <Option value={NOTICE_TARGET.STAFF}>스태프</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="중요 공지사항">
                <Switch
                  checked={formData.isImportant}
                  onChange={(checked) => setFormData({...formData, isImportant: checked})}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="시작일">
                <DatePicker
                  value={formData.startDate ? dayjs(formData.startDate) : null}
                  onChange={(date) => handleDateChange("startDate", date)}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="종료일">
                <DatePicker
                  value={formData.endDate ? dayjs(formData.endDate) : null}
                  onChange={(date) => handleDateChange("endDate", date)}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="활성화">
            <Switch
              checked={formData.isActive}
              onChange={(checked) => setFormData({...formData, isActive: checked})}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 공지사항 상세 보기 모달 */}
      <Modal
        title={
          selectedNotice && (
            <Space>
              {selectedNotice.isImportant && (
                <ImportantTag color="error">중요</ImportantTag>
              )}
              {selectedNotice?.title}
            </Space>
          )
        }
        open={viewDialogOpen}
        onCancel={() => setViewDialogOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewDialogOpen(false)}>
            닫기
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setViewDialogOpen(false);
              selectedNotice && handleOpenDialog("edit", selectedNotice);
            }}
          >
            수정
          </Button>
        ]}
        width={800}
      >
        {selectedNotice && (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary">
                  작성자: {selectedNotice.author?.name || '관리자'}
                </Text>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Text type="secondary">
                  조회수: {selectedNotice.viewCount + 1}
                </Text>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 8 }}>
              <Col span={12}>
                <Text type="secondary">
                  대상: {getTargetLabel(selectedNotice.target)}
                </Text>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Text type="secondary">
                  게시 기간: {dayjs(selectedNotice.startDate).format('YYYY-MM-DD')} ~ 
                  {dayjs(selectedNotice.endDate).format('YYYY-MM-DD')}
                </Text>
              </Col>
            </Row>
            <Divider />
            <div style={{ whiteSpace: 'pre-line', marginTop: 16 }}>
              {selectedNotice.content}
            </div>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default NoticesPage; 

const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const FilterWrapper = styled(Card)`
  margin-bottom: 20px;
`;

const TableActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
`;

const StyledTag = styled(Tag)`
  cursor: pointer;
`;

const ImportantTag = styled(Tag)`
  margin-right: 8px;
`;