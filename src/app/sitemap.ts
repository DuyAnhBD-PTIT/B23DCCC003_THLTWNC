import { MetadataRoute } from "next";
import { getAllDeadlines, getAllSubjects } from "@/lib/storage";
import { getBaseUrl } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const deadlines = getAllDeadlines();
  const subjects = getAllSubjects();

  // 1. Các trang tĩnh cố định
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/deadlines`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  // 2. Trang chi tiết các môn học (SSG)
  const subjectRoutes: MetadataRoute.Sitemap = subjects.map((subject) => ({
    url: `${baseUrl}/subjects/${subject.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. Trang chi tiết tất cả các Deadline
  const deadlineRoutes: MetadataRoute.Sitemap = deadlines.map((item) => ({
    url: `${baseUrl}/deadlines/${item.id}`,
    lastModified: new Date(item.createdAt || new Date()),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticRoutes, ...subjectRoutes, ...deadlineRoutes];
}
