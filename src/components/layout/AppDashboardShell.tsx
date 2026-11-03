"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  AppstoreOutlined,
  CheckSquareOutlined,
  FolderOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  LoginOutlined,
  SearchOutlined,
  BellOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  Dropdown,
  Avatar,
  Badge,
  Input,
  Tooltip,
  Modal,
  Form,
  Select,
  DatePicker,
  message,
} from "antd";
import type { MenuProps } from "antd";
import { addDeadlineAction } from "@/actions/deadline-actions";

interface AppDashboardShellProps {
  children: React.ReactNode;
}

export default function AppDashboardShell({
  children,
}: AppDashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const user = session?.user;
  const isAdmin = user?.role === "admin";

  // Nếu đang ở trang đăng nhập, hiển thị giao diện đăng nhập tinh gọn
  if (pathname === "/login") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
        {children}
      </div>
    );
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(
        `/deadlines?search=${encodeURIComponent(searchQuery.trim())}`,
      );
    }
  };

  const handleCreateDeadline = async (values: any) => {
    setSubmitting(true);
    try {
      const res = await addDeadlineAction({
        title: values.title,
        description: values.description,
        subjectSlug: values.subjectSlug,
        priority: values.priority,
        dueDate: values.dueDate
          ? values.dueDate.toISOString()
          : new Date().toISOString(),
      });

      if (res.success) {
        message.success("Đã tạo deadline bài tập thành công");
        setIsCreateModalOpen(false);
        createForm.resetFields();
        router.refresh();
      } else {
        message.error(res.error || "Không thể tạo deadline");
      }
    } catch (err: any) {
      message.error(err.message || "Lỗi khi tạo deadline");
    } finally {
      setSubmitting(false);
    }
  };

  const userMenuItems: MenuProps["items"] = user
    ? [
        {
          key: "user-info",
          disabled: true,
          label: (
            <div style={{ padding: "4px 0" }}>
              <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>
                {user.name}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{user.email}</div>
              <div style={{ marginTop: 4 }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 4,
                    backgroundColor: isAdmin ? "#fef2f2" : "#f0fdf4",
                    color: isAdmin ? "#c41c13" : "#059669",
                    border: `1px solid ${isAdmin ? "#fee2e2" : "#dcfce7"}`,
                  }}
                >
                  {isAdmin ? "Lớp trưởng " : "Sinh viên (User)"}
                </span>
              </div>
            </div>
          ),
        },
        { type: "divider" },
        {
          key: "my-tasks",
          label: <Link href="/dashboard">Deadline của tôi</Link>,
          icon: <CheckSquareOutlined />,
        },
        {
          key: "completed",
          label: <Link href="/dashboard/completed">Đã hoàn thành</Link>,
          icon: <CheckCircleOutlined />,
        },
        ...(isAdmin
          ? [
              {
                key: "admin-portal",
                label: <Link href="/admin">Quản lý lớp </Link>,
                icon: <SafetyCertificateOutlined />,
              },
            ]
          : []),
        { type: "divider" },
      ]
    : [
        {
          key: "login",
          label: <Link href="/login">Đăng nhập tài khoản PTIT</Link>,
          icon: <LoginOutlined />,
        },
      ];

  // 4 môn học chuẩn theo yêu cầu đề bài
  const subjects = [
    {
      slug: "lap-trinh-web-nang-cao",
      code: "INT1416",
      name: "Lập trình Web nâng cao",
      color: "#2563eb",
    },
    {
      slug: "kien-truc-phan-mem",
      code: "INT1434",
      name: "Kiến trúc phần mềm",
      color: "#059669",
    },
    {
      slug: "hoc-may-va-ung-dung",
      code: "INT1450",
      name: "Học máy và ứng dụng",
      color: "#7c3aed",
    },
    {
      slug: "an-toan-bao-mat-thong-tin",
      code: "INT1482",
      name: "An toàn bảo mật thông tin",
      color: "#d97706",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        color: "#111827",
      }}
    >
      {/* =========================================================================
          1. FAR-LEFT DOCK (56px)
         ========================================================================= */}
      <aside
        style={{
          width: 56,
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 12,
          paddingBottom: 14,
          flexShrink: 0,
          zIndex: 30,
        }}
      >
        {/* Logo App sử dụng favicon của bạn */}
        <Link
          href="/"
          style={{ marginBottom: 18 }}
          title="Class Deadline Hub - Trang chủ"
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 3,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              transition: "all 0.15s ease",
            }}
          >
            <img
              src="/favicon.ico"
              alt="Logo"
              width={26}
              height={26}
              style={{ objectFit: "contain" }}
            />
          </div>
        </Link>

        {/* Các biểu tượng chức năng ở Dock */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}
        >
          <Tooltip title="Tất cả Deadline bài tập" placement="right">
            <Link
              href="/deadlines"
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color:
                  pathname === "/" || pathname.startsWith("/deadlines")
                    ? "#ffffff"
                    : "#6b7280",
                backgroundColor:
                  pathname === "/" || pathname.startsWith("/deadlines")
                    ? "#c41c13"
                    : "transparent",
                transition: "all 0.15s ease",
              }}
            >
              <AppstoreOutlined style={{ fontSize: 18 }} />
            </Link>
          </Tooltip>

          <Tooltip title="Deadline của tôi" placement="right">
            <Link
              href="/dashboard"
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: pathname === "/dashboard" ? "#ffffff" : "#6b7280",
                backgroundColor:
                  pathname === "/dashboard" ? "#c41c13" : "transparent",
                transition: "all 0.15s ease",
              }}
            >
              <CheckSquareOutlined style={{ fontSize: 18 }} />
            </Link>
          </Tooltip>

          <Tooltip title="Bài tập đã hoàn thành" placement="right">
            <Link
              href="/dashboard/completed"
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color:
                  pathname === "/dashboard/completed" ? "#ffffff" : "#6b7280",
                backgroundColor:
                  pathname === "/dashboard/completed"
                    ? "#c41c13"
                    : "transparent",
                transition: "all 0.15s ease",
              }}
            >
              <CheckCircleOutlined style={{ fontSize: 18 }} />
            </Link>
          </Tooltip>

          <Tooltip title="Học phần môn học" placement="right">
            <Link
              href="/subjects/lap-trinh-web-nang-cao"
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: pathname.startsWith("/subjects") ? "#ffffff" : "#6b7280",
                backgroundColor: pathname.startsWith("/subjects")
                  ? "#c41c13"
                  : "transparent",
                transition: "all 0.15s ease",
              }}
            >
              <FolderOutlined style={{ fontSize: 18 }} />
            </Link>
          </Tooltip>

          <Tooltip title="Thống kê tiến độ" placement="right">
            <Link
              href="/dashboard/stats"
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: pathname === "/dashboard/stats" ? "#ffffff" : "#6b7280",
                backgroundColor:
                  pathname === "/dashboard/stats" ? "#c41c13" : "transparent",
                transition: "all 0.15s ease",
              }}
            >
              <BarChartOutlined style={{ fontSize: 18 }} />
            </Link>
          </Tooltip>

          {isAdmin && (
            <Tooltip title="Quản trị Lớp trưởng" placement="right">
              <Link
                href="/admin"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: pathname.startsWith("/admin") ? "#ffffff" : "#dc2626",
                  backgroundColor: pathname.startsWith("/admin")
                    ? "#c41c13"
                    : "transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <SafetyCertificateOutlined style={{ fontSize: 18 }} />
              </Link>
            </Tooltip>
          )}
        </div>

        {/* Biểu tượng dưới cùng */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginTop: "auto",
          }}
        >
          {user ? (
            <Tooltip title="Đăng xuất" placement="right">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9ca3af",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <LogoutOutlined style={{ fontSize: 18 }} />
              </button>
            </Tooltip>
          ) : (
            <Tooltip title="Đăng nhập" placement="right">
              <Link
                href="/login"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#111827",
                  border: "none",
                  background: "transparent",
                }}
              >
                <LoginOutlined style={{ fontSize: 18 }} />
              </Link>
            </Tooltip>
          )}
        </div>
      </aside>

      {/* =========================================================================
          2. SECONDARY SIDEBAR (Panel điều hướng 220px)
         ========================================================================= */}
      {!collapsed && (
        <aside
          style={{
            width: 220,
            backgroundColor: "#ffffff",
            borderRight: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            overflowY: "auto",
          }}
        >
          {/* Header Workspace PTIT */}
          <div
            style={{
              padding: "16px 16px 12px 16px",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#111827",
                letterSpacing: "-0.01em",
              }}
            >
              Class Deadline Hub
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Cổng thông tin bài tập lớp PTIT
            </div>
          </div>

          <div
            style={{
              padding: "12px 8px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            {/* Menu chính */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "#9ca3af",
                  padding: "0 8px 6px 8px",
                }}
              >
                Menu chính
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Link
                  href="/deadlines"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 10px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight:
                      pathname === "/deadlines" || pathname === "/" ? 600 : 500,
                    color:
                      pathname === "/deadlines" || pathname === "/"
                        ? "#c41c13"
                        : "#374151",
                    backgroundColor:
                      pathname === "/deadlines" || pathname === "/"
                        ? "#fef2f2"
                        : "transparent",
                    borderLeft:
                      pathname === "/deadlines" || pathname === "/"
                        ? "3px solid #c41c13"
                        : "3px solid transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <AppstoreOutlined style={{ fontSize: 14 }} />
                    <span>Tất cả bài tập</span>
                  </span>
                </Link>

                <Link
                  href="/dashboard"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 10px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: pathname === "/dashboard" ? 600 : 500,
                    color: pathname === "/dashboard" ? "#c41c13" : "#374151",
                    backgroundColor:
                      pathname === "/dashboard" ? "#fef2f2" : "transparent",
                    borderLeft:
                      pathname === "/dashboard"
                        ? "3px solid #c41c13"
                        : "3px solid transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <CheckSquareOutlined style={{ fontSize: 14 }} />
                    <span>Deadline của tôi</span>
                  </span>
                </Link>

                <Link
                  href="/dashboard/completed"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 10px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: pathname === "/dashboard/completed" ? 600 : 500,
                    color:
                      pathname === "/dashboard/completed"
                        ? "#c41c13"
                        : "#374151",
                    backgroundColor:
                      pathname === "/dashboard/completed"
                        ? "#fef2f2"
                        : "transparent",
                    borderLeft:
                      pathname === "/dashboard/completed"
                        ? "3px solid #c41c13"
                        : "3px solid transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <CheckCircleOutlined style={{ fontSize: 14 }} />
                    <span>Đã hoàn thành</span>
                  </span>
                </Link>

                <Link
                  href="/dashboard/stats"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 10px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: pathname === "/dashboard/stats" ? 600 : 500,
                    color:
                      pathname === "/dashboard/stats" ? "#c41c13" : "#374151",
                    backgroundColor:
                      pathname === "/dashboard/stats"
                        ? "#fef2f2"
                        : "transparent",
                    borderLeft:
                      pathname === "/dashboard/stats"
                        ? "3px solid #c41c13"
                        : "3px solid transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <BarChartOutlined style={{ fontSize: 14 }} />
                    <span>Thống kê tiến độ</span>
                  </span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "7px 10px",
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: pathname.startsWith("/admin") ? 600 : 500,
                      color: pathname.startsWith("/admin")
                        ? "#c41c13"
                        : "#dc2626",
                      backgroundColor: pathname.startsWith("/admin")
                        ? "#fef2f2"
                        : "transparent",
                      borderLeft: pathname.startsWith("/admin")
                        ? "3px solid #c41c13"
                        : "3px solid transparent",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <SafetyCertificateOutlined style={{ fontSize: 14 }} />
                      <span>Quản trị Deadline</span>
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Học phần môn học */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 8px 6px 8px",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "#9ca3af",
                  }}
                >
                  Học phần (4 môn)
                </span>
                {isAdmin && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    title="Thêm deadline cho học phần"
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      color: "#c41c13",
                      fontSize: 12,
                      padding: 0,
                    }}
                  >
                    <PlusOutlined />
                  </button>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {subjects.map((sub) => {
                  const isActive = pathname === `/subjects/${sub.slug}`;
                  return (
                    <Link
                      key={sub.slug}
                      href={`/subjects/${sub.slug}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 10px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? "#c41c13" : "#4b5563",
                        backgroundColor: isActive ? "#fef2f2" : "transparent",
                        borderLeft: isActive
                          ? "3px solid #c41c13"
                          : "3px solid transparent",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            backgroundColor: sub.color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: 140,
                          }}
                        >
                          {sub.name}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Tài khoản phân quyền theo đề bài */}
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "#9ca3af",
                  padding: "0 8px 6px 8px",
                }}
              >
                Tài khoản hệ thống
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 8px",
                    fontSize: 12,
                    color: "#374151",
                    borderRadius: 4,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <Avatar
                      size={20}
                      style={{
                        backgroundColor: "#c41c13",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      AD
                    </Avatar>
                    <span
                      style={{
                        position: "absolute",
                        bottom: -1,
                        right: -1,
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "#10b981",
                        border: "1px solid #ffffff",
                      }}
                    />
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      admin@ptit.edu.vn
                    </div>
                    <div style={{ fontSize: 10, color: "#6b7280" }}>
                      Lớp trưởng{" "}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "4px 8px",
                    fontSize: 12,
                    color: "#374151",
                    borderRadius: 4,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <Avatar
                      size={20}
                      style={{
                        backgroundColor: "#0284c7",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      SV
                    </Avatar>
                    <span
                      style={{
                        position: "absolute",
                        bottom: -1,
                        right: -1,
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "#10b981",
                        border: "1px solid #ffffff",
                      }}
                    />
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      sv@ptit.edu.vn
                    </div>
                    <div style={{ fontSize: 10, color: "#6b7280" }}>
                      Sinh viên (User)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* =========================================================================
          3. MAIN CONTENT CONTAINER
         ========================================================================= */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          backgroundColor: "#ffffff",
        }}
      >
        {/* Header trên cùng */}
        <header
          style={{
            height: 52,
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            backgroundColor: "#ffffff",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          {/* Breadcrumb và Nút thu gọn Sidebar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#6b7280",
                display: "flex",
                alignItems: "center",
                padding: 4,
              }}
              title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
              Bài tập & Deadline
            </span>
          </div>

          {/* Thanh công cụ phải: Tìm kiếm, Thông báo, Hồ sơ */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 220 }}>
              <Input
                placeholder="Tìm kiếm bài tập..."
                prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                size="small"
                style={{
                  borderRadius: 20,
                  fontSize: 12,
                  backgroundColor: "#f9fafb",
                  borderColor: "#e5e7eb",
                }}
              />
            </div>
            {/* Menu người dùng */}
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: "3px 8px",
                  borderRadius: 20,
                  border: "1px solid #e5e7eb",
                }}
              >
                <Avatar
                  size={24}
                  style={{
                    backgroundColor: isAdmin
                      ? "#c41c13"
                      : user
                        ? "#0284c7"
                        : "#9ca3af",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {user ? (isAdmin ? "AD" : "SV") : "K"}
                </Avatar>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#374151",
                    paddingRight: 4,
                  }}
                >
                  {user ? (isAdmin ? "Lớp trưởng" : "Sinh viên") : "Đăng nhập"}
                </span>
              </div>
            </Dropdown>
          </div>
        </header>

        {/* Nội dung trang */}
        <main style={{ flex: 1, overflowY: "auto" }}>{children}</main>
      </div>

      {/* Modal Thêm Deadline mới (dành cho Lớp trưởng) */}
      <Modal
        title="Thêm Deadline Bài Tập Mới"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateDeadline}
          initialValues={{
            priority: "medium",
            subjectSlug: "lap-trinh-web-nang-cao",
          }}
        >
          <Form.Item
            name="title"
            label="Tiêu đề bài tập hoặc đồ án"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề bài tập" },
            ]}
          >
            <Input placeholder="Ví dụ: Báo cáo tiến độ đồ án lớn" />
          </Form.Item>

          <Form.Item
            name="subjectSlug"
            label="Học phần áp dụng"
            rules={[{ required: true, message: "Vui lòng chọn học phần" }]}
          >
            <Select>
              {subjects.map((s) => (
                <Select.Option key={s.slug} value={s.slug}>
                  {s.name} ({s.code})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Hạn chót nộp bài"
            rules={[
              { required: true, message: "Vui lòng chọn hạn chót nộp bài" },
            ]}
          >
            <DatePicker
              showTime
              style={{ width: "100%" }}
              format="DD/MM/YYYY HH:mm"
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Mức độ ưu tiên"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="low">Thấp</Select.Option>
              <Select.Option value="medium">Trung bình</Select.Option>
              <Select.Option value="high">Ưu tiên cao</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả yêu cầu bài tập"
            rules={[{ required: true, message: "Vui lòng nhập mô tả bài tập" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Mô tả yêu cầu, link nộp bài trên LMS hoặc Google Classroom..."
            />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                background: "#ffffff",
                cursor: "pointer",
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "6px 16px",
                borderRadius: 6,
                border: "none",
                background: "#c41c13",
                color: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {submitting ? "Đang lưu..." : "Tạo Deadline"}
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
