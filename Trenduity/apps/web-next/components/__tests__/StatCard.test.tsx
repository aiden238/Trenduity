/**
 * StatCard 컴포넌트 테스트
 */

import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/StatCard';

describe('StatCard', () => {
  // 기본 렌더링 테스트
  it('기본 props로 정상 렌더링된다', () => {
    render(
      <StatCard
        icon="👥"
        value={42}
        label="테스트 라벨"
      />
    );
    
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('테스트 라벨')).toBeInTheDocument();
    expect(screen.getByText('👥')).toBeInTheDocument();
  });

  // 단위 표시 테스트
  it('unit prop이 제공되면 단위를 표시한다', () => {
    render(
      <StatCard
        icon="📊"
        value={100}
        label="데이터"
        unit="개"
      />
    );
    
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('개')).toBeInTheDocument();
  });

  // 추가 정보 표시 테스트
  it('info prop이 제공되면 정보를 표시한다', () => {
    render(
      <StatCard
        icon="⭐"
        value={50}
        label="점수"
        info="24시간 이내"
      />
    );
    
    expect(screen.getByText('24시간 이내')).toBeInTheDocument();
  });

  // 문자열 값 테스트
  it('value가 문자열이어도 정상 렌더링된다', () => {
    render(
      <StatCard
        icon="🔥"
        value="높음"
        label="활동도"
      />
    );
    
    expect(screen.getByText('높음')).toBeInTheDocument();
  });

  // React 노드 아이콘 테스트
  it('icon prop에 React 노드를 전달할 수 있다', () => {
    render(
      <StatCard
        icon={<svg data-testid="custom-icon" />}
        value={10}
        label="커스텀"
      />
    );
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  // aria-label 접근성 테스트
  it('적절한 aria-label을 가진다', () => {
    render(
      <StatCard
        icon="👥"
        value={25}
        label="활동 중"
        unit="명"
      />
    );
    
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label', '활동 중: 25명');
  });

  // 그라디언트 커스터마이징 테스트
  it('gradient prop으로 배경색을 커스터마이징할 수 있다', () => {
    render(
      <StatCard
        icon="🎨"
        value={5}
        label="색상"
        gradient="from-purple-700 to-purple-800"
      />
    );
    
    const card = screen.getByRole('article');
    expect(card).toHaveClass('from-purple-700');
    expect(card).toHaveClass('to-purple-800');
  });

  // 포커스 가능 테스트
  it('키보드로 포커스할 수 있다', () => {
    render(
      <StatCard
        icon="🔑"
        value={1}
        label="포커스"
      />
    );
    
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  // 스냅샷 테스트
  it('전체 props로 렌더링 시 스냅샷과 일치한다', () => {
    const { container } = render(
      <StatCard
        icon="⭐"
        value={999}
        label="총 포인트"
        unit="점"
        gradient="from-yellow-700 to-amber-800"
        info="이번 달"
      />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });
});
