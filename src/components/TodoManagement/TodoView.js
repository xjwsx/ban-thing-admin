import React from "react";
import { DragDropContext, Draggable } from "react-beautiful-dnd";
import { Card } from "antd";
import {
  CalendarOutlined,
  DeleteOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { StrictModeDroppable } from "../StrictModeDroppable";
import dayjs from "dayjs";
import TeacherTag from "../molecules/TeacherTag";

const TodoView = ({
  tasks,
  columns,
  onDragEnd,
  showEditModal,
  showDeleteConfirm,
  isMobile,
  isDraggable,
}) => {
  const isOverdue = (endDate) => {
    if (!endDate) return false;
    const today = dayjs().startOf("day");
    const dueDate = dayjs(endDate).startOf("day");
    return today.isAfter(dueDate);
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: "16px",
        minHeight: isMobile ? "auto" : "calc(100vh - 180px)",
      }}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(tasks).map(([columnId, columnTasks]) => (
          <div
            key={columnId}
            style={{
              flex: isMobile ? "0 0 auto" : "1 1 33%",
              minWidth: isMobile ? "100%" : "300px",
              marginBottom: isMobile ? "16px" : "0",
            }}
          >
            <Card
              title={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{columns[columnId]?.title}</span>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    {columnTasks.length}
                  </div>
                </div>
              }
              style={{
                height: "100%",
                minHeight: isMobile ? "auto" : "100%",
              }}
              styles={{
                body: {
                  height: "100%",
                  minHeight: isMobile ? "auto" : "calc(100% - 57px)",
                  padding: "12px",
                  backgroundColor: "#F4F5F7",
                },
              }}
            >
              {columns[columnId]?.isDraggable && isDraggable ? (
                <StrictModeDroppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{
                        height: "100%",
                        minHeight: "200px",
                        background: snapshot.isDraggingOver
                          ? "#f0f0f0"
                          : "transparent",
                        transition: "background-color 0.2s ease",
                        padding: columnTasks.length === 0 ? "8px" : 0,
                        border: snapshot.isDraggingOver
                          ? "2px dashed #e0e0e0"
                          : "2px dashed transparent",
                        borderRadius: "4px",
                      }}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => showEditModal(task, columnId)}
                              style={{
                                userSelect: "none",
                                padding: "12px 16px",
                                margin: "0 0 10px 0",
                                backgroundColor: snapshot.isDragging
                                  ? "#e6f7ff"
                                  : "white",
                                border: "1px solid #d9d9d9",
                                borderRadius: "12px",
                                cursor: "pointer",
                                position: "relative",
                                ...provided.draggableProps.style,
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    marginBottom: "4px",
                                  }}
                                >
                                  {task.title}
                                </div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#666",
                                    marginBottom: "8px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {task.content &&
                                  task.content.includes("http") ? (
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: task.content.replace(
                                          /(https?:\/\/[^\s]+)/g,
                                          '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #1890ff; text-decoration: underline;" onclick="event.stopPropagation()">$1</a>'
                                        ),
                                      }}
                                    />
                                  ) : (
                                    task.content
                                  )}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  {task.endDate ? (
                                    <div
                                      style={{
                                        fontSize: "11px",
                                        color: isOverdue(task.endDate)
                                          ? "#ff4d4f"
                                          : "#666",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                      }}
                                    >
                                      <CalendarOutlined />
                                      {task.endDate.replace(/-/g, ".")} 까지
                                    </div>
                                  ) : (
                                    <div></div>
                                  )}
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                    }}
                                  >
                                    {task.commentCount > 0 && (
                                      <div
                                        style={{
                                          fontSize: "11px",
                                          color: "#666",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "3px",
                                        }}
                                      >
                                        <MessageOutlined />
                                        {task.commentCount}
                                      </div>
                                    )}
                                    <TeacherTag teacher={task.teacher} />
                                  </div>
                                </div>
                              </div>
                              {/* <DeleteOutlined
                                onClick={(e) =>
                                  showDeleteConfirm(e, task, columnId)
                                }
                                style={{
                                  position: "absolute",
                                  right: 16,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  color: "#ff4d4f",
                                  cursor: "pointer",
                                  fontSize: "16px",
                                }}
                              /> */}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {columnTasks.length === 0 && (
                        <div
                          style={{
                            color: "#999",
                            textAlign: "center",
                            padding: "8px",
                          }}
                        >
                          여기로 드래그하세요
                        </div>
                      )}
                    </div>
                  )}
                </StrictModeDroppable>
              ) : (
                <></>
              )}
            </Card>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
};

export default TodoView;
