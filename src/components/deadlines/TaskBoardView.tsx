'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  AppstoreOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  PlusOutlined,
  EllipsisOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  BookOutlined,
  UserOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { Modal, Form, Input, Select, DatePicker, message, Tag } from 'antd';
import { Deadline, Subject } from '@/types';
import CompleteButton from './CompleteButton';
import CountdownBadge from './CountdownBadge';
import { addDeadlineAction } from '@/actions/deadline-actions';
import { useSession } from 'next-auth/react';

interface TaskBoardViewProps {
  initialDeadlines: Deadline[];
  subjects?: Subject[];
  currentSubject?: Subject;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function TaskBoardView({
  initialDeadlines,
  subjects = [],
  currentSubject,
  pageTitle = 'Bảng Quản Lý Deadline & Bài Tập',
  pageSubtitle = 'Theo dõi bài tập lớn, đồ án và tiểu luận các học phần PTIT theo tiến độ thời gian thực.'
}: TaskBoardViewProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const userEmail = user?.email;
  const isAdmin = user?.role === 'admin';

  const [viewMode, setViewMode] = useState<'board' | 'list' | 'calendar' | 'timeline'>('board');
  const [filterSubject, setFilterSubject] = useState<string>(currentSubject?.slug || 'all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Lọc bài tập theo môn học, mức độ ưu tiên và từ khóa
  const filteredDeadlines = useMemo(() => {
    return initialDeadlines.filter((item) => {
      if (filterSubject !== 'all' && item.subjectSlug !== filterSubject) return false;
      if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
      if (searchKeyword.trim()) {
        const query = searchKeyword.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [initialDeadlines, filterSubject, filterPriority, searchKeyword]);

  // Phân loại thành 4 cột Kanban chuẩn nghiệp vụ
  const columns = useMemo(() => {
    const todo: Deadline[] = [];
    const inProgress: Deadline[] = [];
    const review: Deadline[] = [];
    const completed: Deadline[] = [];

    const now = new Date().getTime();

    filteredDeadlines.forEach((item) => {
      const isCompleted = userEmail ? item.completedBy.includes(userEmail) : item.completedBy.length > 0;
      if (isCompleted) {
        completed.push(item);
        return;
      }

      const due = new Date(item.dueDate).getTime();
      const diffHours = (due - now) / (1000 * 60 * 60);

      if (diffHours < 48 || item.priority === 'high') {
        review.push(item);
      } else if (diffHours < 120 || item.priority === 'medium') {
        inProgress.push(item);
      } else {
        todo.push(item);
      }
    });

    return {
      todo: { id: 'todo', title: 'Cần làm', badge: todo.length, badgeBg: '#111827', items: todo },
      inProgress: { id: 'inProgress', title: 'Đang thực hiện', badge: inProgress.length, badgeBg: '#d97706', items: inProgress },
      review: { id: 'review', title: 'Chờ nộp bài', badge: review.length, badgeBg: '#7c3aed', items: review },
      completed: { id: 'completed', title: 'Đã hoàn thành', badge: completed.length, badgeBg: '#059669', items: completed }
    };
  }, [filteredDeadlines, userEmail]);

  const handleAddNewToColumn = (colId: string) => {
    if (!isAdmin) {
      message.warning('Chỉ Lớp trưởng (Admin) mới có quyền thêm deadline mới.');
      return;
    }
    let priorityVal: 'low' | 'medium' | 'high' = 'medium';
    if (colId === 'review') priorityVal = 'high';
    if (colId === 'todo') priorityVal = 'low';

    form.setFieldsValue({
      priority: priorityVal,
      subjectSlug: currentSubject?.slug || (subjects[0]?.slug ?? 'lap-trinh-web-nang-cao')
    });
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const res = await addDeadlineAction({
        title: values.title,
        description: values.description,
        subjectSlug: values.subjectSlug,
        priority: values.priority,
        dueDate: values.dueDate ? values.dueDate.toISOString() : new Date().toISOString()
      });

      if (res.success) {
        message.success('Đã thêm deadline bài tập thành công');
        setIsModalOpen(false);
        form.resetFields();
        window.location.reload();
      } else {
        message.error(res.error || 'Lỗi khi tạo bài tập');
      }
    } catch (e: any) {
      message.error(e.message || 'Lỗi hệ thống');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px 28px', backgroundColor: '#ffffff', minHeight: '100%' }}>
      {/* =========================================================================
          PAGE HEADER (Tiêu đề, mô tả và nút tác vụ chuẩn nghiệp vụ)
         ========================================================================= */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 20
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#111827',
              margin: 0,
              letterSpacing: '-0.02em'
            }}
          >
            {pageTitle}
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#6b7280' }}>
            {pageSubtitle}
          </p>
        </div>

        {/* Nút hành động */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            href="/dashboard/stats"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #e5e7eb',
              backgroundColor: '#ffffff',
              fontSize: 12,
              fontWeight: 500,
              color: '#374151'
            }}
          >
            <BarChartOutlined style={{ fontSize: 13 }} />
            <span>Thống kê tiến độ</span>
          </Link>

          {isAdmin ? (
            <button
              onClick={() => {
                form.setFieldsValue({
                  priority: 'medium',
                  subjectSlug: currentSubject?.slug || (subjects[0]?.slug ?? 'lap-trinh-web-nang-cao')
                });
                setIsModalOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: '#c41c13',
                fontSize: 13,
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(196,28,19,0.2)'
              }}
            >
              <PlusOutlined style={{ fontSize: 12 }} />
              <span>+ Thêm Deadline</span>
            </button>
          ) : (
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 6,
                border: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                fontSize: 12,
                fontWeight: 500,
                color: '#374151'
              }}
            >
              <UserOutlined style={{ fontSize: 12 }} />
              <span>Đăng nhập cán bộ lớp</span>
            </Link>
          )}
        </div>
      </div>

      {/* =========================================================================
          CHUYỂN ĐỔI CHẾ ĐỘ XEM: BẢNG, DANH SÁCH, LỊCH, TIẾN ĐỘ
         ========================================================================= */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => setViewMode('board')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: viewMode === 'board' ? 600 : 500,
              color: viewMode === 'board' ? '#c41c13' : '#6b7280',
              border: 'none',
              borderBottom: viewMode === 'board' ? '2px solid #c41c13' : '2px solid transparent',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            <AppstoreOutlined style={{ fontSize: 13 }} />
            <span>Bảng (Board)</span>
          </button>

          <button
            onClick={() => setViewMode('list')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: viewMode === 'list' ? 600 : 500,
              color: viewMode === 'list' ? '#c41c13' : '#6b7280',
              border: 'none',
              borderBottom: viewMode === 'list' ? '2px solid #c41c13' : '2px solid transparent',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            <UnorderedListOutlined style={{ fontSize: 13 }} />
            <span>Danh sách (List)</span>
          </button>

          <button
            onClick={() => setViewMode('calendar')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: viewMode === 'calendar' ? 600 : 500,
              color: viewMode === 'calendar' ? '#c41c13' : '#6b7280',
              border: 'none',
              borderBottom: viewMode === 'calendar' ? '2px solid #c41c13' : '2px solid transparent',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            <CalendarOutlined style={{ fontSize: 13 }} />
            <span>Lịch nộp (Calendar)</span>
          </button>

          <button
            onClick={() => setViewMode('timeline')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: viewMode === 'timeline' ? 600 : 500,
              color: viewMode === 'timeline' ? '#c41c13' : '#6b7280',
              border: 'none',
              borderBottom: viewMode === 'timeline' ? '2px solid #c41c13' : '2px solid transparent',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            <FieldTimeOutlined style={{ fontSize: 13 }} />
            <span>Tiến độ (Timeline)</span>
          </button>
        </div>

        {/* Thanh lọc nhanh theo học phần và mức độ ưu tiên */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6 }}>
          <Select
            size="small"
            value={filterSubject}
            onChange={(v) => setFilterSubject(v)}
            style={{ width: 180 }}
          >
            <Select.Option value="all">Tất cả học phần</Select.Option>
            {subjects.map((s) => (
              <Select.Option key={s.slug} value={s.slug}>
                {s.name}
              </Select.Option>
            ))}
          </Select>

          <Select
            size="small"
            value={filterPriority}
            onChange={(v) => setFilterPriority(v)}
            style={{ width: 130 }}
          >
            <Select.Option value="all">Tất cả mức độ</Select.Option>
            <Select.Option value="high">Ưu tiên cao</Select.Option>
            <Select.Option value="medium">Trung bình</Select.Option>
            <Select.Option value="low">Thấp</Select.Option>
          </Select>
        </div>
      </div>

      {/* =========================================================================
          CHẾ ĐỘ XEM 1: KANBAN BOARD VIEW (4 CỘT CHUẨN TIẾNG VIỆT)
         ========================================================================= */}
      {viewMode === 'board' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(260px, 1fr))',
            gap: 16,
            alignItems: 'start',
            overflowX: 'auto',
            paddingBottom: 24
          }}
        >
          {Object.values(columns).map((col) => (
            <div
              key={col.id}
              style={{
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              {/* Tiêu đề cột */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 2px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                    {col.title}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 20,
                      height: 20,
                      padding: '0 6px',
                      borderRadius: 10,
                      backgroundColor: col.badgeBg,
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums'
                    }}
                  >
                    {col.badge}
                  </span>
                </div>
                <EllipsisOutlined style={{ fontSize: 16, color: '#9ca3af' }} />
              </div>

              {/* Danh sách thẻ bài tập trong cột */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.items.map((task) => {
                  const isDone = userEmail ? task.completedBy.includes(userEmail) : task.completedBy.length > 0;
                  const formattedDate = new Date(task.dueDate).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  // Tính toán tiến độ
                  const progressValue = isDone ? 100 : col.id === 'review' ? 75 : col.id === 'inProgress' ? 45 : 15;
                  const progressLabel = isDone ? 'Đã hoàn thành' : col.id === 'review' ? 'Chờ kiểm tra' : col.id === 'inProgress' ? 'Đang thực hiện' : 'Chưa bắt đầu';

                  return (
                    <div
                      key={task.id}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        padding: '14px 14px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        transition: 'border-color 0.15s ease'
                      }}
                    >
                      {/* Tiêu đề & Học phần */}
                      <div>
                        <div style={{ marginBottom: 4 }}>
                          <Link href={`/subjects/${task.subjectSlug}`}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: '#0284c7',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <BookOutlined style={{ fontSize: 11 }} />
                              <span>{task.subjectName}</span>
                            </span>
                          </Link>
                        </div>
                        <Link
                          href={`/deadlines/${task.id}`}
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#111827',
                            lineHeight: 1.35,
                            textDecoration: 'none'
                          }}
                        >
                          {task.title}
                        </Link>
                      </div>

                      {/* Đoạn mô tả bài tập */}
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: '#6b7280',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {task.description}
                      </p>

                      {/* Đếm ngược thời gian chuẩn yêu cầu nghiệp vụ */}
                      <div>
                        <CountdownBadge dueDate={task.dueDate} />
                      </div>

                      {/* Thanh tiến độ */}
                      <div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: 11,
                            color: '#4b5563',
                            marginBottom: 4
                          }}
                        >
                          <span>{progressLabel}</span>
                          <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                            {progressValue}%
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: 4,
                            backgroundColor: '#f3f4f6',
                            borderRadius: 2,
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              width: `${progressValue}%`,
                              height: '100%',
                              backgroundColor: isDone ? '#059669' : col.id === 'review' ? '#7c3aed' : col.id === 'inProgress' ? '#d97706' : '#9ca3af',
                              borderRadius: 2,
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </div>
                      </div>

                      {/* Hạn chót & Nút hoàn thành */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid #f3f4f6',
                          paddingTop: 8,
                          fontSize: 11,
                          color: '#6b7280'
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <ClockCircleOutlined style={{ fontSize: 11 }} />
                          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formattedDate}</span>
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CompleteButton
                            deadlineId={task.id}
                            completedBy={task.completedBy}
                            size="small"
                          />

                          <Link
                            href={`/deadlines/${task.id}`}
                            style={{
                              color: '#374151',
                              fontSize: 12,
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '2px 4px'
                            }}
                            title="Xem chi tiết"
                          >
                            <ArrowRightOutlined style={{ fontSize: 11 }} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Nút Thêm mới ở chân cột (chỉ Admin) */}
                {isAdmin && (
                  <button
                    onClick={() => handleAddNewToColumn(col.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px',
                      borderRadius: 6,
                      border: '1px dashed #d1d5db',
                      backgroundColor: '#ffffff',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#6b7280',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#c41c13';
                      e.currentTarget.style.color = '#c41c13';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.color = '#6b7280';
                    }}
                  >
                    <PlusOutlined style={{ fontSize: 11 }} />
                    <span>Thêm bài tập</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          CHẾ ĐỘ XEM 2: LIST VIEW (DANH SÁCH BÀI TẬP)
         ========================================================================= */}
      {viewMode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {filteredDeadlines.map((task) => {
            const formattedDate = new Date(task.dueDate).toLocaleString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  gap: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                  <CompleteButton
                    deadlineId={task.id}
                    completedBy={task.completedBy}
                    size="small"
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <Link
                        href={`/deadlines/${task.id}`}
                        style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}
                      >
                        {task.title}
                      </Link>
                      <Tag style={{ fontSize: 11, margin: 0 }}>{task.subjectName}</Tag>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {task.description.slice(0, 90)}...
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <CountdownBadge dueDate={task.dueDate} />

                  <span style={{ fontSize: 12, color: '#6b7280', fontVariantNumeric: 'tabular-nums' }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {formattedDate}
                  </span>

                  <Link
                    href={`/deadlines/${task.id}`}
                    style={{ fontSize: 12, color: '#c41c13', fontWeight: 600 }}
                  >
                    Xem chi tiết →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          CHẾ ĐỘ XEM 3: CALENDAR VIEW (LỊCH DEADLINE THEO NGÀY)
         ========================================================================= */}
      {viewMode === 'calendar' && (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              marginBottom: 16
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>
              Lịch Hạn Nộp Bài Tập Học Kỳ
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
              Các mốc thời gian bài tập được sắp xếp theo trình tự ngày đến hạn.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredDeadlines
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map((task) => {
                const dateObj = new Date(task.dueDate);
                const dateStr = dateObj.toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                });
                const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '12px 16px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 6
                    }}
                  >
                    <div
                      style={{
                        minWidth: 100,
                        textAlign: 'center',
                        padding: '6px 10px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: 6
                      }}
                    >
                      <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'capitalize' }}>
                        {dateObj.toLocaleDateString('vi-VN', { weekday: 'short' })}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
                        {dateObj.getDate()} / {dateObj.getMonth() + 1}
                      </div>
                      <div style={{ fontSize: 11, color: '#c41c13', fontWeight: 600 }}>{timeStr}</div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Link
                          href={`/deadlines/${task.id}`}
                          style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}
                        >
                          {task.title}
                        </Link>
                        <Tag>{task.subjectName}</Tag>
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                        {task.description}
                      </div>
                    </div>

                    <CompleteButton
                      deadlineId={task.id}
                      completedBy={task.completedBy}
                      size="small"
                    />
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* =========================================================================
          CHẾ ĐỘ XEM 4: TIMELINE VIEW (DÒNG THỜI GIAN TIẾN ĐỘ)
         ========================================================================= */}
      {viewMode === 'timeline' && (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              marginBottom: 16
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>
              Dòng Thời Gian Tiến Độ Nộp Đồ Án
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
              Biểu diễn trực quan khoảng cách thời gian giữa các mốc nộp bài tập lớn trong kỳ.
            </p>
          </div>

          <div style={{ position: 'relative', paddingLeft: 24, borderLeft: '2px solid #e5e7eb', marginLeft: 16 }}>
            {filteredDeadlines
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map((task) => {
                const isDone = userEmail ? task.completedBy.includes(userEmail) : task.completedBy.length > 0;
                const formattedDate = new Date(task.dueDate).toLocaleString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={task.id} style={{ marginBottom: 20, position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: -31,
                        top: 2,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: isDone ? '#059669' : '#c41c13',
                        border: '2px solid #ffffff'
                      }}
                    />
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 6,
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>
                          {formattedDate} • {task.subjectName}
                        </div>
                        <Link
                          href={`/deadlines/${task.id}`}
                          style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}
                        >
                          {task.title}
                        </Link>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <CountdownBadge dueDate={task.dueDate} />
                        <CompleteButton
                          deadlineId={task.id}
                          completedBy={task.completedBy}
                          size="small"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: THÊM DEADLINE MỚI
         ========================================================================= */}
      <Modal
        title="Thêm Bài Tập Mới Cho Lớp"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreateSubmit}>
          <Form.Item
            name="title"
            label="Tiêu đề bài tập"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài tập' }]}
          >
            <Input placeholder="Ví dụ: Nộp tài liệu kiến trúc giai đoạn 2" />
          </Form.Item>

          <Form.Item
            name="subjectSlug"
            label="Học phần áp dụng"
            rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
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
            rules={[{ required: true, message: 'Vui lòng chọn hạn chót nộp bài' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
          </Form.Item>

          <Form.Item name="priority" label="Mức độ ưu tiên" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="low">Thấp</Select.Option>
              <Select.Option value="medium">Trung bình</Select.Option>
              <Select.Option value="high">Ưu tiên cao</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả chi tiết bài tập"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả bài tập' }]}
          >
            <Input.TextArea rows={3} placeholder="Mô tả yêu cầu đồ án, link nộp bài trên Google Classroom..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                border: 'none',
                background: '#c41c13',
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {submitting ? 'Đang lưu...' : 'Thêm bài tập'}
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
