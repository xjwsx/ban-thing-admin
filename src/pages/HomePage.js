import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useMediaQuery } from "react-responsive";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./HomePage.css";
import { getDoctorSchedule, getDoctorTaskList, updateDoctorTask, createDoctorTask } from "../api/crm";
import useDoctorStore from "../stores/doctorStore";
import "dayjs/locale/ko";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Badge } from "../components/ui/badge";
import { 
  NotionHeader, 
  NotionSection, 
  NotionDivider 
} from "../components/NotionLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";

const localizer = dayjsLocalizer(dayjs);

const HomePage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [currentCustomers, setCurrentCustomers] = useState([]);
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

  useEffect(() => {
    const fetchDoctorTasks = async () => {
      if (!doctorInfo) return;

      try {
        setLoadingTasks(true);
        const response = await getDoctorTaskList(doctorInfo.id);
        console.log("Doctor tasks:", response.data);
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

    const formattedDate = date.format("YYYY-MM-DD");

    try {
      const response = await getDoctorSchedule(
        doctorInfo.name,
        formattedDate,
        formattedDate
      );
      setDoctorSchedules(response.data);

      // Transform schedules into events for Calendar
      const calendarEvents = [];
      Object.entries(response.data.weeklySchedules).forEach(
        ([date, schedules]) => {
          schedules.forEach((schedule) => {
            calendarEvents.push({
              id: schedule.id,
              title: `${schedule.contactFirstName}${
                schedule.contactLastName ? ` ${schedule.contactLastName}` : ""
              }`,
              start: dayjs(schedule.startDate).subtract(9, "hours").toDate(),
              end: dayjs(schedule.endDate).subtract(9, "hours").toDate(),
              allDay: false,
              tooltip: {
                name: `${schedule.contactFirstName}${
                  schedule.contactLastName ? ` ${schedule.contactLastName}` : ""
                }`,
                email: schedule.contactEmail,
                location: schedule.locationName,
              },
            });
          });
        }
      );
      setEvents(calendarEvents);

      // Extract unique customers from schedules
      const customers = new Map();
      Object.entries(response.data.weeklySchedules).forEach(
        ([date, schedules]) => {
          schedules.forEach((schedule) => {
            const customerId = schedule.contactId;
            if (!customers.has(customerId)) {
              customers.set(customerId, {
                name: `${schedule.contactFirstName}${
                  schedule.contactLastName ? ` ${schedule.contactLastName}` : ""
                }`,
                avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=1`,
                subject: schedule.title,
                level: schedule.locationName,
              });
            }
          });
        }
      );

      setCurrentCustomers(Array.from(customers.values()));
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
      setDoctorSchedules([]);
    }
  };

  useEffect(() => {
    if (doctorInfo) {
      fetchDoctorSchedules(selectedDate);
    }
  }, [doctorInfo, selectedDate]);

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
                      24
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">완료된 예약</span>
                    <Badge
                      variant="success"
                      className="text-lg bg-green-100 text-green-800"
                    >
                      18
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">대기 중</span>
                    <Badge variant="outline" className="text-lg">
                      6
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Appointments Card */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>최근 예약</CardTitle>
                <CardDescription>오늘의 예약 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`}
                        />
                        <AvatarFallback>고객</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">홍길동</p>
                        <p className="text-xs text-muted-foreground">
                          14:00 - 15:00
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="px-0">
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
              <CardFooter className="flex justify-between">
                <Button 
                  variant="link" 
                  className="px-0" 
                  onClick={() => setIsAddTaskModalOpen(true)}
                >
                  할 일 추가
                </Button>
                <Button 
                  variant="link" 
                  className="px-0" 
                  onClick={() => window.location.href = '/todo'}
                >
                  전체 보기
                </Button>
              </CardFooter>
            </Card>
          </div>
        </NotionSection>

        <NotionDivider />

        {/* Calendar */}
        <NotionSection title="예약 일정">
          <div className="h-[500px] md:h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              defaultView={isMobile ? "day" : "week"}
              tooltipAccessor={(event) =>
                `${event.tooltip.name}\n${event.tooltip.email}\n${event.tooltip.location}`
              }
              date={calendarDate}
              onNavigate={(date) => {
                setCalendarDate(date);
                setSelectedDate(dayjs(date));
              }}
            />
          </div>
        </NotionSection>

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
    </div>
  );
};

export default HomePage;
