import React from "react";
import { Button, Result } from "antd";
import {
  LockOutlined,
  HomeOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div
      style={{
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        padding: 24,
      }}
    >
      <Result
        status="403"
        icon={<LockOutlined style={{ color: "#ff4d4f" }} />}
        title="403 - Quyền truy cập bị từ chối"
        subTitle="Khu vực này chỉ dành riêng cho Lớp trưởng . Tài khoản sinh viên của bạn không có quyền truy cập trang quản trị."
        extra={[
          <Link href="/dashboard" key="dashboard">
            <Button
              type="primary"
              icon={<DashboardOutlined />}
              style={{ backgroundColor: "#1677ff" }}
            >
              Về Trang cá nhân
            </Button>
          </Link>,
          <Link href="/" key="home">
            <Button icon={<HomeOutlined />}>Về trang chủ</Button>
          </Link>,
        ]}
      />
    </div>
  );
}
