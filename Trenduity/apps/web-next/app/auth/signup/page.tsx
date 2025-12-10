'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState({
    terms: false,
    privacy: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!formData.name.trim()) {
      setError('이름을 입력해 주세요.');
      return;
    }
    if (!formData.email.trim()) {
      setError('이메일을 입력해 주세요.');
      return;
    }
    if (!formData.email.includes('@')) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }
    if (!formData.password.trim()) {
      setError('비밀번호를 입력해 주세요.');
      return;
    }
    if (formData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!agreed.terms || !agreed.privacy) {
      setError('필수 약관에 동의해 주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        alert('회원가입이 완료되었습니다! 이메일을 확인해주세요.');
        router.push('/auth/login');
      }
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    setSocialLoading(provider);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signInError) throw signInError;
    } catch (err: any) {
      setError(err.message || '소셜 로그인에 실패했습니다.');
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* 로고 및 타이틀 */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-3">🎓</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">회원가입</h1>
          <p className="text-xl text-gray-600">
            Trenduity와 함께 배움을 시작하세요
          </p>
        </div>

        {/* 회원가입 카드 */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 mb-6">
              <p className="text-xl text-red-700 text-center font-semibold">
                ⚠️ {error}
              </p>
            </div>
          )}

          {/* 소셜 회원가입 */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={socialLoading !== null}
              className="w-full bg-white border-3 border-gray-300 hover:border-blue-500 text-gray-900 py-5 px-6 rounded-2xl text-xl font-bold transition-all shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {socialLoading === 'google' ? (
                <span className="animate-spin text-2xl">⏳</span>
              ) : (
                <>
                  <span className="text-3xl">🔵</span>
                  <span>Google로 가입하기</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleSocialLogin('kakao')}
              disabled={socialLoading !== null}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-5 px-6 rounded-2xl text-xl font-bold transition-all shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
              {socialLoading === 'kakao' ? (
                <span className="animate-spin text-2xl">⏳</span>
              ) : (
                <>
                  <span className="text-3xl">💬</span>
                  <span>카카오로 가입하기</span>
                </>
              )}
            </button>
          </div>

          {/* 구분선 */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t-2 border-gray-300"></div>
            <span className="px-4 text-lg text-gray-500 font-semibold">또는</span>
            <div className="flex-1 border-t-2 border-gray-300"></div>
          </div>

          {/* 이메일 회원가입 폼 */}
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-xl font-bold text-gray-900 mb-2">
                이름
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="홍길동"
                className="w-full px-5 py-4 text-xl border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition-all"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xl font-bold text-gray-900 mb-2">
                이메일
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="w-full px-5 py-4 text-xl border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition-all"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xl font-bold text-gray-900 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="6자 이상 입력"
                className="w-full px-5 py-4 text-xl border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition-all"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xl font-bold text-gray-900 mb-2">
                비밀번호 확인
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호 재입력"
                className="w-full px-5 py-4 text-xl border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition-all"
                disabled={isLoading}
              />
            </div>

            {/* 약관 동의 */}
            <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed.terms}
                  onChange={(e) => setAgreed({ ...agreed, terms: e.target.checked })}
                  className="mt-1 w-6 h-6 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="text-lg text-gray-800">
                  <Link href="/legal/terms" className="text-blue-600 underline font-semibold">
                    서비스 이용약관
                  </Link>
                  에 동의합니다 (필수)
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed.privacy}
                  onChange={(e) => setAgreed({ ...agreed, privacy: e.target.checked })}
                  className="mt-1 w-6 h-6 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="text-lg text-gray-800">
                  <Link href="/legal/privacy" className="text-blue-600 underline font-semibold">
                    개인정보 처리방침
                  </Link>
                  에 동의합니다 (필수)
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl text-2xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-3">
                  <span className="animate-spin text-3xl">⏳</span>
                  <span>가입 중...</span>
                </span>
              ) : (
                '회원가입'
              )}
            </button>
          </form>

          {/* 로그인 링크 */}
          <div className="mt-6 pt-6 border-t-2 border-gray-200 text-center">
            <div className="flex items-center justify-center space-x-3 text-xl">
              <span className="text-gray-600">이미 계정이 있으신가요?</span>
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-700 font-bold underline"
              >
                로그인
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
