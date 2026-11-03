import { createDeadlineSchema } from '@/lib/validations';

describe('Kiểm thử Xác thực dữ liệu đầu vào (Zod Schema)', () => {
  it('Chấp nhận dữ liệu deadline đầy đủ và hợp lệ', () => {
    const validData = {
      title: 'Báo cáo giữa kỳ Kiến trúc phần mềm',
      subjectSlug: 'kien-truc-phan-mem',
      description: 'Nộp slide và tài liệu thiết kế hệ thống theo mô hình Microservices.',
      dueDate: '2026-11-20T23:59:00Z',
      priority: 'high'
    };
    const result = createDeadlineSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('Từ chối tiêu đề quá ngắn dưới 3 ký tự', () => {
    const invalidData = {
      title: 'Ab',
      subjectSlug: 'kien-truc-phan-mem',
      description: 'Mô tả bài tập...',
      dueDate: '2026-11-20T23:59:00Z',
      priority: 'medium'
    };
    const result = createDeadlineSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title).toBeDefined();
    }
  });

  it('Từ chối ngày hết hạn không hợp lệ', () => {
    const invalidData = {
      title: 'Bài tập tuần',
      subjectSlug: 'hoc-may-va-ung-dung',
      description: 'Nội dung thực hành...',
      dueDate: 'invalid-date-format',
      priority: 'low'
    };
    const result = createDeadlineSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.dueDate).toBeDefined();
    }
  });

  it('Từ chối độ ưu tiên không nằm trong enum', () => {
    const invalidData = {
      title: 'Bài tập tuần',
      subjectSlug: 'hoc-may-va-ung-dung',
      description: 'Nội dung thực hành...',
      dueDate: '2026-11-20T23:59:00Z',
      priority: 'urgent' // Not in 'low' | 'medium' | 'high'
    };
    const result = createDeadlineSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
