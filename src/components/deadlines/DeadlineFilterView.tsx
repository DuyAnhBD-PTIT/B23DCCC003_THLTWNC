'use client';

import React, { useState, useMemo } from 'react';
import { Row, Col, Input, Select, Segmented, Empty, Space } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { Deadline, Subject } from '@/types';
import DeadlineCard from './DeadlineCard';
import { useSession } from 'next-auth/react';

interface DeadlineFilterViewProps {
  initialDeadlines: Deadline[];
  subjects: Subject[];
  userEmail?: string | null;
}

export default function DeadlineFilterView({
  initialDeadlines,
  subjects,
  userEmail: propUserEmail
}: DeadlineFilterViewProps) {
  const { data: session } = useSession();
  const userEmail = propUserEmail ?? session?.user?.email;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const filteredDeadlines = useMemo(() => {
    const now = new Date().getTime();

    return initialDeadlines.filter((item) => {
      // 1. Tìm kiếm từ khóa
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchSub = item.subjectName.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSub) return false;
      }

      // 2. Lọc theo môn học
      if (selectedSubject !== 'all' && item.subjectSlug !== selectedSubject) {
        return false;
      }

      // 3. Lọc theo trạng thái
      const isCompleted = userEmail ? item.completedBy.includes(userEmail) : false;
      const isOverdue = new Date(item.dueDate).getTime() < now;

      if (selectedStatus === 'completed' && !isCompleted) return false;
      if (selectedStatus === 'pending' && isCompleted) return false;
      if (selectedStatus === 'overdue' && (!isOverdue || isCompleted)) return false;

      // 4. Lọc theo mức độ ưu tiên
      if (selectedPriority !== 'all' && item.priority !== selectedPriority) {
        return false;
      }

      return true;
    });
  }, [initialDeadlines, searchQuery, selectedSubject, selectedStatus, selectedPriority, userEmail]);

  return (
    <div>
      {/* Thanh điều khiển bộ lọc (Filter bar) */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 24,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.02)'
        }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm kiếm deadline theo tên hoặc nội dung..."
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              size="middle"
              style={{ borderRadius: 8 }}
            />
          </Col>

          <Col xs={24} sm={12} md={5}>
            <Select
              style={{ width: '100%' }}
              value={selectedSubject}
              onChange={setSelectedSubject}
              options={[
                { value: 'all', label: 'Tất cả môn học' },
                ...subjects.map((s) => ({ value: s.slug, label: s.name }))
              ]}
              size="middle"
            />
          </Col>

          <Col xs={24} sm={12} md={5}>
            <Select
              style={{ width: '100%' }}
              value={selectedPriority}
              onChange={setSelectedPriority}
              options={[
                { value: 'all', label: 'Tất cả mức ưu tiên' },
                { value: 'high', label: 'Ưu tiên cao' },
                { value: 'medium', label: 'Mức trung bình' },
                { value: 'low', label: 'Mức thấp' }
              ]}
              size="middle"
            />
          </Col>

          <Col xs={24} md={6}>
            <Segmented
              block
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val as string)}
              options={[
                { label: 'Tất cả', value: 'all' },
                { label: 'Chờ nộp', value: 'pending' },
                { label: 'Đã xong', value: 'completed' },
                { label: 'Quá hạn', value: 'overdue' }
              ]}
            />
          </Col>
        </Row>

        {/* Số lượng kết quả */}
        <div
          style={{
            marginTop: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 13,
            color: '#6b7280',
            borderTop: '1px solid #f3f4f6',
            paddingTop: 10
          }}
        >
          <Space size={6} className="tabular-nums">
            <FilterOutlined style={{ color: '#9ca3af' }} />
            <span>
              Hiển thị <strong style={{ color: '#111827' }}>{filteredDeadlines.length}</strong> /{' '}
              {initialDeadlines.length} deadline
            </span>
          </Space>

          {(searchQuery || selectedSubject !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('all');
                setSelectedStatus('all');
                setSelectedPriority('all');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#4b5563',
                fontSize: 12,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Danh sách thẻ deadline */}
      {filteredDeadlines.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: '48px 24px',
            textAlign: 'center'
          }}
        >
          <Empty
            description={
              <span style={{ color: '#6b7280' }}>
                Không tìm thấy deadline nào phù hợp với điều kiện lọc.
              </span>
            }
          />
        </div>
      ) : (
        <Row gutter={[20, 20]}>
          {filteredDeadlines.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.id}>
              <DeadlineCard deadline={item} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
