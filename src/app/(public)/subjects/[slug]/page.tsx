import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getAllSubjects,
  getSubjectBySlug,
  getDeadlinesBySubject,
} from "@/lib/storage";
import TaskBoardView from "@/components/deadlines/TaskBoardView";

interface SubjectPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const subjects = getAllSubjects();
  return subjects.map((subject) => ({
    slug: subject.slug,
  }));
}

export async function generateMetadata({
  params,
}: SubjectPageProps): Promise<Metadata> {
  const subject = getSubjectBySlug(params.slug);
  if (!subject) {
    return {
      title: "Không tìm thấy môn học",
    };
  }

  return {
    title: `${subject.name} (${subject.code}) - Môn học`,
    description: `Danh sách bài tập và hạn nộp deadline môn ${subject.name} do ${subject.teacher} phụ trách.`,
    openGraph: {
      title: `${subject.name} (${subject.code}) | Class Deadline Hub`,
      description: subject.description,
    },
  };
}

export default async function SubjectDetailPage({ params }: SubjectPageProps) {
  const subject = getSubjectBySlug(params.slug);

  if (!subject) {
    notFound();
  }

  const allSubjects = getAllSubjects();
  const deadlines = getDeadlinesBySubject(subject.slug);

  return (
    <TaskBoardView
      initialDeadlines={deadlines}
      subjects={allSubjects}
      currentSubject={subject}
      pageTitle={`${subject.name} (${subject.code})`}
      pageSubtitle={`Giảng viên phụ trách: ${subject.teacher} • ${subject.credits} tín chỉ. ${subject.description}`}
    />
  );
}
