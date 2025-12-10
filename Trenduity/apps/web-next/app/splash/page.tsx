'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 프로그레스 바 애니메이션
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // 2초 후 로그인 페이지로 이동
    const timer = setTimeout(() => {
      router.push('/auth/login');
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex flex-col items-center justify-center p-4">
      {/* 로고 */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="text-9xl mb-6 animate-bounce-slow">🎓</div>
        <h1 className="text-7xl font-bold text-white mb-4 tracking-tight">
          Trenduity
        </h1>
        <p className="text-3xl text-white/90 font-medium">
          50-70대를 위한 디지털 학습
        </p>
      </div>

      {/* 프로그레스 바 */}
      <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mt-12">
        <div 
          className="h-full bg-white rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 로딩 텍스트 */}
      <p className="text-white/80 text-xl mt-6 animate-pulse">
        앱을 준비하고 있어요...
      </p>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
