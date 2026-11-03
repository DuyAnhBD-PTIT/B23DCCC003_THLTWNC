'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Button, message, Tooltip } from 'antd';
import { CheckOutlined, LockOutlined } from '@ant-design/icons';
import { toggleDeadlineAction } from '@/actions/deadline-actions';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface CompleteButtonProps {
  deadlineId: string;
  initialCompleted?: boolean;
  completedBy?: string[];
  size?: 'small' | 'middle' | 'large';
  showText?: boolean;
}

export default function CompleteButton({
  deadlineId,
  initialCompleted = false,
  completedBy,
  size = 'middle',
  showText = true
}: CompleteButtonProps) {
  const { data: session } = useSession();
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (completedBy && session?.user?.email) {
      setIsCompleted(completedBy.includes(session.user.email));
    } else if (typeof initialCompleted === 'boolean') {
      setIsCompleted(initialCompleted);
    }
  }, [completedBy, session?.user?.email, initialCompleted]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      message.info('Vui lòng đăng nhập để đánh dấu trạng thái deadline.');
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Cập nhật lạc quan (optimistic update)
    const nextState = !isCompleted;
    setIsCompleted(nextState);

    startTransition(async () => {
      const res = await toggleDeadlineAction(deadlineId);
      if (res.success) {
        message.success(
          nextState ? 'Đã đánh dấu hoàn thành bài tập' : 'Đã bỏ đánh dấu hoàn thành'
        );
        router.refresh();
      } else {
        setIsCompleted(!nextState); // Rollback
        message.error(res.error || 'Có lỗi xảy ra khi cập nhật.');
      }
    });
  };

  if (!session?.user) {
    return (
      <Tooltip title="Đăng nhập để đánh dấu hoàn thành">
        <Button
          size={size}
          icon={<LockOutlined style={{ color: '#9ca3af' }} />}
          onClick={handleToggle}
          style={{
            borderColor: '#e5e7eb',
            color: '#6b7280',
            borderRadius: 6,
            fontSize: size === 'small' ? 12 : 13
          }}
        >
          {showText && 'Đánh dấu'}
        </Button>
      </Tooltip>
    );
  }

  return (
    <Button
      size={size}
      loading={isPending}
      onClick={handleToggle}
      icon={
        <CheckOutlined
          style={{
            color: isCompleted ? '#16a34a' : '#9ca3af',
            fontSize: size === 'small' ? 12 : 14
          }}
        />
      }
      style={{
        borderColor: isCompleted ? '#bbf7d0' : '#e5e7eb',
        backgroundColor: isCompleted ? '#f0fdf4' : '#ffffff',
        color: isCompleted ? '#15803d' : '#374151',
        fontWeight: isCompleted ? 600 : 500,
        borderRadius: 6,
        fontSize: size === 'small' ? 12 : 13,
        transition: 'all 0.15s ease'
      }}
    >
      {showText && (isCompleted ? 'Đã hoàn thành' : 'Đánh dấu xong')}
    </Button>
  );
}
