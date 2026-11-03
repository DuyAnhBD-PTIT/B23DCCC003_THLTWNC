'use client';

import React from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { SessionProvider } from 'next-auth/react';
import viVN from 'antd/locale/vi_VN';

export const THEME_CONFIG = {
  token: {
    colorPrimary: '#1677ff',
    colorWarning: '#d97706',
    colorSuccess: '#16a34a',
    colorError: '#dc2626',
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#ffffff',
    colorBorder: '#e5e7eb',
    colorBorderSecondary: '#f3f4f6',
    colorText: '#111827',
    colorTextSecondary: '#4b5563',
    colorTextTertiary: '#9ca3af',
    borderRadius: 8,
    fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 38,
      fontWeight: 500
    },
    Card: {
      borderRadiusLG: 12
    },
    Tag: {
      borderRadiusSM: 6
    },
    Input: {
      borderRadius: 8
    },
    Select: {
      borderRadius: 8
    }
  }
};

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AntdRegistry>
        <ConfigProvider theme={THEME_CONFIG} locale={viVN}>
          <AntdApp>{children}</AntdApp>
        </ConfigProvider>
      </AntdRegistry>
    </SessionProvider>
  );
}
