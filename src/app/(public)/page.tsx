import React from "react";
import { getAllDeadlines, getAllSubjects } from "@/lib/storage";
import TaskBoardView from "@/components/deadlines/TaskBoardView";

export default async function HomePage() {
  const allDeadlines = getAllDeadlines();
  const subjects = getAllSubjects();

  return (
    <TaskBoardView
      initialDeadlines={allDeadlines}
      subjects={subjects}
      pageTitle="Bảng Quản Lý Deadline & Bài Tập"
      pageSubtitle="Theo dõi bài tập lớn, đồ án và tiểu luận các học phần PTIT theo tiến độ thời gian thực."
    />
  );
}
