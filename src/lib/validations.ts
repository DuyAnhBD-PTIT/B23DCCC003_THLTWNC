import { z } from 'zod';

// Schema xác thực dữ liệu đầu vào bằng Zod
export const createDeadlineSchema = z.object({
  title: z
    .string()
    .min(3, 'Tiêu đề deadline phải có ít nhất 3 ký tự')
    .max(150, 'Tiêu đề không được vượt quá 150 ký tự'),
  subjectSlug: z.string().min(1, 'Vui lòng chọn môn học'),
  description: z
    .string()
    .min(5, 'Mô tả chi tiết phải có ít nhất 5 ký tự')
    .max(2000, 'Mô tả không được vượt quá 2000 ký tự'),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Hạn chót không hợp lệ'
  }),
  priority: z.enum(['low', 'medium', 'high'] as const, {
    errorMap: () => ({ message: 'Mức độ ưu tiên phải là Thấp, Trung bình hoặc Cao' })
  })
});

export type CreateDeadlineInput = z.infer<typeof createDeadlineSchema>;

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}
