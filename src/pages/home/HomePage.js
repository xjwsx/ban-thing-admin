import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useMediaQuery } from "react-responsive";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./HomePage.css";
import "../../styles/calendar-custom.css";
import { getDoctorTaskList, updateDoctorTask, createDoctorTask } from "../../api/crm";
import api from "../../api";
import useDoctorStore from "../../stores/doctorStore";
import "dayjs/locale/ko";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Badge } from "../../components/ui/badge";
import { 
  NotionHeader, 
  NotionSection, 
  NotionDivider 
} from "../../components/NotionLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { useNavigate } from "react-router-dom";

// 한국어 설정
dayjs.locale('ko');
const localizer = dayjsLocalizer(dayjs);

// 캘린더 메시지 한글화
const messages = {
  allDay: '종일',
  previous: '이전',
  next: '다음',
  today: '오늘',
  month: '월간',
  week: '주간',
  day: '일간',
  agenda: '일정',
  date: '날짜',
  time: '시간',
  event: '일정',
  noEventsInRange: '이 기간에 일정이 없습니다.'
};

const HomePage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [doctorTasks, setDoctorTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const doctorInfo = useDoctorStore((state) => state.doctorInfo);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [calendarDate, setCalendarDate] = useState(dayjs().toDate());
  
  // 할 일 추가 모달 상태
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "todo",
    startDate: dayjs().format("YYYY-MM-DD"),
    endDate: dayjs().add(7, "day").format("YYYY-MM-DD"),
  });
  const [addingTask, setAddingTask] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctorTasks = async () => {
      if (!doctorInfo) return;

      try {
        setLoadingTasks(true);
        const response = await getDoctorTaskList(doctorInfo.id);
        setDoctorTasks(response.data);
        setLoadingTasks(false);
      } catch (error) {
        console.error("Failed to fetch doctor tasks:", error);
        setDoctorTasks([]);
        setLoadingTasks(false);
      }
    };

    fetchDoctorTasks();
  }, [doctorInfo?.id]);

  const handleTaskStatusChange = async (taskId, status) => {
    try {
      const newStatus = status === 'done' ? 'todo' : 'done';
      await updateDoctorTask(taskId, { status: newStatus });
      
      // Update local state
      setDoctorTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value) => {
    setNewTask((prev) => ({ ...prev, status: value }));
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    try {
      setAddingTask(true);
      
      const payload = {
        ...newTask,
        registeredById: doctorInfo.id,
        assignedToIds: [doctorInfo.id]
      };

      const response = await createDoctorTask(payload);
      
      // 현재 할 일 목록에 새 할 일 추가
      setDoctorTasks((prev) => [...prev, response.data]);
      
      // 모달 닫기 및 입력 필드 초기화
      setIsAddTaskModalOpen(false);
      setNewTask({
        title: "",
        description: "",
        status: "todo",
        startDate: dayjs().format("YYYY-MM-DD"),
        endDate: dayjs().add(7, "day").format("YYYY-MM-DD"),
      });
      
      setAddingTask(false);
    } catch (error) {
      console.error("Failed to add new task:", error);
      alert("할 일 추가에 실패했습니다.");
      setAddingTask(false);
    }
  };

  const fetchDoctorSchedules = async (date) => {
    if (!doctorInfo) return;

    try {
      const response = await api.get("/reservations", {
        params: {
          page: 1,
          limit: 10,
        }
      });
      
      // 달력 이벤트 배열 초기화
      const calendarEvents = [];
      
      // API 응답 구조에 따라 적절히 데이터 추출
      const allReservations = Array.isArray(response.data)
        ? response.data
        : response.data?.data
          ? response.data.data
          : response.data?.items
            ? response.data.items
            : [];
      
      // 현재 로그인한 의사의 예약만 필터링
      const reservations = allReservations.filter(reservation => 
        reservation.doctorId === doctorInfo.id
      );
      
      if (reservations && reservations.length > 0) {
        // 각 예약을 달력 이벤트로 변환
        reservations.forEach(reservation => {
          // 예약 날짜와 시간 조합
          const startDateTime = `${reservation.reservationDate.split('T')[0]}T${reservation.startTime}`;
          const endDateTime = `${reservation.reservationDate.split('T')[0]}T${reservation.endTime}`;
          
          // 달력 이벤트 생성
          calendarEvents.push({
            id: reservation.id,
            title: reservation.customer?.name || reservation.customer?.koreanName || '고객',
            start: dayjs(startDateTime).toDate(),
            end: dayjs(endDateTime).toDate(),
            allDay: false,
            status: reservation.status,
            resource: {
              name: reservation.customer?.name || reservation.customer?.koreanName || '고객',
              email: reservation.customer?.email || '',
              location: reservation.visitRoute || '',
              sessionTreatment: reservation.sessionTreatment || '',
              doctor: reservation.doctor
            }
          });
        });
      }
      
      setEvents(calendarEvents);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
      setEvents([]);
    }
  };

  useEffect(() => {
    if (doctorInfo) {
      fetchDoctorSchedules(selectedDate);
    }
  }, [doctorInfo, selectedDate]);

  // 캘린더 이벤트 스타일 지정
  const eventStyleGetter = (event) => {
    let backgroundColor = 'rgba(16, 185, 129, 0.9)'; // 기본 초록색(예약 확정)
    let borderColor = 'rgb(5, 150, 105)';
    let textColor = '#fff';
    
    return {
      style: {
        backgroundColor,
        color: textColor,
        borderRadius: '4px',
        border: `1px solid ${borderColor}`,
        borderLeft: `3px solid ${borderColor}`,
        display: 'block',
        padding: '2px 5px',
        fontSize: '12px',
        fontWeight: '500',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.15s ease',
        cursor: 'pointer'
      },
      className: `reservation-status-confirmed`
    };
  };

  // 일정 클릭 핸들러
  const handleEventClick = (event) => {
    alert(`고객: ${event.title}\n장소: ${event.resource.location || '-'}\n시술: ${event.resource.sessionTreatment || '-'}`);
  };

  // 오늘 예약 건수 계산
  const getTodayReservationsCount = () => {
    return events.filter(event => dayjs(event.start).isSame(dayjs(), 'day')).length;
  };

  // 완료된 예약 건수 계산
  const getCompletedReservationsCount = () => {
    return events.filter(event => event.status === 'completed').length;
  };

  // 대기 중인 예약 건수 계산
  const getPendingReservationsCount = () => {
    return events.filter(event => event.status === 'pending').length;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <NotionHeader 
          title="대시보드" 
          description="오늘의 예약 및 할 일 현황을 확인하세요"
        />
        
        <NotionSection title="일일 현황">
          <div className="grid gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Overview Card */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>일일 개요</CardTitle>
                <CardDescription>오늘의 주요 통계</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">전체 예약</span>
                    <Badge variant="secondary" className="text-lg">
                      {events.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">완료된 예약</span>
                    <Badge
                      variant="success"
                      className="text-lg bg-green-100 text-green-800"
                    >
                      {getCompletedReservationsCount()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">대기 중</span>
                    <Badge variant="outline" className="text-lg">
                      {getPendingReservationsCount()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Appointments Card */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>예약</CardTitle>
                <CardDescription>오늘의 예약 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events
                    .filter(event => dayjs(event.start).isSame(dayjs(), 'day'))
                    .slice(0, 3)
                    .map((event, i) => (
                    <div key={event.id} className="flex items-center space-x-2">
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {dayjs(event.start).format('HH:mm')} - {dayjs(event.end).format('HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {events.filter(event => dayjs(event.start).isSame(dayjs(), 'day')).length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      오늘 예약이 없습니다
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="px-0" onClick={() => navigate("/reservation")}>
                  모든 예약 보기
                </Button>
              </CardFooter>
            </Card>

            {/* Tasks Card */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>할 일</CardTitle>
                <CardDescription>오늘의 할 일 목록</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTasks ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  </div>
                ) : doctorTasks && doctorTasks.length > 0 ? (
                  <div className="space-y-4">
                    {doctorTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`task-${task.id}`} 
                          checked={task.status === 'done'}
                          onCheckedChange={() => handleTaskStatusChange(task.id, task.status)}
                        />
                        <label
                          htmlFor={`task-${task.id}`}
                          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                            task.status === 'done' ? 'line-through text-gray-400' : ''
                          }`}
                        >
                          {task.title || task.description}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    할 일이 없습니다
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="link" 
                  className="px-0" 
                  onClick={() => navigate("/todo")}
                >
                  전체 보기
                </Button>
              </CardFooter>
            </Card>
          </div>
        </NotionSection>

        <NotionDivider />

        {/* 개선된 캘린더 */}
        <NotionSection title="내 예약 일정">
          <Card>
            <CardContent className="pt-6">
              <div className="h-[500px] md:h-[600px]">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "100%" }}
                  className="notion-calendar"
                  defaultView={isMobile ? "day" : "week"}
                  views={['month', 'week', 'day', 'agenda']}
                  date={calendarDate}
                  onNavigate={(date) => {
                    setCalendarDate(date);
                    setSelectedDate(dayjs(date));
                  }}
                  eventPropGetter={eventStyleGetter}
                  onSelectEvent={handleEventClick}
                  formats={{
                    timeGutterFormat: (date, culture, localizer) => localizer.format(date, 'HH:mm', culture),
                    dayFormat: 'ddd DD',
                    monthHeaderFormat: 'YYYY년 MM월',
                    dayHeaderFormat: 'M월 D일 ddd',
                    dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
                      `${localizer.format(start, 'M월 D일', culture)} - ${localizer.format(end, 'M월 D일', culture)}`
                  }}
                  messages={messages}
                  culture="ko"
                  tooltipAccessor={(event) => 
                    `고객: ${event.title}\n장소: ${event.resource.location || '-'}\n시술: ${event.resource.sessionTreatment || '-'}`
                  }
                  popup
                  selectable
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4 p-3 bg-muted/30 rounded flex justify-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></div>
              <span className="text-sm">내 예약 일정</span>
            </div>
          </div>
        </NotionSection>
      </div>

      {/* 할 일 추가 모달 */}
      <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>할 일 추가</DialogTitle>
            <DialogDescription>
              새로운 할 일을 추가합니다. 필요한 정보를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                제목
              </Label>
              <Input
                id="title"
                name="title"
                value={newTask.title}
                onChange={handleNewTaskChange}
                className="col-span-3"
                placeholder="할 일 제목을 입력하세요"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                설명
              </Label>
              <Textarea
                id="description"
                name="description"
                value={newTask.description}
                onChange={handleNewTaskChange}
                className="col-span-3"
                placeholder="할 일에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                상태
              </Label>
              <Select
                value={newTask.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">할 일</SelectItem>
                  <SelectItem value="inprogress">진행중</SelectItem>
                  <SelectItem value="done">완료</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                시작일
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={newTask.startDate}
                onChange={handleNewTaskChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                종료일
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={newTask.endDate}
                onChange={handleNewTaskChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddTaskModalOpen(false)}>
              취소
            </Button>
            <Button type="button" onClick={handleAddTask} disabled={addingTask}>
              {addingTask ? "추가 중..." : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;