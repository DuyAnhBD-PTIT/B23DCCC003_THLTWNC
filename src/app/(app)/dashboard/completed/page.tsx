import React from 'react';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getAllDeadlines, getAllSubjects } from '@/lib/storage';
import TaskBoardView from '@/components/deadlines/TaskBoardView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Deadline đã hoàn thành',
  robots: {
    index: false,
    follow: false
  }
};

export default async function CompletedDeadlinesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/completed');
  }

  const userEmail = session.user.email;
  const allDeadlines = getAllDeadlines();
  const subjects = getAllSubjects();
  const completedList = allDeadlines.filter((d) => d.completedBy.includes(userEmail));

  return (
    <TaskBoardView
      initialDeadlines={completedList}
      subjects={subjects}
      pageTitle="Deadline Đã Hoàn Thành"
      pageSubtitle={`Bạn đã hoàn thành ${completedList.length} bài tập môn học. Tiếp tục phát huy nhé!`}
    />
  );
}
