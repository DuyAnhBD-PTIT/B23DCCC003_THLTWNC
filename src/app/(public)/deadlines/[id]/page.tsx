import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Card, Tag, Breadcrumb, Space, Button } from "antd";
import {
  CalendarOutlined,
  BookOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { getAllDeadlines, getDeadlineById } from "@/lib/storage";
import { getBaseUrl } from "@/lib/constants";
import CountdownBadge from "@/components/deadlines/CountdownBadge";
import CompleteButton from "@/components/deadlines/CompleteButton";

interface DeadlineDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const deadlines = getAllDeadlines();
  return deadlines.map((item) => ({
    id: item.id,
  }));
}

export async function generateMetadata({
  params,
}: DeadlineDetailPageProps): Promise<Metadata> {
  const deadline = getDeadlineById(params.id);
  if (!deadline) {
    return {
      title: "Không tìm thấy Deadline",
    };
  }

  const baseUrl = getBaseUrl();
  const ogImageUrl = `${baseUrl}/deadlines/${deadline.id}/opengraph-image`;

  return {
    title: `${deadline.title} - Hạn chót: ${new Date(deadline.dueDate).toLocaleDateString("vi-VN")}`,
    description: deadline.description,
    keywords: [
      deadline.subjectName,
      "deadline",
      "bài tập",
      "ptit",
      deadline.title,
    ],
    openGraph: {
      title: `${deadline.title} | ${deadline.subjectName}`,
      description: deadline.description,
      type: "article",
      url: `${baseUrl}/deadlines/${deadline.id}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: deadline.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: deadline.title,
      description: deadline.description,
      images: [ogImageUrl],
    },
  };
}

export default async function DeadlineDetailPage({
  params,
}: DeadlineDetailPageProps) {
  const deadline = getDeadlineById(params.id);

  if (!deadline) {
    notFound();
  }

  const baseUrl = getBaseUrl();

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Danh sách Deadline",
        item: `${baseUrl}/deadlines`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: deadline.title,
        item: `${baseUrl}/deadlines/${deadline.id}`,
      },
    ],
  };

  const priorityColor =
    deadline.priority === "high"
      ? "#ff4d4f"
      : deadline.priority === "medium"
        ? "#faad14"
        : "#1677ff";

  const priorityLabel =
    deadline.priority === "high"
      ? "Ưu tiên cao"
      : deadline.priority === "medium"
        ? "Mức trung bình"
        : "Mức thấp";

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Schema.org JSON-LD BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      {/* Điều hướng Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link href="/">Trang chủ</Link> },
          { title: <Link href="/deadlines">Danh sách Deadline</Link> },
          {
            title: (
              <Link href={`/subjects/${deadline.subjectSlug}`}>
                {deadline.subjectName}
              </Link>
            ),
          },
          { title: `Chi tiết #${deadline.id}` },
        ]}
      />

      {/* Thẻ Chi tiết Deadline */}
      <Card
        className="minimal-card"
        style={{
          borderRadius: 12,
          border: "1px solid #eef0f2",
          backgroundColor: "#ffffff",
          marginBottom: 24,
        }}
      >
        <div style={{ padding: "8px 0" }}>
          {/* Hàng nhãn trạng thái */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <Space size={8} wrap>
              <Link href={`/subjects/${deadline.subjectSlug}`}>
                <Tag
                  icon={<BookOutlined />}
                  style={{
                    backgroundColor: "#ffffff",
                    borderColor: "#1677ff",
                    color: "#1677ff",
                    fontSize: 13,
                    padding: "3px 10px",
                    cursor: "pointer",
                  }}
                >
                  {deadline.subjectName}
                </Tag>
              </Link>

              <Tag
                style={{
                  color: priorityColor,
                  borderColor: priorityColor,
                  backgroundColor: "#ffffff",
                  fontSize: 13,
                  padding: "3px 10px",
                }}
              >
                {priorityLabel}
              </Tag>
            </Space>

            <CountdownBadge dueDate={deadline.dueDate} />
          </div>

          {/* Tiêu đề chính */}
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#1f2937",
              margin: "0 0 16px 0",
              lineHeight: 1.3,
            }}
          >
            {deadline.title}
          </h1>

          {/* Hàng thông tin thời gian & Người giao */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 24,
              padding: "14px 18px",
              backgroundColor: "#fafafa",
              borderRadius: 8,
              border: "1px solid #f0f0f0",
              marginBottom: 24,
              fontSize: 14,
              color: "#4b5563",
            }}
          >
            <Space size={8}>
              <CalendarOutlined style={{ color: "#1677ff", fontSize: 16 }} />
              <span>
                Hạn chót:{" "}
                <strong style={{ color: "#1f2937" }}>
                  {new Date(deadline.dueDate).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
              </span>
            </Space>

            <Space size={8}>
              <UserOutlined style={{ color: "#1677ff", fontSize: 16 }} />
              <span>
                Người đăng: <strong>{deadline.author}</strong>
              </span>
            </Space>

            <Space size={8}>
              <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 16 }} />
              <span>
                Đã nộp:{" "}
                <strong style={{ color: "#52c41a" }}>
                  {deadline.completedBy.length} bạn sinh viên
                </strong>
              </span>
            </Space>
          </div>

          {/* Nội dung chi tiết bài tập */}
          <div style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#1f2937",
                marginBottom: 12,
              }}
            >
              Nội dung yêu cầu chi tiết
            </h2>
            <div
              style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: "#374151",
                whiteSpace: "pre-line",
                backgroundColor: "#ffffff",
                border: "1px solid #f0f0f0",
                borderRadius: 8,
                padding: "20px",
              }}
            >
              {deadline.description}
            </div>
          </div>

          {/* Thanh tương tác Đánh dấu hoàn thành */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              borderTop: "1px solid #f0f0f0",
              paddingTop: 20,
            }}
          >
            <Space size={12}>
              <CompleteButton
                deadlineId={deadline.id}
                completedBy={deadline.completedBy}
                size="large"
              />

              <span style={{ fontSize: 13, color: "#6b7280" }}>
                (Lưu kết quả hoàn thành đồng bộ với tài khoản sinh viên)
              </span>
            </Space>

            <Space size={12}>
              <Link href="/deadlines">
                <Button icon={<ArrowLeftOutlined />}>Quay lại danh sách</Button>
              </Link>
            </Space>
          </div>
        </div>
      </Card>
    </div>
  );
}
