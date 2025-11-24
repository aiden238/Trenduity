/**
 * EmptyState 컴포넌트 테스트
 */

import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/EmptyState';

describe('EmptyState', () => {
  // 기본 렌더링 테스트
  it('title prop으로 정상 렌더링된다', () => {
    render(<EmptyState title="데이터가 없습니다" />);
    
    expect(screen.getByText('데이터가 없습니다')).toBeInTheDocument();
  });

  // 기본 아이콘
  it('icon prop이 없으면 기본 아이콘(📭)을 표시한다', () => {
    render(<EmptyState title="빈 상태" />);
    
    expect(screen.getByText('📭')).toBeInTheDocument();
  });

  // 커스텀 아이콘
  it('icon prop으로 아이콘을 커스터마이징할 수 있다', () => {
    render(<EmptyState icon="🎉" title="축하합니다" />);
    
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });

  // 설명 표시
  it('description prop이 제공되면 설명을 표시한다', () => {
    render(
      <EmptyState
        title="결과 없음"
        description="검색 조건을 변경해 보세요"
      />
    );
    
    expect(screen.getByText('검색 조건을 변경해 보세요')).toBeInTheDocument();
  });

  // 설명 미표시
  it('description prop이 없으면 설명을 표시하지 않는다', () => {
    const { container } = render(<EmptyState title="빈 상태" />);
    
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(0);
  });

  // 접근성 - role과 aria-label
  it('적절한 role과 aria-label을 가진다', () => {
    render(<EmptyState title="데이터 없음" />);
    
    const emptyState = screen.getByRole('status');
    expect(emptyState).toHaveAttribute('aria-label', '빈 상태: 데이터 없음');
  });

  // 아이콘 aria-hidden
  it('아이콘이 aria-hidden="true"를 가진다', () => {
    const { container } = render(<EmptyState icon="🔍" title="검색 결과 없음" />);
    
    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveTextContent('🔍');
  });

  // 커스텀 className
  it('커스텀 className을 적용할 수 있다', () => {
    render(
      <EmptyState
        title="빈 상태"
        className="my-custom-class"
      />
    );
    
    const emptyState = screen.getByRole('status');
    expect(emptyState).toHaveClass('my-custom-class');
  });

  // 스타일 클래스
  it('기본 스타일 클래스를 가진다', () => {
    render(<EmptyState title="빈 상태" />);
    
    const emptyState = screen.getByRole('status');
    expect(emptyState).toHaveClass('flex');
    expect(emptyState).toHaveClass('flex-col');
    expect(emptyState).toHaveClass('items-center');
    expect(emptyState).toHaveClass('justify-center');
  });

  // 스냅샷 테스트
  it('전체 props로 렌더링 시 스냅샷과 일치한다', () => {
    const { container } = render(
      <EmptyState
        icon="👥"
        title="멤버가 없습니다"
        description="새로운 멤버를 초대해 보세요"
        className="custom-empty"
      />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });
});
