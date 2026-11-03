import React from "react";
import { Metadata } from "next";
import { getAllDeadlines, getAllSubjects } from "@/lib/storage";
import TaskBoardView from "@/components/deadlines/TaskBoardView";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Danh sách Deadline Lớp học - Cập nhật liên tục",
  description:
    "Xem danh sách đầy đủ tất cả deadline, bài tập lớn, đồ án và lịch kiểm tra của lớp sinh viên PTIT.",
  openGraph: {
    title: "Danh sách Deadline Lớp học PTIT",
    description: "Theo dõi hạn nộp bài tập và đồ án không lo trễ hẹn.",
  },
};

export default async function DeadlinesPage() {
  const allDeadlines = getAllDeadlines();
  const subjects = getAllSubjects();

  return (
    <TaskBoardView
      initialDeadlines={allDeadlines}
      subjects={subjects}
      pageTitle="Bảng Quản Lý Deadline Học Phần"
      pageSubtitle="Theo dõi bài tập lớn, đồ án và tiểu luận các học phần PTIT theo tiến độ thời gian thực."
    />
  );
}
