'use client';

import React, { useState, useEffect } from 'react';

interface CountdownBadgeProps {
  dueDate: string;
  isCompleted?: boolean;
}

export default function CountdownBadge({ dueDate, isCompleted }: CountdownBadgeProps) {
  const [diffText, setDiffText] = useState<{
    text: string;
    dotColor: string;
    textColor: string;
  }>({
    text: 'Đang tính...',
    dotColor: '#9ca3af',
    textColor: '#6b7280'
  });

  useEffect(() => {
    function calculateDiff() {
      if (isCompleted) {
        setDiffText({
          text: 'Đã hoàn thành',
          dotColor: '#16a34a', // Success
          textColor: '#15803d'
        });
        return;
      }

      const now = new Date().getTime();
      const target = new Date(dueDate).getTime();
      const diffMs = target - now;

      // Đã quá hạn
      if (diffMs < 0) {
        const daysOverdue = Math.max(1, Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24)));
        setDiffText({
          text: `Quá hạn ${daysOverdue} ngày`,
          dotColor: '#dc2626', // Overdue red
          textColor: '#b91c1c'
        });
        return;
      }

      const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hoursRemaining = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (daysRemaining === 0) {
        if (hoursRemaining === 0) {
          setDiffText({
            text: 'Hết hạn hôm nay',
            dotColor: '#d97706', // Warning amber
            textColor: '#b45309'
          });
        } else {
          setDiffText({
            text: `Còn ${hoursRemaining} giờ`,
            dotColor: '#d97706',
            textColor: '#b45309'
          });
        }
      } else if (daysRemaining <= 3) {
        setDiffText({
          text: `Còn ${daysRemaining} ngày`,
          dotColor: '#d97706',
          textColor: '#b45309'
        });
      } else {
        setDiffText({
          text: `Còn ${daysRemaining} ngày`,
          dotColor: '#4b5563', // Neutral text role
          textColor: '#374151'
        });
      }
    }

    calculateDiff();
    const interval = setInterval(calculateDiff, 60000);
    return () => clearInterval(interval);
  }, [dueDate, isCompleted]);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
        color: diffText.textColor,
        lineHeight: 1
      }}
      className="tabular-nums"
    >
      <span
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: diffText.dotColor,
          marginRight: 6,
          flexShrink: 0
        }}
      />
      <span>{diffText.text}</span>
    </div>
  );
}
