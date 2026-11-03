import React from 'react';
import { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Đăng nhập hệ thống | Class Deadline Hub',
  description: 'Đăng nhập vào cổng thông tin quản lý hạn nộp bài tập lớp PTIT.',
  robots: {
    index: false,
    follow: false
  }
};

export default function LoginPage() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 16px'
      }}
    >
      <LoginForm />
    </div>
  );
}
