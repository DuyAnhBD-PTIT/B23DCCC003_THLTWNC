import React from "react";
import { Button, Result } from "antd";
import { HomeOutlined, BookOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function NotFound() {
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
        status="404"
        title="404 - Không tìm thấy trang"
        subTitle="Mã deadline hoặc đường dẫn bạn đang tìm kiếm không tồn tại hoặc đã được chuyển dời."
        extra={[
          <Link href="/" key="home">
            <Button
              type="primary"
              icon={<HomeOutlined />}
              style={{ backgroundColor: "#1677ff" }}
            >
              Về trang chủ
            </Button>
          </Link>,
          <Link href="/deadlines" key="deadlines">
            <Button icon={<BookOutlined />}>Xem tất cả Deadline</Button>
          </Link>,
        ]}
      />
    </div>
  );
}
