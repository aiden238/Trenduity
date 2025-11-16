import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '시니어학습앱 - 가족 대시보드',
  description: '50-70대를 위한 AI 학습 플랫폼 관리 콘솔',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-gray-900">
                시니어학습앱 관리
              </h1>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
