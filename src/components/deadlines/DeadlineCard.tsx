import React from 'react';
import Link from 'next/link';
import { Card, Space } from 'antd';
import {
  CalendarOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { Deadline } from '@/types';
import CountdownBadge from './CountdownBadge';
import CompleteButton from './CompleteButton';

interface DeadlineCardProps {
  deadline: Deadline;
  userEmail?: string;
}

export default function DeadlineCard({ deadline, userEmail }: DeadlineCardProps) {
  const formattedDate = new Date(deadline.dueDate).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const priorityLabel =
    deadline.priority === 'high'
      ? 'Ưu tiên cao'
      : deadline.priority === 'medium'
      ? 'Trung bình'
      : 'Thấp';

  return (
    <Card
      hoverable
      className="minimal-card"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 12,
        backgroundColor: '#ffffff'
      }}
      bodyStyle={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between'
      }}
    >
      <div>
        {/* Hàng trên: Môn học và Countdown Badge */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12
          }}
        >
          <Link href={`/subjects/${deadline.subjectSlug}`}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#4b5563',
                backgroundColor: '#f3f4f6',
                padding: '3px 8px',
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'background-color 0.15s'
              }}
            >
              {deadline.subjectName}
            </span>
          </Link>
          <CountdownBadge dueDate={deadline.dueDate} />
        </div>

        {/* Tiêu đề deadline */}
        <Link href={`/deadlines/${deadline.id}`}>
          <h3
            style={{
              margin: '0 0 8px 0',
              fontSize: 15,
              fontWeight: 600,
              color: '#111827',
              lineHeight: 1.45,
              cursor: 'pointer'
            }}
          >
            {deadline.title}
          </h3>
        </Link>

        {/* Mô tả ngắn */}
        <p
          style={{
            fontSize: 13,
            color: '#6b7280',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: 16,
            lineHeight: 1.55
          }}
          title={deadline.description}
        >
          {deadline.description}
        </p>
      </div>

      <div>
        {/* Hàng thông tin thời hạn và mức ưu tiên */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 12,
            borderTop: '1px solid #f3f4f6',
            marginBottom: 16,
            fontSize: 12,
            color: '#6b7280'
          }}
        >
          <Space size={6} className="tabular-nums">
            <CalendarOutlined style={{ color: '#9ca3af' }} />
            <span>{formattedDate}</span>
          </Space>

          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: deadline.priority === 'high' ? '#b91c1c' : '#4b5563',
              backgroundColor: deadline.priority === 'high' ? '#fef2f2' : '#f9fafb',
              padding: '2px 6px',
              borderRadius: 4,
              border: `1px solid ${deadline.priority === 'high' ? '#fee2e2' : '#e5e7eb'}`
            }}
          >
            {priorityLabel}
          </span>
        </div>

        {/* Nút hành động */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8
          }}
        >
          <CompleteButton
            deadlineId={deadline.id}
            completedBy={deadline.completedBy}
            size="small"
          />

          <Link href={`/deadlines/${deadline.id}`}>
            <span
              style={{
                color: '#111827',
                fontSize: 13,
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer'
              }}
            >
              <span>Xem chi tiết</span>
              <ArrowRightOutlined style={{ fontSize: 11, color: '#9ca3af' }} />
            </span>
          </Link>
        </div>
      </div>
    </Card>
  );
}
