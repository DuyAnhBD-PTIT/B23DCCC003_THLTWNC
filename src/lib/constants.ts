/**
 * Lấy URL gốc của ứng dụng:
 * - Ưu tiên NEXTAUTH_URL nếu được khai báo
 * - Nếu deploy trên Vercel, tự động nhận diện biến môi trường hệ thống VERCEL_URL hoặc VERCEL_PROJECT_PRODUCTION_URL
 * - Tự động bổ sung protocol https:// nếu người dùng chỉ nhập domain (ví dụ: deadlinehub-three.vercel.app)
 * - Fallback an toàn về localhost:3000 khi chạy môi trường cục bộ
 */
export function getBaseUrl(): string {
  let url =
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://localhost:3000';

  url = url.trim().replace(/\/$/, '');

  // Nếu chuỗi không chứa giao thức http:// hoặc https://, tự động thêm https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  return url;
}
