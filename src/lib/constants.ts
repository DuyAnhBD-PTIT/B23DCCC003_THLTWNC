/**
 * Lấy URL gốc của ứng dụng:
 * - Ưu tiên NEXTAUTH_URL nếu được khai báo
 * - Nếu deploy trên Vercel, tự động nhận diện biến môi trường hệ thống VERCEL_URL
 * - Fallback về localhost:3000 khi chạy môi trường cục bộ
 */
export function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}
