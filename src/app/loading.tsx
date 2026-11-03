import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export default function Loading() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "#ffffff",
      }}
    >
      <Spin
        indicator={
          <LoadingOutlined style={{ fontSize: 40, color: "#1677ff" }} spin />
        }
      />
      <p style={{ color: "#6b7280", fontSize: 14 }}>
        Đang tải dữ liệu Class Deadline Hub...
      </p>
    </div>
  );
}
