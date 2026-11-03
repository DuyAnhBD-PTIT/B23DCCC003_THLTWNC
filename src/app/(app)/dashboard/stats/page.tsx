import React from 'react';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getAllDeadlines, getAllSubjects } from '@/lib/storage';
import { Row, Col, Card, Progress, Tag, Space } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Thống kê tiến độ học tập',
  robots: {
    index: false,
    follow: false
  }
};

export default async function StatsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/stats');
  }

  const userEmail = session.user.email;
  const allDeadlines = getAllDeadlines();
  const subjects = getAllSubjects();

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ marginBottom: 24 }}>
        <Space size={8} style={{ marginBottom: 4 }}>
          <Tag color="blue" icon={<BarChartOutlined />}>
            Báo cáo tiến độ
          </Tag>
        </Space>
        <h1 style={{ margin: '4px 0', fontSize: 24, fontWeight: 700, color: '#1f2937' }}>
          Thống kê tiến độ theo Môn học
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>
          Tỷ lệ hoàn thành các bài tập và đồ án trên từng môn học trong kỳ
        </p>
      </div>

      <Row gutter={[20, 20]}>
        {subjects.map((sub) => {
          const subDeadlines = allDeadlines.filter((d) => d.subjectSlug === sub.slug);
          const completedCount = subDeadlines.filter((d) => d.completedBy.includes(userEmail)).length;
          const totalCount = subDeadlines.length;
          const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <Col xs={24} md={12} key={sub.id}>
              <Card
                className="minimal-card"
                style={{ borderRadius: 10, backgroundColor: '#ffffff' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Tag color="blue" style={{ marginBottom: 6 }}>
                      {sub.code}
                    </Tag>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
                      {sub.name}
                    </h2>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>
                      GV: {sub.teacher}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: 18, color: percent === 100 ? '#52c41a' : '#1677ff' }}>
                      {completedCount}/{totalCount}
                    </strong>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>đã xong</div>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <Progress
                    percent={percent}
                    strokeColor={percent === 100 ? '#52c41a' : '#1677ff'}
                    status={percent === 100 ? 'success' : 'active'}
                  />
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
