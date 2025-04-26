import React, { useState, useEffect } from "react";
import {
  Space,
  Modal,
  message,
  Form,
  Spin,
  List,
  Tooltip,
  Divider,
  Popconfirm,
  Avatar,
  DatePicker,
  Select as AntSelect,
  Input as AntInput,
  Tag,
} from "antd";
import { DeleteOutlined, UserOutlined, XIcon } from "@ant-design/icons";
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
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { PlusIcon, InfoIcon, Loader2, X } from "lucide-react";
import { DatePicker as ShadcnDatePicker } from "../../components/ui/date-picker";
const { Option } = AntSelect;
const { confirm } = Modal;

// 커스텀 다중 선택 컴포넌트
const MultiSelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState(value || []);
  
  // value 속성이 변경될 때마다 내부 상태 업데이트
  useEffect(() => {
    // 값이 없는 경우 빈 배열로 설정
    const newValue = value || [];
    // 모든 값을 문자열로 변환하여 저장
    const stringValues = newValue.map(v => String(v));
    
    console.log("MultiSelect 값 업데이트:", { original: value, stringValues });
    setSelectedItems(stringValues);
  }, [value]);
  
  const handleSelect = (itemId) => {
    let newSelectedItems;
    
    if (selectedItems.includes(itemId)) {
      // 이미 선택된 항목 제거
      newSelectedItems = selectedItems.filter(id => id !== itemId);
    } else {
      // 새 항목 추가
      newSelectedItems = [...selectedItems, itemId];
    }
    
    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems);
    setIsOpen(false);
  };
  
  const removeItem = (e, itemId) => {
    e.stopPropagation();
    const newSelectedItems = selectedItems.filter(id => id !== itemId);
    setSelectedItems(newSelectedItems);
    onChange(newSelectedItems);
  };
  
  // 선택된 항목들의 라벨 가져오기
  const getSelectedLabels = () => {
    return selectedItems.map(id => {
      const option = options.find(opt => String(opt.value) === String(id));
      return option ? option.label : '';
    });
  };
  
  return (
    <div className="relative">
      <div 
        className="flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedItems.length === 0 ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {getSelectedLabels().map((label, index) => (
              <div key={index} className="flex items-center bg-muted px-2 py-1 rounded text-xs">
                {label}
                <X 
                  className="ml-1 h-3 w-3 cursor-pointer" 
                  onClick={(e) => removeItem(e, selectedItems[index])}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-input bg-background shadow-md">
          <div className="max-h-60 overflow-auto p-1">
            {options.map(option => (
              <div
                key={option.value}
                className={`flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm ${
                  selectedItems.includes(String(option.value)) ? 'bg-accent text-accent-foreground' : ''
                }`}
                onClick={() => handleSelect(String(option.value))}
              >
                <span>{option.label}</span>
                {selectedItems.includes(String(option.value)) && (
                  <svg className="ml-auto h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            ))}
            {options.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                선택 가능한 항목이 없습니다
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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

  // Dialog 모달용 상태 변수
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [formState, setFormState] = useState({
    title: "",
    content: "",
    startDate: null,
    endDate: null,
    status: "todo",
    registeredById: "",
    assignedToId: []
  });

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

  const [commentLoading, setCommentLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentForm] = Form.useForm();

  const { doctorInfo, fetchDoctorInfo } = useDoctorStore();

  const fetchDoctorTasks = async () => {
    try {
      setLoading(true);
      const response = await getDoctorTaskList();

      console.log("할일 API 응답:", response.data);

      const transformedTasks = {
        todo: [],
        inProgress: [],
        done: [],
      };

      response.data.forEach((task) => {
        const status = task.status.toLowerCase();
        if (status === "todo" || status === "inprogress" || status === "done") {
          // assignedTo와 assignedToId 처리
          const assignedTo = task.assignedTo || null;
          let assignedToName = "";
          let assignedToId = null;
          let assignedToIds = [];
          
          // assignedTo가 배열인 경우 (다중 담당자)
          if (Array.isArray(assignedTo)) {
            assignedToName = assignedTo.map(doctor => doctor.name).join(', ');
            assignedToIds = assignedTo.map(doctor => doctor.id);
            assignedToId = assignedToIds[0] || null;
          } 
          // assignedTo가 객체인 경우 (단일 담당자)
          else if (assignedTo && typeof assignedTo === 'object') {
            assignedToName = assignedTo.name || '';
            assignedToId = assignedTo.id;
            assignedToIds = [assignedToId];
          } 
          // API에서 assignedToId만 제공하는 경우
          else if (task.assignedToId) {
            assignedToId = task.assignedToId;
            assignedToIds = Array.isArray(task.assignedToId) ? task.assignedToId : [task.assignedToId];
          }
          
          console.log(`할일 ID ${task.id}의 담당자:`, { 
            assignedTo, 
            assignedToId, 
            assignedToIds,
            assignedToName 
          });

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
            registeredBy: task.registeredBy?.name || "",
            assignedTo: assignedToName,
            registeredById: task.registeredById,
            assignedToId: assignedToId,
            assignedToIds: assignedToIds,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            commentCount: task.commentCount || 0,
            status: status === "inprogress" ? "inProgress" : status,
          });
        }
      });

      console.log("변환된 할일 데이터:", transformedTasks);
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

  const showModal = (task) => {
    if (task) {
      console.log('편집 중인 타스크:', task);
      
      // 담당자 ID 배열 처리
      let assignedIds = [];
      
      // assignedToIds가 있고 배열인 경우
      if (task.assignedToIds && Array.isArray(task.assignedToIds)) {
        assignedIds = task.assignedToIds.filter(id => id !== null).map(id => String(id));
      } 
      // 단일 assignedToId가 있는 경우
      else if (task.assignedToId) {
        assignedIds = [String(task.assignedToId)];
      }
      
      console.log('담당자 IDs:', assignedIds);
      
      // Dialog로 전환하고 formState 업데이트
      setSelectedTask(task);
      setIsEdit(true);
      setFormState({
        title: task.title,
        content: task.content || task.description,
        startDate: task.startDate ? dayjs(task.startDate) : null,
        endDate: task.endDate ? dayjs(task.endDate) : null,
        status: task.status || "todo",
        registeredById: String(task.registeredById) || "",
        assignedToId: assignedIds
      });
      
      // 댓글 불러오기
      fetchComments(task.id);
    } else {
      // 새 할일 추가 모드
      setSelectedTask(null);
      setIsEdit(false);
      setFormState({
        title: "",
        content: "",
        startDate: null,
        endDate: null,
        status: "todo",
        registeredById: doctorInfo?.id ? String(doctorInfo.id) : "",
        assignedToId: []
      });
    }
    
    // 다이얼로그 열기
    setDialogOpen(true);
  };

  const handleSubmitTask = async () => {
    try {
      // 필수 필드 검증
      if (!formState.title || !formState.content || !formState.status || 
          !formState.registeredById) {
        message.error("필수 항목을 모두 입력해주세요");
        return;
      }
      
      setLoading(true);
      
      // API 요청 데이터 준비
      const apiStatus = formState.status === "inProgress" ? "inprogress" : formState.status;
      const payload = {
        title: formState.title,
        description: formState.content,
        status: apiStatus,
        startDate: formState.startDate ? formState.startDate.format("YYYY-MM-DD") : null,
        endDate: formState.endDate ? formState.endDate.format("YYYY-MM-DD") : null,
        registeredById: formState.registeredById,
      };
      
      // assignedToId가 있는 경우에만 포함
      if (formState.assignedToId && formState.assignedToId.length > 0) {
        // 단일 담당자인 경우 assignedToId, 다중 담당자인 경우 assignedToIds로 전송
        if (formState.assignedToId.length === 1) {
          payload.assignedToId = Number(formState.assignedToId[0]) || formState.assignedToId[0];
        } else {
          payload.assignedToIds = formState.assignedToId.map(id => Number(id) || id);
        }
      }
      
      console.log("할일 저장 데이터:", payload);
      
      // 기존 할일 수정
      if (isEdit && selectedTask) {
        await updateDoctorTask(selectedTask.id, payload);
        message.success("할일이 수정되었습니다");
      } 
      // 새 할일 추가
      else {
        await createDoctorTask(payload);
        message.success("할일이 추가되었습니다");
      }
      
      // 다이얼로그 닫기 및 상태 초기화
      setDialogOpen(false);
      setIsEdit(false);
      setSelectedTask(null);
      setComments([]);
      
      // 할일 목록 새로고침
      await fetchDoctorTasks();
    } catch (error) {
      console.error("할일 처리 중 오류 발생:", error);
      message.error(isEdit ? "수정 중 오류가 발생했습니다" : "할일 추가 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (e, task, status) => {
    e && e.stopPropagation();
    setTaskToDelete({ id: task.id, status });
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirmAction = async () => {
    if (!taskToDelete) return;
    
    try {
      setLoading(true);
      await deleteDoctorTask(taskToDelete.id);
      await deleteTask({
        status: taskToDelete.status,
        taskId: taskToDelete.id,
      });
      
      // 상태 초기화
      setDeleteAlertOpen(false);
      setTaskToDelete(null);
      setDialogOpen(false);
      setSelectedTask(null);
      
      // 할일 목록 새로고침
      await fetchDoctorTasks();
      
      message.success("할일이 삭제되었습니다");
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
      message.error("삭제 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const showAddTodoModal = () => {
    form.resetFields();
    setSelectedTodoType("todo");
    setIsAddTodoModalVisible(true);
  };

  const handleAddTodo = async (values) => {
    try {
      const apiStatus =
        values.status === "inProgress"
          ? "inprogress"
          : values.status;
      
      const requestData = {
        title: values.title,
        description: values.content,
        status: apiStatus,
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
        description="할 일을 관리하고 진행 상황을 추적합니다."
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
              defaultValue={selectedDoctor}
              onValueChange={setSelectedDoctor}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="선생님 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>전체</SelectItem>
                {doctors.map(doctor => (
                  <SelectItem key={doctor.id} value={doctor.id}>{doctor.name}</SelectItem>
                ))}
              </SelectContent>
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
              isDraggable={true}
            />
          </div>
        )}
      </NotionSection>

      {/* 할일 추가/편집 Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? "할 일 수정" : "새 할일 추가"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "할 일 정보를 수정하세요." : "새로운 할 일 정보를 입력하세요."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">제목 *</Label>
              <Input 
                id="title"
                placeholder="할 일 제목을 입력해주세요" 
                value={formState.title}
                onChange={(e) => setFormState({...formState, title: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">내용 *</Label>
              <Textarea
                id="content"
                placeholder="할 일 내용을 입력해주세요"
                className="min-h-[100px]"
                value={formState.content}
                onChange={(e) => setFormState({...formState, content: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">상태 *</Label>
              <Select
                value={formState.status || "todo"}
                onValueChange={(value) => setFormState({...formState, status: value})}
                defaultValue="todo"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="상태 선택" className="text-muted-foreground" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">할 일</SelectItem>
                  <SelectItem value="inProgress">진행 중</SelectItem>
                  <SelectItem value="done">완료</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="registeredById">등록한 사람 *</Label>
                <Select
                  value={String(formState.registeredById) || ""}
                  onValueChange={(value) => setFormState({...formState, registeredById: value})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="등록한 사람" className="text-muted-foreground" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map(doctor => (
                      <SelectItem key={doctor.id} value={String(doctor.id)}>{doctor.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="assignedToId">담당자 *</Label>
                <MultiSelect
                  options={doctors.map(doctor => ({
                    value: String(doctor.id),
                    label: doctor.name
                  }))}
                  value={formState.assignedToId ? formState.assignedToId.map(id => String(id)) : []}
                  onChange={(value) => setFormState({...formState, assignedToId: value})}
                  placeholder="담당자 선택"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">시작일</Label>
                <DatePicker
                  className="w-full"
                  placeholder="시작일 선택"
                  value={formState.startDate}
                  onChange={(date) => setFormState({...formState, startDate: date})}
                  style={{ 
                    height: '40px', 
                    borderRadius: '6px',
                    width: '100%',
                    borderColor: 'hsl(var(--input))',
                    background: 'hsl(var(--background))'
                  }}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="endDate">마감일</Label>
                <DatePicker
                  className="w-full"
                  placeholder="마감일 선택"
                  value={formState.endDate}
                  onChange={(date) => setFormState({...formState, endDate: date})}
                  disabledDate={(current) => {
                    return formState.startDate && current && current < formState.startDate;
                  }}
                  style={{ 
                    height: '40px', 
                    borderRadius: '6px',
                    width: '100%',
                    borderColor: 'hsl(var(--input))',
                    background: 'hsl(var(--background))'
                  }}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            {isEdit && (
              <Button
                variant="destructive"
                onClick={() => {
                  setTaskToDelete({
                    id: selectedTask.id,
                    status: selectedTask.status
                  });
                  setDeleteAlertOpen(true);
                  setDialogOpen(false);
                }}
              >
                삭제
              </Button>
            )}
            <div className={`flex gap-2 ${isEdit ? '' : 'w-full justify-end'}`}>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                취소
              </Button>
              <Button
                onClick={handleSubmitTask}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "수정" : "등록"}
              </Button>
            </div>
          </DialogFooter>
          
          {/* 댓글 섹션 */}
          {isEdit && selectedTask && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium mb-3">댓글</h3>
              
              {commentLoading ? (
                <div className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">댓글 로딩 중...</p>
                </div>
              ) : (
                <>
                  {comments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">댓글이 없습니다.</p>
                  ) : (
                    <div className="space-y-4 max-h-[300px] overflow-y-auto">
                      {comments.map(comment => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          onDelete={handleDeleteComment}
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <Form
                      form={commentForm}
                      onFinish={handleCommentSubmit}
                    >
                      <Form.Item
                        name="comment"
                        rules={[{ required: true, message: "댓글 내용을 입력해주세요" }]}
                      >
                        <Textarea
                          placeholder="댓글 내용을 입력하세요"
                          className="min-h-[80px]"
                        />
                      </Form.Item>
                      <div className="flex justify-end">
                        <Button type="submit">
                          댓글 등록
                        </Button>
                      </div>
                    </Form>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* 삭제 확인 AlertDialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>할 일 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 할 일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirmAction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </NotionContainer>
  );
};

export default TodoPage;
