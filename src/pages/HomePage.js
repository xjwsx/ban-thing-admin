import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useMediaQuery } from "react-responsive";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./HomePage.css";
import { getDoctorSchedule, getDoctorTaskList } from "../api/crm";
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

const localizer = dayjsLocalizer(dayjs);

const HomePage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [currentCustomers, setCurrentCustomers] = useState([]);
  const [doctorTasks, setDoctorTasks] = useState([]);
  const doctorInfo = useDoctorStore((state) => state.doctorInfo);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [calendarDate, setCalendarDate] = useState(dayjs().toDate());

  useEffect(() => {
    const fetchDoctorTasks = async () => {
      if (!doctorInfo) return;

      try {
        const response = await getDoctorTaskList(doctorInfo.id);
        console.log("Doctor tasks:", response.data);
        setDoctorTasks(response.data);
      } catch (error) {
        console.error("Failed to fetch doctor tasks:", error);
        setDoctorTasks([]);
      }
    };

    fetchDoctorTasks();
  }, [doctorInfo?.id]);

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
                <div className="space-y-4">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Checkbox id={`task-${i}`} />
                      <label
                        htmlFor={`task-${i}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        환자 기록 업데이트
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="px-0">
                  새로운 할 일 추가
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
      </div>
    </div>
  );
};

export default HomePage;
