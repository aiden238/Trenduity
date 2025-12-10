'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  // 이메일/비밀번호 로그인
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('이메일을 입력해 주세요.');
      return;
    }
    if (!password.trim()) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }
    if (!email.includes('@')) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        router.push('/senior');
      }
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 소셜 로그인
  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    setSocialLoading(provider);
    setError('');

    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: provider === 'google' ? {
            access_type: 'offline',
            prompt: 'consent',
          } : undefined,
        },
      });

      if (signInError) throw signInError;
      
      // OAuth는 자동으로 리다이렉트되므로 로딩 상태 유지
    } catch (err: any) {
      console.error('소셜 로그인 오류:', err);
      setError(err.message || '소셜 로그인에 실패했습니다.');
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* 로고 및 타이틀 */}
        <div className="text-center mb-10">
          <div className="text-8xl mb-4">🎓</div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Trenduity</h1>
          <p className="text-2xl text-gray-600">
            50-70대를 위한 디지털 학습
          </p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            로그인
          </h2>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-6">
              <p className="text-xl text-red-700 text-center font-semibold">
                ⚠️ {error}
              </p>
            </div>
          )}

          {/* 소셜 로그인 버튼 */}
          <div className="space-y-4 mb-8">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={socialLoading !== null}
              className="w-full bg-white border-3 border-gray-300 hover:border-blue-500 text-gray-900 py-6 px-8 rounded-2xl text-2xl font-bold transition-all shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-4"
            >
              {socialLoading === 'google' ? (
                <span className="animate-spin text-3xl">⏳</span>
              ) : (
                <>
                  <span className="text-4xl">🔵</span>
                  <span>Google로 시작하기</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleSocialLogin('kakao')}
              disabled={socialLoading !== null}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-6 px-8 rounded-2xl text-2xl font-bold transition-all shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-4"
            >
              {socialLoading === 'kakao' ? (
                <span className="animate-spin text-3xl">⏳</span>
              ) : (
                <>
                  <span className="text-4xl">💬</span>
                  <span>카카오로 시작하기</span>
                </>
              )}
            </button>
          </div>

          {/* 구분선 */}
          <div className="flex items-center my-8">
            <div className="flex-1 border-t-2 border-gray-300"></div>
            <span className="px-6 text-xl text-gray-500 font-semibold">또는</span>
            <div className="flex-1 border-t-2 border-gray-300"></div>
          </div>

          {/* 이메일 로그인 폼 */}
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label className="block text-2xl font-bold text-gray-900 mb-3">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-6 py-5 text-2xl border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition-all"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-2xl font-bold text-gray-900 mb-3">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-6 py-5 text-2xl border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition-all"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-2xl text-2xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-3">
                  <span className="animate-spin text-3xl">⏳</span>
                  <span>로그인 중...</span>
                </span>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          {/* 비밀번호 찾기 / 회원가입 */}
          <div className="mt-8 pt-8 border-t-2 border-gray-200">
            <div className="flex flex-col space-y-4 text-center">
              <button className="text-xl text-gray-600 hover:text-blue-600 font-semibold transition-colors">
                비밀번호를 잊으셨나요?
              </button>
              <div className="flex items-center justify-center space-x-3 text-xl">
                <span className="text-gray-600">계정이 없으신가요?</span>
                <Link
                  href="/auth/signup"
                  className="text-blue-600 hover:text-blue-700 font-bold underline"
                >
                  회원가입
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 약관 링크 */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-lg text-gray-600">
            로그인하면{' '}
            <Link href="/legal/terms" className="text-blue-600 underline">
              서비스 이용약관
            </Link>
            {' '}및{' '}
            <Link href="/legal/privacy" className="text-blue-600 underline">
              개인정보 처리방침
            </Link>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
