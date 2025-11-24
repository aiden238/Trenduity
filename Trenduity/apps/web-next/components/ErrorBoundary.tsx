/**
 * ErrorBoundary 컴포넌트
 * React 에러를 잡아서 폴백 UI 표시
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { ErrorState } from './ErrorState';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary 클래스 컴포넌트
 * 
 * React 18+에서 에러를 잡아서 폴백 UI 표시
 * Suspense와 함께 사용하여 로딩/에러 상태 관리
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 에러 발생 시 상태 업데이트
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 에러 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 커스텀 에러 핸들러 호출
    this.props.onError?.(error, errorInfo);

    // 프로덕션: 에러 리포팅 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      // TODO: Sentry, LogRocket 등으로 전송
      // reportErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 폴백 UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 폴백 UI
      return (
        <ErrorState
          title="문제가 발생했습니다"
          message={
            process.env.NODE_ENV === 'development'
              ? this.state.error?.message || '알 수 없는 오류'
              : '페이지를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'
          }
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * ErrorBoundary Hook 버전 (함수 컴포넌트용 래퍼)
 */
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

export function ErrorBoundaryWrapper({
  children,
  fallback,
  onError,
}: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary
      fallback={fallback}
      onError={(error) => onError?.(error)}
    >
      {children}
    </ErrorBoundary>
  );
}
