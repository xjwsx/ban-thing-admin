import React from "react";
import { DragDropContext, Draggable } from "@hello-pangea/dnd";
import { CalendarOutlined, MessageOutlined } from "@ant-design/icons";
import { StrictModeDroppable } from "../StrictModeDroppable";
import dayjs from "dayjs";
import TeacherTag from "../molecules/TeacherTag";
import { cn } from "../../lib/utils";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "../../components/ui/card";

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
    <div className={cn(
      "grid gap-4",
      isMobile ? "grid-cols-1" : "grid-cols-3",
      !isMobile && "min-h-[calc(100vh-200px)]"
    )}>
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(tasks).map(([columnId, columnTasks]) => (
          <div
            key={columnId}
            className="h-full"
          >
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">{columns[columnId]?.title}</CardTitle>
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    {columnTasks.length}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="bg-[#F4F5F7] p-3 rounded-b-lg flex-1 flex flex-col">
                {columns[columnId]?.isDraggable && isDraggable ? (
                  <StrictModeDroppable droppableId={columnId}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={cn(
                          "min-h-[500px] flex-1 transition-colors duration-200 rounded",
                          columnTasks.length === 0 && "p-2",
                          snapshot.isDraggingOver && "bg-accent/20 border-2 border-dashed border-border",
                          !snapshot.isDraggingOver && "border-2 border-dashed border-transparent"
                        )}
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
                                className={cn(
                                  "select-none p-4 mb-3 bg-card border border-border rounded-lg cursor-pointer relative",
                                  snapshot.isDragging && "bg-accent/10 shadow-md"
                                )}
                                style={provided.draggableProps.style}
                              >
                                <div>
                                  <div className="text-sm font-medium mb-2">
                                    {task.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground mb-3 whitespace-nowrap overflow-hidden text-ellipsis">
                                    {task.content &&
                                    task.content.includes("http") ? (
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: task.content.replace(
                                            /(https?:\/\/[^\s]+)/g,
                                            '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary underline" onclick="event.stopPropagation()">$1</a>'
                                          ),
                                        }}
                                      />
                                    ) : (
                                      task.content
                                    )}
                                  </div>
                                  <div className="flex justify-between items-center">
                                    {task.endDate ? (
                                      <div className={cn(
                                        "text-xs flex items-center gap-1",
                                        isOverdue(task.endDate) ? "text-destructive" : "text-muted-foreground"
                                      )}>
                                        <CalendarOutlined />
                                        {task.endDate.replace(/-/g, ".")} 까지
                                      </div>
                                    ) : (
                                      <div></div>
                                    )}
                                    <div className="flex items-center gap-2">
                                      {task.commentCount > 0 && (
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                          <MessageOutlined />
                                          {task.commentCount}
                                        </div>
                                      )}
                                      <TeacherTag teacher={task.teacher} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {columnTasks.length === 0 && (
                          <div className="text-muted-foreground text-center p-4">
                            여기로 드래그하세요
                          </div>
                        )}
                      </div>
                    )}
                  </StrictModeDroppable>
                ) : (
                  <></>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
};

export default TodoView;
