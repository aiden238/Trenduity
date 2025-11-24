/**
 * Spinner 컴포넌트 테스트
 */

import { render, screen } from '@testing-library/react';
import { Spinner } from '@/components/Spinner';

describe('Spinner', () => {
  // 기본 렌더링 테스트
  it('기본 props로 정상 렌더링된다', () => {
    render(<Spinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', '로딩 중');
  });

  // 크기 - large (기본값)
  it('size가 large일 때 큰 스피너를 렌더링한다', () => {
    render(<Spinner size="large" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-12');
    expect(spinner).toHaveClass('h-12');
    expect(spinner).toHaveClass('border-4');
  });

  // 크기 - small
  it('size가 small일 때 작은 스피너를 렌더링한다', () => {
    render(<Spinner size="small" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-6');
    expect(spinner).toHaveClass('h-6');
    expect(spinner).toHaveClass('border-2');
  });

  // 커스텀 className
  it('커스텀 className을 적용할 수 있다', () => {
    const { container } = render(<Spinner className="my-custom-class" />);
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('my-custom-class');
  });

  // 애니메이션 클래스
  it('animate-spin 클래스를 가진다', () => {
    render(<Spinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('animate-spin');
  });

  // 접근성 - role과 aria-label
  it('적절한 role과 aria-label을 가진다', () => {
    render(<Spinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', '로딩 중');
  });

  // 스냅샷 테스트
  it('렌더링 결과가 스냅샷과 일치한다', () => {
    const { container } = render(<Spinner size="large" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
