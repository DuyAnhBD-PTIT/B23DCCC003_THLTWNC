"use client";

import React, { useState } from "react";
import { Card, Form, Input, Button, Alert, Tag, Space } from "antd";
import {
  MailOutlined,
  LockOutlined,
  LoginOutlined,
  CrownOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        callbackUrl,
      });

      if (res?.error) {
        setErrorMessage(
          "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.",
        );
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrorMessage("Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (email: string, pass: string) => {
    form.setFieldsValue({
      email,
      password: pass,
    });
    setErrorMessage(null);
  };

  return (
    <Card
      className="minimal-card"
      style={{
        width: "100%",
        maxWidth: 440,
        borderRadius: 14,
        border: "1px solid #eef0f2",
        backgroundColor: "#ffffff",
        padding: "16px 8px",
        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.05)",
      }}
    >
      {/* Logo PTIT chính thức & Tiêu đề */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <img
            src="/favicon.ico"
            alt="Logo PTIT"
            width={52}
            height={52}
            style={{ objectFit: "contain" }}
          />
        </div>
        <h2
          style={{
            margin: "0 0 6px 0",
            fontSize: 22,
            fontWeight: 700,
            color: "#1f2937",
          }}
        >
          Đăng nhập Hệ thống
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
          Class Deadline Hub
        </p>
      </div>

      {errorMessage && (
        <Alert
          message={errorMessage}
          type="error"
          showIcon
          style={{ marginBottom: 20, borderRadius: 6 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          label={
            <span style={{ fontWeight: 500, color: "#374151" }}>
              Địa chỉ Email
            </span>
          }
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email trường PTIT" },
            { type: "email", message: "Định dạng email không hợp lệ" },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: "#1677ff" }} />}
            placeholder="admin@ptit.edu.vn hoặc sv@ptit.edu.vn"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ fontWeight: 500, color: "#374151" }}>Mật khẩu</span>
          }
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: "#1677ff" }} />}
            placeholder="Mật khẩu truy cập"
            size="large"
          />
        </Form.Item>

        <Form.Item style={{ marginTop: 24, marginBottom: 16 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            icon={<LoginOutlined />}
            style={{ backgroundColor: "#1677ff", height: 44, fontWeight: 600 }}
          >
            Đăng nhập ngay
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
