import React from "react";
import AppDashboardShell from "@/components/layout/AppDashboardShell";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppDashboardShell>{children}</AppDashboardShell>;
}
