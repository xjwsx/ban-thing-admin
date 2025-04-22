import React, { useState, useEffect } from "react";
import {
  Select,
  Space,
  Modal,
  Input,
  DatePicker,
  message,
  Form,
  Spin,
  List,
  Tooltip,
  Divider,
  Popconfirm,
  Avatar,
} from "antd";
import { DeleteOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import useStore from "../../stores/todoStore";
import useDoctorStore from "../../stores/doctorStore";
import TodoView from "../../components/TodoManagement/TodoView";
import {
  getDoctorTaskList,
  updateDoctorTask,
  deleteDoctorTask,
  createDoctorTask,
  getDoctorList,
  getDoctorTaskCommentList,
  createDoctorTaskComment,
  deleteDoctorTaskComment,
} from "../../api/crm";
import { useMediaQuery } from "react-responsive";
import { usePermission } from "../../hooks/usePermission";
import { 
  NotionContainer, 
  NotionHeader, 
  NotionSection, 
  NotionDivider 
} from "../../components/NotionLayout";
import {
  Alert,
  AlertDescription,
} from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { PlusIcon, InfoIcon } from "lucide-react";
const { Option } = Select;
const { confirm } = Modal;

// 사용자 정의 댓글 컴포넌트
const CommentItem = ({ comment, onDelete }) => {
  const { doctorInfo } = useDoctorStore();

  if (!comment) {
    return null;
  }

  // API 응답에서 doctor 또는 author 필드를 사용
  const author = comment.doctor || comment.author || {};
  const authorName = author?.name || "알 수 없음";
  const authorColor = author?.color || "#1890ff";

  // 현재 로그인한 사용자가 댓글 작성자인지 확인
  const isCommentAuthor = doctorInfo && author && doctorInfo.id === author.id;

  return (
    <div
      style={{
        display: "flex",
        padding: "12px 0",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <Avatar
        icon={<UserOutlined />}
        style={{
          backgroundColor: authorColor,
          marginRight: "12px",
          flexShrink: 0,
        }}
      >
        {authorName.charAt(0)}
      </Avatar>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: "bold" }}>{authorName}</span>
          <Tooltip
            title={dayjs(comment.createdAt).format("YYYY-MM-DD HH:mm:ss")}
          >
            <span style={{ fontSize: "12px", color: "#999" }}>
              {dayjs(comment.createdAt || new Date()).format(
                "YYYY.MM.DD HH:mm"
              )}
            </span>
          </Tooltip>
        </div>
        <div style={{ margin: "8px 0" }}>{comment.content || ""}</div>
        <div style={{ textAlign: "right" }}>
          {isCommentAuthor && (
            <Popconfirm
              title="댓글을 삭제하시겠습니까?"
              onConfirm={() => onDelete(comment.id)}
              okText="삭제"
              cancelText="취소"
            >
              <Button type="text" danger size="small" icon={<DeleteOutlined />}>
                삭제
              </Button>
            </Popconfirm>
          )}
        </div>
      </div>
    </div>
  );
};

const TodoPage = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isAddTodoModalVisible, setIsAddTodoModalVisible] = useState(false);
  const [selectedTodoType, setSelectedTodoType] = useState("todo");

  const { tasks, updateTask, deleteTask } = useStore();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const isMobile = useMediaQuery({ maxWidth: 768 });

  const columns = {
    todo: {
      title: "할 일",
      isDraggable: true,
    },
    inProgress: {
      title: "진행 중",
      isDraggable: true,
    },
    done: {
      title: "완료",
      isDraggable: true,
    },
  };

  const { checkPermission } = usePermission("todo");

  const [commentLoading, setCommentLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentForm] = Form.useForm();

  const { doctorInfo, fetchDoctorInfo } = useDoctorStore();

  const fetchDoctorTasks = async () => {
    // Check if user has read permission
    if (!checkPermission("canRead")) {
      message.error("할 일 관리 조회 권한이 없습니다.");
      return;
    }

    try {
      setLoading(true);
      const response = await getDoctorTaskList();

      const transformedTasks = {
        todo: [],
        inProgress: [],
        done: [],
      };

      response.data.forEach((task) => {
        const status = task.status.toLowerCase();
        if (status === "todo" || status === "inprogress" || status === "done") {
          // Handle both single assignedTo and multiple assignees
          const assignedTo = task.assignedTo || {};
          const assignedToNames = Array.isArray(task.assignedTo) 
            ? task.assignedTo.map(doctor => doctor.name).join(', ')
            : assignedTo.name || '';
          
          // Handle both single assignedToId and multiple assignedToIds
          const assignedToId = task.assignedToId;
          const assignedToIds = Array.isArray(task.assignedToIds) 
            ? task.assignedToIds 
            : (assignedToId ? [assignedToId] : []);

          transformedTasks[
            status === "inprogress" ? "inProgress" : status
          ].push({
            id: String(task.id),
            title: task.title,
            content: task.description,
            description: task.description,
            startDate: task.startDate,
            endDate: task.endDate,
            doctor: task.assignedTo,
            registeredBy: task.registeredBy.name,
            assignedTo: assignedToNames,
            registeredById: task.registeredById,
            assignedToId: assignedToId,
            assignedToIds: assignedToIds,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            commentCount: task.commentCount || 0,
          });
        }
      });

      useStore.setState({ tasks: transformedTasks });
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      message.error("할일 목록을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await getDoctorList(1, 1000);
      const doctorList = response.data.items || response.data.data || [];
      setDoctors(doctorList);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      message.error("선생님 목록을 불러오는데 실패했습니다");
      setDoctors([]);
    }
  };

  useEffect(() => {
    fetchDoctorTasks();
    fetchDoctors();
    fetchDoctorInfo().catch((error) => {
      console.error("Failed to fetch doctor info:", error);
    });
  }, []);

  const onDragEnd = async (result) => {
    // Check if user has write permission
    if (!checkPermission("canUpdate")) {
      message.error("할 일 상태 변경 권한이 없습니다.");
      return;
    }

    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const currentTasks = useStore.getState().tasks;

    const sourceColumn = Array.from(currentTasks[source.droppableId]);
    const destColumn = Array.from(currentTasks[destination.droppableId]);

    const [removed] = sourceColumn.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceColumn.splice(destination.index, 0, removed);

      const newTasks = {
        ...currentTasks,
        [source.droppableId]: sourceColumn,
      };

      useStore.setState({ tasks: newTasks });
    } else {
      destColumn.splice(destination.index, 0, {
        ...removed,
        status: destination.droppableId,
      });

      const newTasks = {
        ...currentTasks,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn,
      };

      useStore.setState({ tasks: newTasks });

      try {
        const apiStatus =
          destination.droppableId === "inProgress"
            ? "inprogress"
            : destination.droppableId;
        await updateDoctorTask(draggableId, {
          status: apiStatus,
        });
      } catch (error) {
        console.error("Failed to update task status:", error);
        message.error("상태 변경에 실패했습니다");
      }
    }
  };

  const todoTasks = {
    todo: tasks.todo || [],
    inProgress: tasks.inProgress || [],
    done: tasks.done || [],
  };

  const filteredTodoTasks = {
    todo: todoTasks.todo.filter(
      (task) => !selectedDoctor || 
        task.assignedToId === selectedDoctor || 
        (task.assignedToIds && task.assignedToIds.includes(selectedDoctor))
    ),
    inProgress: todoTasks.inProgress.filter(
      (task) => !selectedDoctor || 
        task.assignedToId === selectedDoctor || 
        (task.assignedToIds && task.assignedToIds.includes(selectedDoctor))
    ),
    done: todoTasks.done.filter(
      (task) => !selectedDoctor || 
        task.assignedToId === selectedDoctor || 
        (task.assignedToIds && task.assignedToIds.includes(selectedDoctor))
    ),
  };

  const fetchComments = async (taskId) => {
    try {
      setCommentLoading(true);
      const response = await getDoctorTaskCommentList(parseInt(taskId, 10));
      console.log("댓글 데이터:", response.data);
      setComments(response.data || []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      message.error("댓글 목록을 불러오는데 실패했습니다");
      setComments([]);
    } finally {
      setCommentLoading(false);
    }
  };

  const showModal = (task = null, status = null) => {
    if (task && !checkPermission("canUpdate")) {
      Modal.error({
        title: "권한 없음",
        content: "할 일 수정 권한이 없습니다.",
      });
      return;
    }

    if (!task && !checkPermission("canCreate")) {
      Modal.error({
        title: "권한 없음",
        content: "할 일 등록 권한이 없습니다.",
      });
      return;
    }

    setIsEdit(!!task);
    setSelectedTask(task);

    if (task) {
      // Edit mode
      form.setFieldsValue({
        title: task.title,
        content: task.description,
        startDate: task.startDate ? dayjs(task.startDate) : null,
        endDate: task.endDate ? dayjs(task.endDate) : null,
        registeredById: task.registeredById,
        assignedToId: task.assignedToIds || (task.assignedToId ? [task.assignedToId] : []),
      });

      // Fetch comments for this task
      fetchComments(task.id);
      commentForm.resetFields();
    } else {
      // Add mode
      form.resetFields();
      setComments([]);
    }
    setModalVisible(true);
  };

  const handleModalSubmit = async (values) => {
    try {
      if (isEdit && selectedTask) {
        // Update existing task
        const apiStatus =
          selectedTask.status === "inProgress"
            ? "inprogress"
            : selectedTask.status;
        await updateDoctorTask(selectedTask.id, {
          title: values.title,
          description: values.content,
          status: apiStatus,
          startDate: values.startDate
            ? values.startDate.format("YYYY-MM-DD")
            : null,
          endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
          registeredById: values.registeredById,
          assignedToIds: values.assignedToId, // Using the array of IDs directly
        });
        message.success("수정되었습니다");
      } else {
        // Create new task
        await createDoctorTask({
          title: values.title,
          description: values.content,
          status: "todo",
          startDate: values.startDate
            ? values.startDate.format("YYYY-MM-DD")
            : null,
          endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
          registeredById: values.registeredById,
          assignedToIds: values.assignedToId, // Using the array of IDs directly
        });
        message.success("할일이 추가되었습니다");
      }

      setModalVisible(false);
      form.resetFields();
      commentForm.resetFields();
      setSelectedTask(null);
      setComments([]);
      await fetchDoctorTasks();
    } catch (error) {
      console.error("Failed to handle task:", error);
      message.error(
        isEdit
          ? "수정 중 오류가 발생했습니다"
          : "할일 추가 중 오류가 발생했습니다"
      );
    }
  };

  const showDeleteConfirm = (e, task, status) => {
    if (!checkPermission("canDelete")) {
      Modal.error({
        title: "권한 없음",
        content: "할 일 삭제 권한이 없습니다.",
      });
      return;
    }

    e && e.stopPropagation && e.stopPropagation();
    confirm({
      title: "할 일 삭제",
      content: "정말 삭제하시겠습니까?",
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      async onOk() {
        try {
          await deleteDoctorTask(task.id);
          await deleteTask({
            status: status,
            taskId: task.id,
          });
          message.success("삭제되었습니다");

          await fetchDoctorTasks();
          setModalVisible(false);
        } catch (error) {
          console.error("Failed to delete task:", error);
          message.error("삭제 중 오류가 발생했습니다");
        }
      },
    });
  };

  const showAddTodoModal = () => {
    if (!checkPermission("canCreate")) {
      Modal.error({
        title: "권한 없음",
        content: "할 일 등록 권한이 없습니다.",
      });
      return;
    }
    
    form.resetFields();
    setSelectedTodoType("todo");
    setIsAddTodoModalVisible(true);
  };

  const handleAddTodo = async (values) => {
    try {
      const requestData = {
        title: values.title,
        description: values.content,
        status: "todo",
        startDate: values.startDate
          ? values.startDate.format("YYYY-MM-DD")
          : null,
        endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
        registeredById: values.registeredById,
        assignedToIds: values.assignedToId, // Using the array of IDs directly
      };

      await createDoctorTask(requestData);

      message.success("할일이 추가되었습니다");
      setIsAddTodoModalVisible(false);
      form.resetFields();

      await fetchDoctorTasks();
    } catch (error) {
      console.error("Failed to add task:", error);
      message.error("할일 추가 중 오류가 발생했습니다");
    }
  };

  const renderDoctorOptions = () => {
    if (!Array.isArray(doctors)) return null;

    return doctors.map((doctor) => (
      <Option key={doctor.id} value={doctor.id}>
        {doctor.name}
      </Option>
    ));
  };

  const truncatePlaceholder = (text) => {
    return text.length > 10 ? text.slice(0, 10) + "..." : text;
  };

  const handleCommentSubmit = async (values) => {
    try {
      if (!selectedTask) return;

      if (!doctorInfo || !doctorInfo.id) {
        message.error("로그인된 선생님 정보를 찾을 수 없습니다");
        return;
      }

      const payload = {
        content: values.comment,
        taskId: parseInt(selectedTask.id, 10),
        doctorId: doctorInfo.id,
        authorId: doctorInfo.id,
      };

      console.log("댓글 작성 요청 데이터:", payload);

      const response = await createDoctorTaskComment(payload);
      console.log("댓글 작성 응답:", response);

      message.success("댓글이 등록되었습니다");
      commentForm.resetFields();

      // Refresh comments
      await fetchComments(selectedTask.id);

      // Refresh tasks to update comment count
      await fetchDoctorTasks();
    } catch (error) {
      console.error("Failed to add comment:", error);
      message.error("댓글 등록에 실패했습니다");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteDoctorTaskComment(commentId);
      message.success("댓글이 삭제되었습니다");

      // Refresh comments
      if (selectedTask) {
        await fetchComments(selectedTask.id);
        // Refresh tasks to update comment count
        await fetchDoctorTasks();
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      message.error("댓글 삭제에 실패했습니다");
    }
  };

  return (
    <NotionContainer>
      <NotionHeader 
        title="할 일 관리" 
        description="팀의 할 일을 관리하고 진행 상황을 추적합니다."
      />
      
      <Alert variant="default" className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          완료된 할일은 1개월 이내의 항목만 표시됩니다
        </AlertDescription>
      </Alert>
      
      <NotionSection title="할 일 보드" className="flex-1 flex flex-col min-h-[calc(100vh-280px)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="w-full md:w-64">
            <Select
              className="w-full"
              placeholder="선생님 필터"
              allowClear
              onChange={setSelectedDoctor}
              value={selectedDoctor}
            >
              {renderDoctorOptions()}
            </Select>
          </div>
          <Button
            onClick={() => showModal()}
            className="w-full md:w-auto"
          >
            <PlusIcon className="mr-2 h-4 w-4" /> 할일 등록
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12 flex-1">
            <Spin size="large" />
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <TodoView
              tasks={filteredTodoTasks}
              columns={columns}
              onDragEnd={onDragEnd}
              showEditModal={showModal}
              showDeleteConfirm={showDeleteConfirm}
              isMobile={isMobile}
              isDraggable={checkPermission("canUpdate")}
            />
          </div>
        )}
      </NotionSection>

      <Modal
        title={isEdit ? "할 일 수정" : "할일 추가"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          commentForm.resetFields();
          setSelectedTask(null);
          setComments([]);
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleModalSubmit}>
          <Form.Item
            name="title"
            label="제목"
            rules={[{ required: true, message: "제목을 입력해주세요" }]}
          >
            <Input placeholder="할 일 제목을 입력해주세요" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="content"
            label="내용"
            rules={[{ required: true, message: "내용을 입력해주세요" }]}
          >
            <Input.TextArea
              placeholder="할 일 내용을 입력해주세요"
              rows={4}
              style={{ width: "100%" }}
              maxLength={500}
              showCount
            />
          </Form.Item>

          {isEdit &&
            selectedTask &&
            selectedTask.content &&
            selectedTask.content.includes("http") && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
                  미리보기:
                </div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: selectedTask.content.replace(
                      /(https?:\/\/[^\s]+)/g,
                      '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #1890ff; text-decoration: underline;">$1</a>'
                    ),
                  }}
                />
              </div>
            )}

          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <Form.Item
              name="registeredById"
              label="등록한 사람"
              rules={[
                { required: true, message: "등록한 사람을 선택해주세요" },
              ]}
              style={{ flex: 1, marginBottom: 0 }}
            >
              <Select
                placeholder={
                  isMobile
                    ? truncatePlaceholder("등록한 사람을 선택해주세요")
                    : "등록한 사람을 선택해주세요"
                }
              >
                {renderDoctorOptions()}
              </Select>
            </Form.Item>
            <Form.Item
              name="assignedToId"
              label="담당자"
              rules={[{ required: true, message: "담당자를 선택해주세요" }]}
              style={{ flex: 1, marginBottom: 0 }}
            >
              <Select
                placeholder={
                  isMobile
                    ? truncatePlaceholder("담당자를 선택해주세요")
                    : "담당자를 선택해주세요"
                }
                mode="multiple"
                allowClear
              >
                {renderDoctorOptions()}
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <Form.Item
              name="startDate"
              label="시작일"
              style={{ flex: 1, marginBottom: 0 }}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="시작일을 선택해주세요"
              />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="마감일"
              style={{ flex: 1, marginBottom: 0 }}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="마감일을 선택해주세요"
                disabledDate={(current) => {
                  const startDate = form.getFieldValue("startDate");
                  return startDate && current && current < startDate;
                }}
              />
            </Form.Item>
          </div>

          {/* 버튼 영역 */}
          <Form.Item style={{ marginBottom: 24 }}>
            {isEdit ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Button
                  key="delete"
                  danger
                  onClick={() =>
                    showDeleteConfirm(null, selectedTask, selectedTask?.status)
                  }
                >
                  삭제
                </Button>
                <div>
                  <Button
                    key="cancel"
                    onClick={() => {
                      setModalVisible(false);
                      form.resetFields();
                      commentForm.resetFields();
                      setSelectedTask(null);
                      setComments([]);
                    }}
                    style={{ marginRight: 8 }}
                  >
                    취소
                  </Button>
                  <Button
                    key="submit"
                    type="primary"
                    onClick={() => form.submit()}
                  >
                    수정
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "right" }}>
                <Space>
                  <Button
                    onClick={() => {
                      setModalVisible(false);
                      form.resetFields();
                      commentForm.resetFields();
                      setComments([]);
                    }}
                  >
                    취소
                  </Button>
                  <Button type="primary" htmlType="submit">
                    등록
                  </Button>
                </Space>
              </div>
            )}
          </Form.Item>
        </Form>

        {isEdit && selectedTask && (
          <>
            <Divider
              orientation="left"
              style={{
                margin: "32px 0 24px",
                borderWidth: 2,
                borderColor: "#f0f0f0",
              }}
            >
              <span style={{ fontSize: "16px", fontWeight: "bold" }}>댓글</span>
            </Divider>
            {commentLoading ? (
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <Spin size="small" />
              </div>
            ) : (
              <>
                <List
                  dataSource={comments.filter((comment) => comment)}
                  locale={{ emptyText: "아직 댓글이 없습니다" }}
                  renderItem={(comment) => (
                    <CommentItem
                      comment={comment}
                      onDelete={handleDeleteComment}
                    />
                  )}
                />

                <Form
                  form={commentForm}
                  onFinish={handleCommentSubmit}
                  style={{ marginTop: 16 }}
                >
                  <Form.Item
                    name="comment"
                    rules={[
                      { required: true, message: "댓글 내용을 입력해주세요" },
                    ]}
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="댓글을 입력하세요"
                      maxLength={200}
                      showCount
                    />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                    <Button type="primary" htmlType="submit">
                      댓글 등록
                    </Button>
                  </Form.Item>
                </Form>
              </>
            )}
          </>
        )}
      </Modal>
    </NotionContainer>
  );
};

export default TodoPage;
