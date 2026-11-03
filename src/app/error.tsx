"use client";

import React, { useEffect } from "react";
import { Button, Result } from "antd";
import { ReloadOutlined, HomeOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App-level error caught:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        padding: 24,
      }}
    >
      <Result
        status="error"
        title="Đã xảy ra sự cố không mong muốn"
        subTitle={
          error.message ||
          "Hệ thống gặp lỗi trong quá trình xử lý yêu cầu. Vui lòng thử lại."
        }
        extra={[
          <Button
            type="primary"
            key="retry"
            icon={<ReloadOutlined />}
            onClick={() => reset()}
            style={{ backgroundColor: "#1677ff" }}
          >
            Thử lại
          </Button>,
          <Link href="/" key="home">
            <Button icon={<HomeOutlined />}>Về trang chủ</Button>
          </Link>,
        ]}
      />
    </div>
  );
}
