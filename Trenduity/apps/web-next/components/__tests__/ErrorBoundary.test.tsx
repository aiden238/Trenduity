/**
 * ErrorBoundary 컴포넌트 테스트
 */

import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// 에러를 발생시키는 테스트 컴포넌트
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>정상 렌더링</div>;
}

// console.error 모킹 (테스트 출력 정리)
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  // 정상 렌더링 테스트
  it('에러가 없으면 children을 정상 렌더링한다', () => {
    render(
      <ErrorBoundary>
        <div>테스트 내용</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('테스트 내용')).toBeInTheDocument();
  });

  // 에러 캐치 테스트
  it('에러가 발생하면 폴백 UI를 표시한다', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
  });

  // 개발 환경 에러 메시지
  it('개발 환경에서는 에러 메시지를 표시한다', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test error')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalNodeEnv;
  });

  // 프로덕션 환경 일반 메시지
  it('프로덕션 환경에서는 일반적인 에러 메시지를 표시한다', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/페이지를 불러오는 중 문제가 발생했습니다/)).toBeInTheDocument();
    
    process.env.NODE_ENV = originalNodeEnv;
  });

  // 커스텀 폴백 UI
  it('fallback prop이 제공되면 커스텀 폴백을 표시한다', () => {
    render(
      <ErrorBoundary fallback={<div>커스텀 에러 UI</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('커스텀 에러 UI')).toBeInTheDocument();
  });

  // onError 콜백
  it('에러 발생 시 onError 콜백을 호출한다', () => {
    const onError = jest.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });

  // 재시도 기능은 ErrorState 컴포넌트에서 테스트되므로 생략
  // (ErrorBoundary는 handleReset 메서드만 제공)

  // 여러 자식 컴포넌트
  it('여러 자식 컴포넌트를 렌더링할 수 있다', () => {
    render(
      <ErrorBoundary>
        <div>첫 번째</div>
        <div>두 번째</div>
        <div>세 번째</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('첫 번째')).toBeInTheDocument();
    expect(screen.getByText('두 번째')).toBeInTheDocument();
    expect(screen.getByText('세 번째')).toBeInTheDocument();
  });

  // 중첩된 ErrorBoundary
  it('중첩된 ErrorBoundary는 가장 가까운 것이 에러를 잡는다', () => {
    render(
      <ErrorBoundary fallback={<div>외부 에러</div>}>
        <ErrorBoundary fallback={<div>내부 에러</div>}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('내부 에러')).toBeInTheDocument();
    expect(screen.queryByText('외부 에러')).not.toBeInTheDocument();
  });
});
