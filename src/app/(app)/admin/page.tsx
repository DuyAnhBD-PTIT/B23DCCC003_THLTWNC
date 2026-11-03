import React from "react";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { getAllDeadlines, getAllSubjects } from "@/lib/storage";
import { Row, Col, Card, Statistic, Tag, Breadcrumb, Space } from "antd";
import {
  CrownOutlined,
  ScheduleOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import AdminDeadlineManager from "@/components/admin/AdminDeadlineManager";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Khu vực Quản trị Deadline",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (
    !can(session.user.role, "add_deadline") ||
    session.user.role !== "admin"
  ) {
    redirect("/403");
  }

  const allDeadlines = getAllDeadlines();
  const subjects = getAllSubjects();

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link href="/">Trang chủ</Link> },
          { title: <Link href="/dashboard">Dashboard</Link> },
          { title: "Quản trị Deadline" },
        ]}
      />

      {/* Banner Quản trị */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #eef0f2",
          borderRadius: 12,
          padding: "24px 28px",
          marginBottom: 24,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div>
          <Space size={8} style={{ marginBottom: 6 }}>
            <Tag color="error" icon={<CrownOutlined />}>
              Lớp trưởng (Admin)
            </Tag>
            <Tag color="processing">Chiến lược: SSR</Tag>
            <Tag color="success" icon={<SafetyCertificateOutlined />}>
              Kiểm tra quyền 2 lớp can(role)
            </Tag>
          </Space>

          <h1
            style={{
              margin: "4px 0 6px 0",
              fontSize: 24,
              fontWeight: 700,
              color: "#1f2937",
            }}
          >
            Bảng Quản trị Deadline Lớp
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
            Thêm mới, chỉnh sửa và xoá các hạn nộp deadline dành cho toàn thể
            sinh viên trong lớp.
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            Người quản trị:
          </span>
          <div style={{ fontWeight: 600, color: "#1f2937" }}>
            {session.user.name}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {session.user.email}
          </div>
        </div>
      </div>

      {/* Thống kê Quản trị */}
      <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
        <Col xs={12} sm={6}>
          <Card className="minimal-card" style={{ borderRadius: 10 }}>
            <Statistic
              title={
                <span style={{ color: "#6b7280", fontSize: 13 }}>
                  Tổng số Deadline
                </span>
              }
              value={allDeadlines.length}
              valueStyle={{ color: "#1677ff", fontWeight: 700 }}
              prefix={<ScheduleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="minimal-card" style={{ borderRadius: 10 }}>
            <Statistic
              title={
                <span style={{ color: "#6b7280", fontSize: 13 }}>
                  Môn học quản lý
                </span>
              }
              value={subjects.length}
              valueStyle={{ color: "#1f2937", fontWeight: 700 }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="minimal-card" style={{ borderRadius: 10 }}>
            <Statistic
              title={
                <span style={{ color: "#6b7280", fontSize: 13 }}>
                  Quyền thêm deadline
                </span>
              }
              value="Cho phép"
              valueStyle={{ color: "#52c41a", fontWeight: 600, fontSize: 18 }}
              prefix={<PlusCircleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="minimal-card" style={{ borderRadius: 10 }}>
            <Statistic
              title={
                <span style={{ color: "#6b7280", fontSize: 13 }}>
                  Quyền xoá deadline
                </span>
              }
              value="Cho phép"
              valueStyle={{ color: "#ff4d4f", fontWeight: 600, fontSize: 18 }}
              prefix={<DeleteOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Bảng quản lý Deadline và Modal Thêm mới */}
      <AdminDeadlineManager deadlines={allDeadlines} subjects={subjects} />
    </div>
  );
}
