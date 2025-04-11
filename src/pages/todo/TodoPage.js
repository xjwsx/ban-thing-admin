import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Select,
  Space,
  Modal,
  Input,
  DatePicker,
  message,
  Form,
  Spin,
  Alert,
  List,
  Tooltip,
  Divider,
  Popconfirm,
  Avatar,
} from "antd";
import { PlusOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import useStore from "../../stores/todoStore";
import useTeacherStore from "../../stores/teacherStore";
import TodoView from "../../components/TodoManagement/TodoView";
import {
  getTeacherTaskList,
  updateTeacherTask,
  deleteTeacherTask,
  createTeacherTask,
  getTeacherList,
  getTeacherTaskCommentList,
  createTeacherTaskComment,
  deleteTeacherTaskComment,
} from "../../api/crm";
import { useMediaQuery } from "react-responsive";
import { usePermission } from "../../hooks/usePermission";
const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;

// 사용자 정의 댓글 컴포넌트
const CommentItem = ({ comment, onDelete }) => {
  const { teacherInfo } = useTeacherStore();

  if (!comment) {
    return null;
  }

  // API 응답에서 teacher 또는 author 필드를 사용
  const author = comment.teacher || comment.author || {};
  const authorName = author?.name || "알 수 없음";
  const authorColor = author?.color || "#1890ff";

  // 현재 로그인한 사용자가 댓글 작성자인지 확인
  const isCommentAuthor = teacherInfo && author && teacherInfo.id === author.id;

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

const TodoManagementPage = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isAddTodoModalVisible, setIsAddTodoModalVisible] = useState(false);
  const [selectedTodoType, setSelectedTodoType] = useState("todo");

  const { tasks, updateTask, deleteTask } = useStore();

  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

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

  const { checkPermission } = usePermission("MENU003");

  const [commentLoading, setCommentLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentForm] = Form.useForm();

  const { teacherInfo, fetchTeacherInfo } = useTeacherStore();

  const fetchTeacherTasks = async () => {
    try {
      setLoading(true);
      const response = await getTeacherTaskList();

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
            ? task.assignedTo.map(teacher => teacher.name).join(', ')
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
            teacher: task.assignedTo,
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

  const fetchTeachers = async () => {
    try {
      const response = await getTeacherList(1, 1000);
      const teacherList = response.data.items || response.data.data || [];
      setTeachers(teacherList);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      message.error("선생님 목록을 불러오는데 실패했습니다");
      setTeachers([]);
    }
  };

  useEffect(() => {
    fetchTeacherTasks();
    fetchTeachers();
    fetchTeacherInfo().catch((error) => {
      console.error("Failed to fetch teacher info:", error);
    });
  }, []);

  const onDragEnd = async (result) => {
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
        await updateTeacherTask(draggableId, {
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
      (task) => !selectedTeacher || 
        task.assignedToId === selectedTeacher || 
        (task.assignedToIds && task.assignedToIds.includes(selectedTeacher))
    ),
    inProgress: todoTasks.inProgress.filter(
      (task) => !selectedTeacher || 
        task.assignedToId === selectedTeacher || 
        (task.assignedToIds && task.assignedToIds.includes(selectedTeacher))
    ),
    done: todoTasks.done.filter(
      (task) => !selectedTeacher || 
        task.assignedToId === selectedTeacher || 
        (task.assignedToIds && task.assignedToIds.includes(selectedTeacher))
    ),
  };

  const fetchComments = async (taskId) => {
    try {
      setCommentLoading(true);
      const response = await getTeacherTaskCommentList(parseInt(taskId, 10));
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
        await updateTeacherTask(selectedTask.id, {
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
        await createTeacherTask({
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
      await fetchTeacherTasks();
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
          await deleteTeacherTask(task.id);
          await deleteTask({
            status: status,
            taskId: task.id,
          });
          message.success("삭제되었습니다");

          await fetchTeacherTasks();
          setModalVisible(false);
        } catch (error) {
          console.error("Failed to delete task:", error);
          message.error("삭제 중 오류가 발생했습니다");
        }
      },
    });
  };

  const showAddTodoModal = () => {
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

      await createTeacherTask(requestData);

      message.success("할일이 추가되었습니다");
      setIsAddTodoModalVisible(false);
      form.resetFields();

      await fetchTeacherTasks();
    } catch (error) {
      console.error("Failed to add task:", error);
      message.error("할일 추가 중 오류가 발생했습니다");
    }
  };

  const renderTeacherOptions = () => {
    if (!Array.isArray(teachers)) return null;

    return teachers.map((teacher) => (
      <Option key={teacher.id} value={teacher.id}>
        {teacher.name}
      </Option>
    ));
  };

  const truncatePlaceholder = (text) => {
    return text.length > 10 ? text.slice(0, 10) + "..." : text;
  };

  const handleCommentSubmit = async (values) => {
    try {
      if (!selectedTask) return;

      if (!teacherInfo || !teacherInfo.id) {
        message.error("로그인된 선생님 정보를 찾을 수 없습니다");
        return;
      }

      const payload = {
        content: values.comment,
        taskId: parseInt(selectedTask.id, 10),
        teacherId: teacherInfo.id,
        authorId: teacherInfo.id,
      };

      console.log("댓글 작성 요청 데이터:", payload);

      const response = await createTeacherTaskComment(payload);
      console.log("댓글 작성 응답:", response);

      message.success("댓글이 등록되었습니다");
      commentForm.resetFields();

      // Refresh comments
      await fetchComments(selectedTask.id);

      // Refresh tasks to update comment count
      await fetchTeacherTasks();
    } catch (error) {
      console.error("Failed to add comment:", error);
      message.error("댓글 등록에 실패했습니다");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteTeacherTaskComment(commentId);
      message.success("댓글이 삭제되었습니다");

      // Refresh comments
      if (selectedTask) {
        await fetchComments(selectedTask.id);
        // Refresh tasks to update comment count
        await fetchTeacherTasks();
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      message.error("댓글 삭제에 실패했습니다");
    }
  };

  return (
    <div style={{ padding: "0 0 24px 0", width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          할 일 관리
        </Title>
      </div>
      <Alert
        message="완료된 할일은 1개월 이내의 항목만 표시됩니다"
        type="info"
        showIcon
        style={{ marginBottom: "16px" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <Select
          style={{ width: 200 }}
          placeholder="선생님 필터"
          allowClear
          onChange={setSelectedTeacher}
          value={selectedTeacher}
        >
          {renderTeacherOptions()}
        </Select>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          할일 등록
        </Button>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spin />
        </div>
      ) : (
        <TodoView
          tasks={filteredTodoTasks}
          columns={columns}
          onDragEnd={onDragEnd}
          showEditModal={showModal}
          showDeleteConfirm={showDeleteConfirm}
          isMobile={isMobile}
          isDraggable={checkPermission("canUpdate")}
        />
      )}

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
                {renderTeacherOptions()}
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
                {renderTeacherOptions()}
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
    </div>
  );
};

export default TodoManagementPage;
