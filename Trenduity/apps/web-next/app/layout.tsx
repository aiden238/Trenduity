export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </body>
    </html>
  );
}
