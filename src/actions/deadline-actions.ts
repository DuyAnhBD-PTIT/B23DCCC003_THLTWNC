"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { can } from "@/lib/permissions";
import {
  toggleDeadlineCompletion,
  addDeadlineRecord,
  deleteDeadlineRecord,
  getDeadlineById,
} from "@/lib/storage";
import { createDeadlineSchema, ActionResult } from "@/lib/validations";
import { Role, DeadlinePriority } from "@/types";

/**
 * Server Action: Đánh dấu hoàn thành / chưa hoàn thành deadline
 * Bảo vệ 2 lớp: Kiểm tra Session + hàm can(role, 'mark_completed')
 */
export async function toggleDeadlineAction(
  deadlineId: string,
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user?.role as Role) || "guest";
    const userEmail = session?.user?.email;

    // 1. Kiểm tra quyền thực hiện
    if (!session || !userEmail || !can(userRole, "mark_completed")) {
      return {
        success: false,
        error:
          "Bạn không có quyền đánh dấu deadline. Vui lòng đăng nhập với tài khoản hợp lệ.",
      };
    }

    // 2. Kiểm tra sự tồn tại của deadline
    const deadline = getDeadlineById(deadlineId);
    if (!deadline) {
      return {
        success: false,
        error: "Deadline không tồn tại trên hệ thống.",
      };
    }

    // 3. Thực hiện thay đổi trạng thái
    const updated = toggleDeadlineCompletion(deadlineId, userEmail);
    if (!updated) {
      return {
        success: false,
        error: "Có lỗi xảy ra khi cập nhật trạng thái deadline.",
      };
    }

    // 4. Revalidate cache của các route liên quan
    revalidatePath("/deadlines");
    revalidatePath(`/deadlines/${deadlineId}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/completed");
    revalidatePath("/dashboard/stats");
    revalidatePath("/admin");
    revalidatePath("/");

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("Error in toggleDeadlineAction:", error);
    return {
      success: false,
      error: "Lỗi máy chủ khi xử lý yêu cầu.",
    };
  }
}

/**
 * Server Action: Thêm deadline mới
 * Bảo vệ 2 lớp: Kiểm tra role admin + can(role, 'add_deadline') + Zod validate
 */
export async function addDeadlineAction(
  rawInput: unknown,
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user?.role as Role) || "guest";

    // 1. Kiểm tra quyền Admin
    if (!can(userRole, "add_deadline")) {
      return {
        success: false,
        error: "Chỉ Lớp trưởng  mới có quyền thêm deadline mới.",
      };
    }

    // 2. Validate dữ liệu đầu vào bằng Zod
    const validationResult = createDeadlineSchema.safeParse(rawInput);
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      return {
        success: false,
        error:
          "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường thông tin.",
        fieldErrors,
      };
    }

    const validData = validationResult.data;

    // 3. Lưu vào cơ sở dữ liệu
    const newDeadline = addDeadlineRecord(
      {
        title: validData.title,
        subjectSlug: validData.subjectSlug,
        description: validData.description,
        dueDate: validData.dueDate,
        priority: validData.priority as DeadlinePriority,
      },
      session?.user?.email || "admin@ptit.edu.vn",
    );

    // 4. Làm mới ngay lập tức (On-demand ISR revalidation) cho các trang
    revalidatePath("/");
    revalidatePath("/deadlines");
    revalidatePath(`/deadlines/${newDeadline.id}`);
    revalidatePath(`/subjects/${validData.subjectSlug}`);
    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return {
      success: true,
      data: newDeadline,
    };
  } catch (error) {
    console.error("Error in addDeadlineAction:", error);
    return {
      success: false,
      error: "Lỗi máy chủ khi thêm deadline.",
    };
  }
}

/**
 * Server Action alias: createDeadlineAction
 */
export async function createDeadlineAction(
  rawInput: unknown,
): Promise<ActionResult> {
  return addDeadlineAction(rawInput);
}

/**
 * Server Action: Xoá deadline
 * Bảo vệ 2 lớp: Kiểm tra role admin + can(role, 'delete_deadline')
 */
export async function deleteDeadlineAction(
  deadlineId: string,
): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user?.role as Role) || "guest";

    // 1. Kiểm tra quyền Admin
    if (!can(userRole, "delete_deadline")) {
      return {
        success: false,
        error: "Chỉ Lớp trưởng  mới có quyền xoá deadline.",
      };
    }

    // 2. Kiểm tra tồn tại
    const deadline = getDeadlineById(deadlineId);
    if (!deadline) {
      return {
        success: false,
        error: "Deadline không tồn tại hoặc đã bị xoá trước đó.",
      };
    }

    // 3. Thực hiện xoá
    const deleted = deleteDeadlineRecord(deadlineId);
    if (!deleted) {
      return {
        success: false,
        error: "Không thể xoá deadline khỏi hệ thống.",
      };
    }

    // 4. Làm mới ngay lập tức (On-demand ISR revalidation) cho các trang
    revalidatePath("/");
    revalidatePath("/deadlines");
    revalidatePath(`/deadlines/${deadlineId}`);
    revalidatePath(`/subjects/${deadline.subjectSlug}`);
    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return {
      success: true,
      data: { id: deadlineId },
    };
  } catch (error) {
    console.error("Error in deleteDeadlineAction:", error);
    return {
      success: false,
      error: "Lỗi máy chủ khi xoá deadline.",
    };
  }
}
