import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from 'react';
import { Alert, Linking, EmitterSubscription, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// ❌ expo-auth-session, expo-linking 네이티브 모듈 제거
// Expo Go에서는 React Native 내장 Linking만 사용

// Expo Go 호환 redirect URL 생성
const getRedirectUrl = (): string => {
  // Expo Go에서는 exp:// 스킴 사용
  // Development build에서는 커스텀 스킴 사용
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  
  if (debuggerHost) {
    // Expo Go: exp://192.168.x.x:8081/--/auth/callback
    const url = `exp://${debuggerHost}/--/auth/callback`;
    console.log('[AuthContext] 🔗 Generated redirect URL (Expo Go):', url);
    return url;
  }
  
  // Production/Development Build: 커스텀 스킴
  const url = 'trenduity://auth/callback';
  console.log('[AuthContext] 🔗 Generated redirect URL (Production):', url);
  return url;
};

// BFF API URL 설정 (우선순위: 환경변수 > app.json extra > localhost fallback)
const getBffUrl = (): string => {
  // 1. 환경변수에서 읽기 (권장)
  if (process.env.EXPO_PUBLIC_BFF_API_URL) {
    return process.env.EXPO_PUBLIC_BFF_API_URL;
  }
  // 2. app.json extra에서 읽기
  const extra = Constants.expoConfig?.extra;
  if (extra?.BFF_API_URL) {
    return extra.BFF_API_URL;
  }
  if (extra?.bffApiUrl) {
    return extra.bffApiUrl;
  }
  // 3. 개발 환경 fallback
  console.warn('[AuthContext] BFF URL not configured, using localhost');
  return 'http://localhost:8000';
};

const BFF_URL = getBffUrl();

// fetch with timeout helper
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number = 30000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('서버 연결 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.');
    }
    throw error;
  }
};

/**
 * 인증 상태 타입
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/**
 * 사용자 정보 타입
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  age_group?: '50s' | '60s' | '70s';
  interests?: string[];
  created_at: string;
}

/**
 * 소셜 로그인 프로바이더 타입
 */
export type SocialProvider = 'kakao' | 'naver' | 'google';

/**
 * Auth Context 타입
 */
interface AuthContextType {
  status: AuthStatus;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name?: string, phone?: string) => Promise<void>;
  socialLogin: (provider: SocialProvider) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isOnboardingComplete: boolean;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = '@trenduity/auth_token';
const USER_KEY = '@trenduity/user';
const ONBOARDING_KEY = '@trenduity/onboarding_complete';

// BFF 서버 웜업 (콜드 스타트 방지)
let bffWarmedUp = false;
const warmUpBff = async () => {
  if (bffWarmedUp) return;
  try {
    console.log('[AuthContext] 🔥 Warming up BFF server...');
    const start = Date.now();
    await fetch(`${BFF_URL}/health`, { method: 'GET' });
    console.log('[AuthContext] ✅ BFF ready in', Date.now() - start, 'ms');
    bffWarmedUp = true;
  } catch (error) {
    console.log('[AuthContext] ⚠️ BFF warmup failed (will retry on login)');
  }
};

