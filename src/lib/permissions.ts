import { Role, Action } from '@/types';

/**
 * Ma trận phân quyền duy nhất của hệ thống (Single Source of Truth)
 * -------------------------------------------------------------
 * | Hành động          | guest | user | admin |
 * | Xem deadline       |   ✓   |  ✓   |   ✓   |
 * | Đánh dấu đã xong   |   ✗   |  ✓   |   ✓   |
 * | Thêm deadline      |   ✗   |  ✗   |   ✓   |
 * | Xoá deadline       |   ✗   |  ✗   |   ✓   |
 */
export const PERMISSION_MATRIX: Record<Action, readonly Role[]> = {
  view_deadline: ['guest', 'user', 'admin'],
  mark_completed: ['user', 'admin'],
  add_deadline: ['admin'],
  delete_deadline: ['admin'],
} as const;

/**
 * Kiểm tra xem một vai trò có quyền thực hiện hành động hay không
 * @param role Vai trò hiện tại ('guest' | 'user' | 'admin')
 * @param action Hành động cần kiểm tra
 * @returns boolean
 */
export function can(role: Role | undefined | null, action: Action): boolean {
  const currentRole: Role = role || 'guest';
  const allowedRoles = PERMISSION_MATRIX[action];
  if (!allowedRoles) {
    return false;
  }
  return allowedRoles.includes(currentRole);
}

/**
 * Nhãn tiếng Việt cho các hành động
 */
export const ACTION_LABELS: Record<Action, string> = {
  view_deadline: 'Xem deadline',
  mark_completed: 'Đánh dấu đã xong',
  add_deadline: 'Thêm deadline',
  delete_deadline: 'Xoá deadline'
};
