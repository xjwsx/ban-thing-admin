import React from "react";
import { Tag } from "antd";
import { useNavigate } from "react-router-dom";

const DoctorTag = ({ doctor, style }) => {
  const navigate = useNavigate();

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

  const rgb = hexToRgb(doctor.color || "#fa6400");
  const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.02)` : "white";

  const handleClick = () => {
    navigate(`/doctors/${doctor.id}`);
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
          backgroundColor: doctor.color,
          display: "inline-block",
        }}
      />
      {doctor.name}
    </Tag>
  );
};

export default DoctorTag; 