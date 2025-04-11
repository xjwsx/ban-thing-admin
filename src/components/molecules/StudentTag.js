import React from "react";
import { Tag } from "antd";
import { useNavigate } from "react-router-dom";

const StudentTag = ({ student, style, clickable = true }) => {
  const navigate = useNavigate();

  // 상태별 색상 매핑
  const statusColors = {
    수강중: "#52c41a",
    탈퇴: "#ff4d4f",
    그룹대기: "#faad14",
    휴면: "#d9d9d9",
    회수권: "#1890ff",
  };

  const color = statusColors[student.status] || "#d9d9d9";

  // 헥사코드에서 RGB 값 추출
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const rgb = hexToRgb(color);
  const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.02)` : "white";

  const handleClick = () => {
    if (clickable) {
      navigate(`/student/${student.id}`);
    }
  };

  return (
    <Tag
      onClick={handleClick}
      style={{
        border: `1px solid #efefef`,
        borderRadius: "6px",
        padding: "0 8px",
        fontSize: "12px",
        lineHeight: "20px",
        display: "inline-flex",
        backgroundColor: bgColor,
        alignItems: "center",
        gap: "6px",
        color: "#333",
        margin: 0,
        cursor: "pointer",
        ...style,
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: color,
          display: "inline-block",
        }}
      />
      <span>
        {student.name} {student.koreanName}
      </span>
      <span style={{ color: "#999", fontSize: "11px" }}>
        ({student.memberCode})
      </span>
    </Tag>
  );
};

export default StudentTag;
