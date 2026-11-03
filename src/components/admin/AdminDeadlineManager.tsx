"use client";

import React, { useState, useTransition } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Popconfirm,
  Tag,
  Space,
  message,
  Typography,
  Card,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Deadline, Subject } from "@/types";
import {
  addDeadlineAction,
  deleteDeadlineAction,
} from "@/actions/deadline-actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface AdminDeadlineManagerProps {
  deadlines: Deadline[];
  subjects: Subject[];
}

export default function AdminDeadlineManager({
  deadlines,
  subjects,
}: AdminDeadlineManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleOpenModal = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      startTransition(async () => {
        const payload = {
          title: values.title,
          subjectSlug: values.subjectSlug,
          description: values.description,
          dueDate: values.dueDate.toISOString(),
          priority: values.priority,
        };

        const res = await addDeadlineAction(payload);
        if (res.success) {
          message.success("Thêm deadline mới thành công!");
          setIsModalOpen(false);
          form.resetFields();
          router.refresh();
        } else {
          message.error(res.error || "Thêm deadline thất bại.");
        }
      });
    } catch {
      // Form validation error
    }
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteDeadlineAction(id);
      if (res.success) {
        message.success("Đã xoá deadline thành công!");
        router.refresh();
      } else {
        message.error(res.error || "Không thể xoá deadline.");
      }
    });
  };

  const columns: ColumnsType<Deadline> = [
    {
      title: "Mã",
      dataIndex: "id",
      key: "id",
      width: 70,
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: "Tiêu đề deadline",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div>
          <Link href={`/deadlines/${record.id}`}>
            <Text strong style={{ color: "#1677ff" }}>
              {title}
            </Text>
          </Link>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            Môn: {record.subjectName}
          </div>
        </div>
      ),
    },
    {
      title: "Hạn chót",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 170,
      render: (date) => (
        <Space direction="horizontal" size={4} style={{ fontSize: 13 }}>
          <CalendarOutlined style={{ color: "#1677ff" }} />
          <span>{dayjs(date).format("DD/MM/YYYY HH:mm")}</span>
        </Space>
      ),
    },
    {
      title: "Ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 120,
      render: (priority) => {
        const color =
          priority === "high"
            ? "#ff4d4f"
            : priority === "medium"
              ? "#faad14"
              : "#1677ff";
        const label =
          priority === "high"
            ? "Cao"
            : priority === "medium"
              ? "Trung bình"
              : "Thấp";
        return (
          <Tag
            style={{ color, borderColor: color, backgroundColor: "#ffffff" }}
          >
            {label}
          </Tag>
        );
      },
    },
    {
      title: "Đã hoàn thành",
      dataIndex: "completedBy",
      key: "completedBy",
      width: 130,
      render: (completedBy) => (
        <Tag icon={<CheckCircleOutlined />} color="success">
          {completedBy?.length || 0} sinh viên
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 140,
      align: "right",
      render: (_, record) => (
        <Space size={8}>
          <Link href={`/deadlines/${record.id}`}>
            <Button size="small" icon={<EyeOutlined />}>
              Xem
            </Button>
          </Link>

          <Popconfirm
            title="Xác nhận xoá deadline"
            description="Bạn có chắc chắn muốn xoá deadline này không? Thao tác này không thể hoàn tác."
            onConfirm={() => handleDelete(record.id)}
            okText="Xoá vĩnh viễn"
            cancelText="Huỷ"
            okButtonProps={{
              danger: true,
              style: { backgroundColor: "#ff4d4f" },
            }}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={isPending}
              style={{ borderColor: "#ff4d4f", color: "#ff4d4f" }}
            >
              Xoá
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Tiêu đề & Nút thêm mới */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0, color: "#1f2937" }}>
            Danh sách quản lý Deadline
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Tổng cộng {deadlines.length} deadline được ghi nhận trên hệ thống
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenModal}
          style={{ backgroundColor: "#1677ff" }}
        >
          Thêm Deadline mới
        </Button>
      </div>

      {/* Bảng dữ liệu */}
      <Card
        bodyStyle={{ padding: 0 }}
        style={{
          borderRadius: 10,
          border: "1px solid #eef0f2",
          overflow: "hidden",
          backgroundColor: "#ffffff",
        }}
      >
        <Table
          dataSource={deadlines}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng số ${total} mục`,
          }}
        />
      </Card>

      {/* Modal Thêm Deadline mới */}
      <Modal
        title="Thêm mới Deadline cho Lớp"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={isPending}
        okText="Tạo Deadline"
        cancelText="Đóng"
        okButtonProps={{ style: { backgroundColor: "#1677ff" } }}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ priority: "medium" }}
        >
          <Form.Item
            label="Tiêu đề deadline"
            name="title"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề deadline" },
              { min: 3, message: "Tiêu đề ít nhất 3 ký tự" },
            ]}
          >
            <Input placeholder="VD: Báo cáo tiến độ đồ án giai đoạn 1" />
          </Form.Item>

          <Form.Item
            label="Môn học"
            name="subjectSlug"
            rules={[{ required: true, message: "Vui lòng chọn môn học" }]}
          >
            <Select
              placeholder="Chọn môn học tương ứng"
              options={subjects.map((s) => ({
                value: s.slug,
                label: `${s.name} (${s.code})`,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Mô tả chi tiết yêu cầu"
            name="description"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mô tả yêu cầu bài nộp",
              },
              { min: 5, message: "Mô tả ít nhất 5 ký tự" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Yêu cầu cấu trúc thư mục, định dạng file PDF/Zip, link nộp bài..."
            />
          </Form.Item>

          <Form.Item
            label="Thời hạn hoàn thành (Hạn chót)"
            name="dueDate"
            rules={[
              { required: true, message: "Vui lòng chọn ngày giờ hạn chót" },
            ]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: "100%" }}
              placeholder="Chọn ngày và giờ"
            />
          </Form.Item>

          <Form.Item
            label="Mức độ ưu tiên"
            name="priority"
            rules={[
              { required: true, message: "Vui lòng chọn mức độ ưu tiên" },
            ]}
          >
            <Select
              options={[
                {
                  value: "high",
                  label: "🔴 Ưu tiên cao (Bài tập lớn, Đồ án, Thi)",
                },
                {
                  value: "medium",
                  label: "🟡 Mức trung bình (Bài tập tuần, Quiz)",
                },
                { value: "low", label: "🔵 Mức thấp (Khảo sát, Đọc tài liệu)" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
