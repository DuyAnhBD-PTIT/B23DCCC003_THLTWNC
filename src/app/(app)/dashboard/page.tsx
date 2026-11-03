import React from "react";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAllDeadlines, getAllSubjects } from "@/lib/storage";
import TaskBoardView from "@/components/deadlines/TaskBoardView";

// Chiến lược: SSR (Server-Side Rendering)
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bảng điều khiển cá nhân",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const user = session.user;
  const allDeadlines = getAllDeadlines();
  const subjects = getAllSubjects();

  const userEmail = user.email;
  const completedDeadlines = allDeadlines.filter((d) =>
    d.completedBy.includes(userEmail)
  );
  const pendingDeadlines = allDeadlines.filter(
    (d) => !d.completedBy.includes(userEmail)
  );

  return (
    <TaskBoardView
      initialDeadlines={allDeadlines}
      subjects={subjects}
      pageTitle={`Xin chào, ${user.name}`}
      pageSubtitle={`Tài khoản: ${user.email} • Đã hoàn thành ${completedDeadlines.length}/${allDeadlines.length} bài tập môn học.`}
    />
  );
}
