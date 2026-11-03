import { can, PERMISSION_MATRIX } from '../permissions';
import { Role, Action } from '@/types';

describe('Kiểm thử Ma trận phân quyền can(role, action)', () => {
  describe('Hành động: view_deadline (Xem deadline)', () => {
    it('Cho phép guest xem deadline', () => {
      expect(can('guest', 'view_deadline')).toBe(true);
    });

    it('Cho phép user xem deadline', () => {
      expect(can('user', 'view_deadline')).toBe(true);
    });

    it('Cho phép admin xem deadline', () => {
      expect(can('admin', 'view_deadline')).toBe(true);
    });

    it('Mặc định role null hoặc undefined được coi là guest và vẫn xem được', () => {
      expect(can(undefined, 'view_deadline')).toBe(true);
      expect(can(null, 'view_deadline')).toBe(true);
    });
  });

  describe('Hành động: mark_completed (Đánh dấu đã xong)', () => {
    it('Từ chối guest đánh dấu đã xong', () => {
      expect(can('guest', 'mark_completed')).toBe(false);
      expect(can(undefined, 'mark_completed')).toBe(false);
    });

    it('Cho phép user đánh dấu đã xong', () => {
      expect(can('user', 'mark_completed')).toBe(true);
    });

    it('Cho phép admin đánh dấu đã xong', () => {
      expect(can('admin', 'mark_completed')).toBe(true);
    });
  });

  describe('Hành động: add_deadline (Thêm deadline)', () => {
    it('Từ chối guest thêm deadline', () => {
      expect(can('guest', 'add_deadline')).toBe(false);
    });

    it('Từ chối user sinh viên thêm deadline', () => {
      expect(can('user', 'add_deadline')).toBe(false);
    });

    it('Cho phép admin thêm deadline', () => {
      expect(can('admin', 'add_deadline')).toBe(true);
    });
  });

  describe('Hành động: delete_deadline (Xoá deadline)', () => {
    it('Từ chối guest xoá deadline', () => {
      expect(can('guest', 'delete_deadline')).toBe(false);
    });

    it('Từ chối user sinh viên xoá deadline', () => {
      expect(can('user', 'delete_deadline')).toBe(false);
    });

    it('Cho phép admin xoá deadline', () => {
      expect(can('admin', 'delete_deadline')).toBe(true);
    });
  });

  describe('Bảo toàn cấu trúc ma trận PERMISSION_MATRIX', () => {
    it('Chỉ chứa 4 hành động chuẩn theo đặc tả bài toán', () => {
      const actions: Action[] = ['view_deadline', 'mark_completed', 'add_deadline', 'delete_deadline'];
      expect(Object.keys(PERMISSION_MATRIX).sort()).toEqual(actions.sort());
    });
  });
});
