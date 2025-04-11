import React from "react";
import { Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { truncateText } from "../../utils/stringUtils";

const MinutesView = ({ tasks, showEditModal, showDeleteConfirm }) => {
  const sortByDate = (tasks) => {
    return [...tasks].sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(b.date) - new Date(a.date);
    });
  };

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 180px)",
        backgroundColor: "white",
        borderRadius: "4px",
        overflowY: "auto",
        padding: "0 24px",
      }}
    >
      {sortByDate(tasks || []).map((task) => (
        <div
          key={task.id}
          onClick={() => showEditModal(task, "minutes")}
          style={{
            padding: 16,
            margin: "0 0 8px 0",
            backgroundColor: "white",
            border: "1px solid #d9d9d9",
            borderRadius: "12px",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#666",
              marginBottom: "4px",
            }}
          >
            {truncateText(task.meetingDate, 16)}
          </div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "500",
              marginBottom: "4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              paddingRight: "24px",
            }}
          >
            {task.title}
          </div>
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={(e) => showDeleteConfirm(e, task, "minutes")}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#ff4d4f",
            }}
          />
        </div>
      ))}
      {(!tasks || tasks.length === 0) && (
        <div
          style={{
            color: "#999",
            textAlign: "center",
            padding: "8px",
          }}
        >
          회의록이 없습니다
        </div>
      )}
    </div>
  );
};

export default MinutesView;