/**
 * AuthProvider 컴포넌트
 * 
 * 로그인 상태 관리, 토큰 저장, 온보딩 완료 여부 추적
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // 초기 로드: 저장된 토큰과 사용자 정보 복원 + BFF 웜업
  useEffect(() => {
    loadStoredAuth();
    // 백그라운드에서 BFF 서버 웜업 (콜드 스타트 방지)
    warmUpBff();
  }, []);

  const loadStoredAuth = async () => {
    try {
      console.log('[AuthContext] 🔄 Loading stored auth...');
      const [token, storedUser, onboardingDone] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
        AsyncStorage.getItem(ONBOARDING_KEY),
      ]);

      console.log('[AuthContext] 📦 Stored data:', { 
        hasToken: !!token, 
        hasUser: !!storedUser, 
        onboarding: onboardingDone 
      });

      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        setStatus('authenticated');
        console.log('[AuthContext] ✅ User authenticated');
      } else {
        setStatus('unauthenticated');
        console.log('[AuthContext] ❌ No stored auth, showing login');
      }

      setIsOnboardingComplete(onboardingDone === 'true');
    } catch (error) {
      console.error('[AuthContext] ⚠️ Failed to load auth:', error);
      setStatus('unauthenticated');
    }
  };

  /**
   * 로그인
   */
  const login = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] 🔐 Attempting login to:', BFF_URL);
      const start = Date.now();

      // BFF가 아직 웜업되지 않았다면 먼저 웜업
      if (!bffWarmedUp) {
        console.log('[AuthContext] 🔥 BFF not warmed up, warming...');
        await warmUpBff();
      }

      const response = await fetchWithTimeout(`${BFF_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }, 15000); // 15초 타임아웃 (웜업 후이므로 빠름)

      console.log('[AuthContext] 📡 Response in', Date.now() - start, 'ms, status:', response.status);
      const result = await response.json();
      console.log('[AuthContext] 📦 Response:', { ok: result.ok, hasData: !!result.data });

      if (!result.ok) {
        // 401: 인증 실패 (잘못된 이메일/비밀번호)
        if (response.status === 401) {
          throw new Error('이메일 또는 비밀번호가 잘못되었습니다.');
        }
        throw new Error(result.error?.message || '로그인에 실패했습니다.');
      }

      const { token, user: userData } = result.data;

      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));

      setUser(userData);
      setStatus('authenticated');
      console.log('[AuthContext] ✅ Login successful in', Date.now() - start, 'ms');
    } catch (error: any) {
      console.error('[AuthContext] Login failed:', error);
      // 네트워크 에러 처리
      if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
        throw new Error('서버에 연결할 수 없습니다. 인터넷 연결을 확인해 주세요.');
      }
      // 타임아웃 에러
      if (error.message?.includes('시간이 초과')) {
        throw new Error('서버 응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.');
      }
      // 이미 Error 객체면 그대로 throw (메시지 보존)
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.');
    }
  };

  /**
   * 로그아웃
   */
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_KEY]);
      setUser(null);
      setStatus('unauthenticated');
    } catch (error) {
      console.error('[AuthContext] Logout failed:', error);
    }
  };

  /**
   * 회원가입
   */
  const signup = async (email: string, password: string, name?: string, phone?: string) => {
    try {
      console.log('[AuthContext] 📝 Attempting signup to:', BFF_URL);
      const startTime = Date.now();

      // BFF 웜업 안됐으면 먼저 웜업
      if (!bffWarmedUp) {
        console.log('[AuthContext] ⏳ BFF 웜업 중...');
        await warmUpBff();
      }

      const response = await fetchWithTimeout(`${BFF_URL}/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, phone }),
      }, 15000); // 웜업 후이므로 15초면 충분

      const elapsed = Date.now() - startTime;
      console.log(`[AuthContext] ✅ 회원가입 응답 ${elapsed}ms`);

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error?.message || '회원가입에 실패했습니다.');
      }

      const { token, user: userData } = result.data;

      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));

      setUser(userData);
      setStatus('authenticated');
    } catch (error: any) {
      console.error('[AuthContext] Signup failed:', error);
      if (error.name === 'AbortError') {
        throw new Error('서버 연결이 지연되고 있어요. 잠시 후 다시 시도해 주세요.');
      }
      throw new Error(error.message || '회원가입에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  /**
   * 소셜 로그인 (카카오/네이버/구글)
   * 
   * Expo Go 호환 방식: Linking.openURL + 딥링크 리스너
   * - 외부 브라우저로 OAuth 페이지 열기
   * - 인증 완료 후 앱으로 돌아올 때 URL에서 토큰 추출
   */
  const socialLogin = async (provider: SocialProvider) => {
    const providerNames: Record<SocialProvider, string> = {
      kakao: '카카오',
      naver: '네이버',
      google: 'Google',
    };

    // 딥링크 구독 참조 저장 (정리용)
    let linkingSubscription: EmitterSubscription | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    // 정리 함수
    const cleanup = () => {
      if (linkingSubscription) {
        linkingSubscription.remove();
        linkingSubscription = null;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    try {
      setStatus('loading');
      const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;

      if (!SUPABASE_URL) {
        throw new Error('Supabase URL이 설정되지 않았습니다.');
      }

      // Expo Go 호환 redirect URL (exp:// 스킴)
      const redirectUrl = getRedirectUrl();
      console.log('[AuthContext] 🔗 OAuth redirectUrl:', redirectUrl);
      console.log('[AuthContext] 🌐 BFF URL:', BFF_URL);

      if (provider === 'naver') {
        // 네이버는 직접 OAuth 처리 (Supabase 미지원)
        const NAVER_CLIENT_ID = process.env.EXPO_PUBLIC_NAVER_CLIENT_ID || '_mZ9tD58Sa64hAtj6ZCQ';
        const state = Math.random().toString(36).substring(7);
        
        const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?` +
          `response_type=code&` +
          `client_id=${NAVER_CLIENT_ID}&` +
          `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
          `state=${state}`;

        // 외부 브라우저로 열기
        const supported = await Linking.canOpenURL(naverAuthUrl);
        if (!supported) {
          throw new Error('브라우저를 열 수 없습니다.');
        }

        // 딥링크 리스너 설정 (새로운 API 방식)
        return new Promise((resolve, reject) => {
          const handleUrl = async (event: { url: string }) => {
            try {
              cleanup(); // 구독 정리
              
              console.log('[AuthContext] 📥 Naver redirect URL received:', event.url);
              const params = new URLSearchParams(event.url.split('?')[1]);
              const code = params.get('code');
              const returnedState = params.get('state');

              if (!code || returnedState !== state) {
                throw new Error('네이버 로그인 인증에 실패했습니다.');
              }

              // BFF로 code 전송
              const response = await fetchWithTimeout(`${BFF_URL}/v1/auth/social`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider: 'naver', code, state }),
              }, 30000);

              const res = await response.json();
              if (!res.ok) throw new Error(res.error?.message || '네이버 로그인에 실패했습니다.');

              const { token, user: userData, is_new_user } = res.data;
              await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
              await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));

              setUser(userData);
              setStatus('authenticated');

              if (is_new_user) {
                await AsyncStorage.removeItem(ONBOARDING_KEY);
                setIsOnboardingComplete(false);
              }

              resolve({ is_new_user });
            } catch (err) {
              setStatus('unauthenticated');
              reject(err);
            }
          };

          // 새로운 Linking API: addListener 사용 (React Native 0.65+)
          linkingSubscription = Linking.addEventListener('url', handleUrl);
          Linking.openURL(naverAuthUrl);

          // 타임아웃 (2분)
          timeoutId = setTimeout(() => {
            cleanup();
            setStatus('unauthenticated');
            reject(new Error('로그인 시간이 초과되었습니다.'));
          }, 120000);
        });
      }

      // 카카오/구글: Supabase OAuth 사용
      const providerMap: Record<SocialProvider, string> = {
        kakao: 'kakao',
        naver: 'naver',
        google: 'google',
      };

      const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=${providerMap[provider]}&redirect_to=${encodeURIComponent(redirectUrl)}`;
      console.log('[AuthContext] 🚀 Opening OAuth URL:', authUrl);

      // 외부 브라우저로 열기
      const supported = await Linking.canOpenURL(authUrl);
      if (!supported) {
        throw new Error('브라우저를 열 수 없습니다.');
      }

      // 딥링크 리스너 설정 (새로운 API 방식)
      return new Promise((resolve, reject) => {
        const handleUrl = async (event: { url: string }) => {
          try {
            cleanup(); // 구독 정리
            
            console.log('[AuthContext] 📥 OAuth redirect URL received:', event.url);
            const params = new URLSearchParams(event.url.split('#')[1] || event.url.split('?')[1]);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (!accessToken) {
              throw new Error('소셜 로그인 토큰을 받지 못했습니다.');
            }

            console.log('[AuthContext] 🎫 Token received, sending to BFF...');

            // BFF로 소셜 로그인 처리 요청 (60초 타임아웃 - Render 콜드스타트 대응)
            const response = await fetchWithTimeout(`${BFF_URL}/v1/auth/social`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ provider, access_token: accessToken, refresh_token: refreshToken }),
            }, 60000);

            const res = await response.json();
            if (!res.ok) throw new Error(res.error?.message || '소셜 로그인에 실패했습니다.');

            const { token, user: userData, is_new_user } = res.data;
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));

            setUser(userData);
            setStatus('authenticated');
            console.log('[AuthContext] ✅ Social login successful!');

            if (is_new_user) {
              await AsyncStorage.removeItem(ONBOARDING_KEY);
              setIsOnboardingComplete(false);
            }

            resolve({ is_new_user });
          } catch (err) {
            console.error('[AuthContext] ❌ Social login callback error:', err);
            setStatus('unauthenticated');
            reject(err);
          }
        };

        // 새로운 Linking API: addListener 사용 (React Native 0.65+)
        linkingSubscription = Linking.addEventListener('url', handleUrl);
        Linking.openURL(authUrl);

        // 타임아웃 (2분)
        timeoutId = setTimeout(() => {
          cleanup();
          setStatus('unauthenticated');
          reject(new Error('로그인 시간이 초과되었습니다.'));
        }, 120000);
      });
    } catch (error: any) {
      console.error(`[AuthContext] ${provider} login failed:`, error);
      setStatus('unauthenticated');
      
      // 사용자 친화적 에러 메시지
      Alert.alert(
        `${providerNames[provider]} 로그인 실패`,
        error.message || '다시 시도해 주세요.',
        [{ text: '확인' }]
      );
      throw error;
    }
  };

  /**
   * 프로필 업데이트 (온보딩에서 사용)
   */
  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

      const response = await fetchWithTimeout(`${BFF_URL}/v1/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      }, 30000);

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error?.message || '프로필 업데이트에 실패했습니다.');
      }

      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error: any) {
      console.error('[AuthContext] Update profile failed:', error);
      throw new Error(error.message || '프로필 업데이트에 실패했습니다.');
    }
  };

  /**
   * 온보딩 완료 처리
   */
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setIsOnboardingComplete(true);
    } catch (error) {
      console.error('[AuthContext] Complete onboarding failed:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        login,
        logout,
        signup,
        socialLogin,
        updateProfile,
        isOnboardingComplete,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth 훅
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
