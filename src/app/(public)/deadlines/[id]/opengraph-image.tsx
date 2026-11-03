import { ImageResponse } from "next/og";
import { getDeadlineById } from "@/lib/storage";

export const runtime = "nodejs";
export const alt = "Class Deadline Hub Preview Image";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: { id: string } }) {
  const deadline = getDeadlineById(params.id);

  const title = deadline ? deadline.title : "Chi tiết Deadline Lớp học PTIT";
  const subjectName = deadline
    ? deadline.subjectName
    : "Học viện Công nghệ Bưu chính Viễn thông";
  const dueDate = deadline
    ? new Date(deadline.dueDate).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "--/--/----";
  const priority = deadline ? deadline.priority.toUpperCase() : "MEDIUM";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#ffffff",
        padding: "60px",
        fontFamily: "sans-serif",
        border: "12px solid #1677ff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "8px",
              backgroundColor: "#1677ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            PTIT
          </div>
          <div
            style={{ fontSize: "24px", fontWeight: "bold", color: "#1f2937" }}
          >
            Class Deadline Hub
          </div>
        </div>

        <div
          style={{
            padding: "8px 18px",
            borderRadius: "20px",
            backgroundColor: priority === "HIGH" ? "#fff1f0" : "#e6f4ff",
            color: priority === "HIGH" ? "#ff4d4f" : "#1677ff",
            border: `2px solid ${priority === "HIGH" ? "#ff4d4f" : "#1677ff"}`,
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          ƯU TIÊN: {priority}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            fontSize: "22px",
            color: "#1677ff",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          MÔN HỌC: {subjectName}
        </div>

        <div
          style={{
            fontSize: "44px",
            fontWeight: "800",
            color: "#111827",
            lineHeight: "1.2",
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "2px solid #f0f0f0",
          paddingTop: "24px",
        }}
      >
        <div style={{ fontSize: "22px", color: "#4b5563" }}>
          Hạn nộp chính thức:{" "}
          <span style={{ fontWeight: "bold", color: "#1f2937" }}>
            {dueDate}
          </span>
        </div>

        <div style={{ fontSize: "18px", color: "#6b7280" }}>
          class-deadline-hub.ptit.edu.vn
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
