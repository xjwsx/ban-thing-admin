import React, { useState, useEffect } from "react";
import { Typography, Divider, Card, List, Avatar, Modal, Tooltip } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useMediaQuery } from "react-responsive";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Calendar as AntCalendar } from "antd";
import "./HomePage.css";
import { getTeacherSchedule, getTeacherTaskList } from "../api/crm";
import useTeacherStore from "../stores/teacherStore";

const { Title } = Typography;
const localizer = dayjsLocalizer(dayjs);

const HomePage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [teacherSchedules, setTeacherSchedules] = useState([]);
  const [currentStudents, setCurrentStudents] = useState([]);
  const [teacherTasks, setTeacherTasks] = useState([]);
  const teacherInfo = useTeacherStore((state) => state.teacherInfo);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [calendarDate, setCalendarDate] = useState(dayjs().toDate());

  useEffect(() => {
    const fetchTeacherTasks = async () => {
      try {
        if (!teacherInfo?.id) return;

        const response = await getTeacherTaskList(teacherInfo.id);
        console.log("Teacher tasks:", response.data);
        setTeacherTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        Modal.error({
          title: "할 일 조회 실패",
          content: "선생님의 할 일을 가져오는데 실패했습니다.",
        });
      }
    };

    fetchTeacherTasks();
  }, [teacherInfo?.id]);

  const fetchTeacherSchedules = async (date) => {
    try {
      if (!teacherInfo?.resourceName) return;

      const startDate = date.startOf("month").format("YYYY-MM-DD");
      const endDate = date.endOf("month").format("YYYY-MM-DD");
      const response = await getTeacherSchedule(
        teacherInfo.resourceName,
        startDate,
        endDate
      );
      setTeacherSchedules(response.data);

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

      // Extract unique students from schedules
      const students = new Map();
      Object.entries(response.data.weeklySchedules).forEach(
        ([date, schedules]) => {
          schedules.forEach((schedule) => {
            const studentId = schedule.contactId;
            if (!students.has(studentId)) {
              students.set(studentId, {
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

      setCurrentStudents(Array.from(students.values()));
    } catch (error) {
      Modal.error({
        title: "스케줄 조회 실패",
        content: "선생님 스케줄을 가져오는데 실패했습니다.",
      });
    }
  };

  useEffect(() => {
    if (teacherInfo) {
      fetchTeacherSchedules(selectedDate);
    }
  }, [teacherInfo, selectedDate]);

  return (
    <div className="home-page" style={{ height: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          홈
        </Title>
      </div>
      <Divider />

      <div
        style={{
          display: "flex",
          gap: "24px",
          height: "calc(100% - 80px)",
          overflow: "hidden",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <div
          style={{
            width: "300px",
            flexShrink: 0,
            overflow: "auto",
          }}
        >
          <Card
            style={{
              marginBottom: "16px",
              padding: "0",
              height: "297px",
            }}
            styles={{
              body: {
                padding: "0",
                height: "297px",
              },
            }}
          >
            <AntCalendar
              fullscreen={false}
              style={{
                border: "none",
                background: "transparent",
                height: "100%",
              }}
              value={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setCalendarDate(date.toDate());
              }}
              headerRender={({ value, onChange }) => {
                const current = value.clone();
                const handlePrevMonth = () => {
                  const newValue = value.clone().subtract(1, "month");
                  onChange(newValue);
                };
                const handleNextMonth = () => {
                  const newValue = value.clone().add(1, "month");
                  onChange(newValue);
                };

                return (
                  <div
                    style={{
                      padding: "8px 16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <LeftOutlined
                      style={{ cursor: "pointer", fontSize: "12px" }}
                      onClick={handlePrevMonth}
                    />
                    <span>{current.format("MMMM YYYY")}</span>
                    <RightOutlined
                      style={{ cursor: "pointer", fontSize: "12px" }}
                      onClick={handleNextMonth}
                    />
                  </div>
                );
              }}
            />
          </Card>

          <Card
            title="오늘 할 일"
            style={{
              marginBottom: "16px",
              height: "297px",
            }}
            styles={{
              header: {
                padding: "0 12px",
              },
              body: {
                height: "calc(297px - 57px)",
                overflowY: "auto",
                padding: "0 12px",
              },
            }}
          >
            <List
              itemLayout="horizontal"
              dataSource={teacherTasks.filter((task) => {
                const today = dayjs().format("YYYY-MM-DD");

                if (!task.startDate) return false;

                if (!task.endDate) {
                  return task.startDate === today && task.status !== "done";
                }

                const isAfterStart = dayjs(today).isAfter(
                  dayjs(task.startDate).subtract(1, "day")
                );
                const isBeforeEnd = dayjs(today).isBefore(
                  dayjs(task.endDate).add(1, "day")
                );

                return isAfterStart && isBeforeEnd && task.status !== "done";
              })}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>{item.title}</span>
                        <span
                          style={{
                            fontSize: "12px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            backgroundColor:
                              item.status === "inprogress"
                                ? "#e6f7ff"
                                : item.status === "todo"
                                ? "#fffbe6"
                                : "#f5f5f5",
                            color:
                              item.status === "inprogress"
                                ? "#1890ff"
                                : item.status === "todo"
                                ? "#faad14"
                                : "#666",
                          }}
                        >
                          {item.status === "inprogress"
                            ? "진행중"
                            : item.status === "todo"
                            ? "할 일"
                            : item.status}
                        </span>
                      </div>
                    }
                    description={item.description || "설명 없음"}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card
            title="현재 수강중인 학생"
            style={{
              marginBottom: "16px",
              height: "297px",
            }}
            styles={{
              header: {
                padding: "0 12px",
              },
              body: {
                height: "calc(297px - 57px)",
                overflowY: "auto",
                padding: " 0 12px",
              },
            }}
          >
            <List
              itemLayout="horizontal"
              dataSource={currentStudents}
              renderItem={(student) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={student.avatar} />}
                    title={student.name}
                    description={`${student.subject} / ${student.level}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </div>

        <div
          style={{
            flex: 1,
            overflow: "auto",
          }}
        >
          <Card
            style={{
              height: "922px",
              padding: 0,
            }}
            styles={{ body: { height: "100%", padding: "16px" } }}
          >
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              defaultView="week"
              views={["week"]}
              date={calendarDate}
              step={60}
              timeslots={1}
              min={dayjs()
                .set("hour", 0)
                .set("minute", 0)
                .set("second", 0)
                .toDate()}
              max={dayjs()
                .set("hour", 23)
                .set("minute", 59)
                .set("second", 59)
                .toDate()}
              style={{ height: "100%" }}
              formats={{
                timeGutterFormat: "HH:mm",
                dayHeaderFormat: "MM/DD ddd",
                eventTimeRangeFormat: () => "",
              }}
              messages={{
                week: "주간",
                previous: "이전",
                next: "다음",
                today: "오늘",
                showMore: (total) => `+${total} 더보기`,
              }}
              onNavigate={(newDate) => {
                const date = dayjs(newDate);
                if (date.format("YYYY-MM") !== selectedDate.format("YYYY-MM")) {
                  setSelectedDate(date);
                }
                setCalendarDate(newDate);
              }}
              components={{
                event: (props) => {
                  const { event } = props;
                  return (
                    <Tooltip
                      title={
                        <div>
                          <p>이름: {event.tooltip.name}</p>
                          <p>이메일: {event.tooltip.email}</p>
                          <p>장소: {event.tooltip.location}</p>
                        </div>
                      }
                    >
                      <div style={{ height: "100%" }}>{event.title}</div>
                    </Tooltip>
                  );
                },
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
