import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div style={{ minHeight: "100%" }}>{children}</div>;
}
