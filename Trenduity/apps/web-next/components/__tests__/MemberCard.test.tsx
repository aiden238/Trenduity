/**
 * MemberCard 컴포넌트 테스트
 */

import { render, screen } from '@testing-library/react';
import { MemberCard } from '@/components/MemberCard';

// next/link 모킹은 jest.setup.js에서 처리됨

describe('MemberCard', () => {
  // 기본 props
  const defaultProps = {
    userId: 'user-123',
    name: '홍길동',
    lastActivity: new Date().toISOString(),
  };

  // 기본 렌더링 테스트
  it('기본 props로 정상 렌더링된다', () => {
    render(<MemberCard {...defaultProps} />);
    
    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('자세히 보기')).toBeInTheDocument();
  });

  // 링크 테스트
  it('멤버 상세 페이지로 링크된다', () => {
    render(<MemberCard {...defaultProps} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/members/user-123');
  });

  // 활동 상태 - 활성
  it('24시간 이내 활동 시 "활동 중" 배지를 표시한다', () => {
    const recentActivity = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(); // 12시간 전
    
    render(
      <MemberCard
        {...defaultProps}
        lastActivity={recentActivity}
      />
    );
    
    expect(screen.getByText('활동 중')).toBeInTheDocument();
  });

  // 활동 상태 - 비활성
  it('24시간 이상 활동 없으면 "대기" 배지를 표시한다', () => {
    const oldActivity = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(); // 48시간 전
    
    render(
      <MemberCard
        {...defaultProps}
        lastActivity={oldActivity}
      />
    );
    
    expect(screen.getByText('대기')).toBeInTheDocument();
  });

  // 활동 시간 포맷 - 시간 단위
  it('마지막 활동 시간을 "시간 전" 형식으로 표시한다', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    
    render(
      <MemberCard
        {...defaultProps}
        lastActivity={threeHoursAgo}
      />
    );
    
    expect(screen.getByText('3시간 전')).toBeInTheDocument();
  });

  // 활동 시간 포맷 - 일 단위
  it('마지막 활동 시간을 "일 전" 형식으로 표시한다', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    
    render(
      <MemberCard
        {...defaultProps}
        lastActivity={twoDaysAgo}
      />
    );
    
    expect(screen.getByText('2일 전')).toBeInTheDocument();
  });

  // 활동 없음
  it('lastActivity가 null이면 "활동 없음"을 표시한다', () => {
    render(
      <MemberCard
        {...defaultProps}
        lastActivity={null}
      />
    );
    
    expect(screen.getByText('활동 없음')).toBeInTheDocument();
  });

  // 스트릭 표시
  it('currentStreak를 표시한다', () => {
    render(
      <MemberCard
        {...defaultProps}
        currentStreak={7}
      />
    );
    
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('🔥 연속')).toBeInTheDocument();
  });

  // 포인트 표시
  it('totalPoints를 표시한다', () => {
    render(
      <MemberCard
        {...defaultProps}
        totalPoints={1234}
      />
    );
    
    expect(screen.getByText('1234')).toBeInTheDocument();
    expect(screen.getByText('⭐ 포인트')).toBeInTheDocument();
  });

  // 권한 표시 - 모든 권한
  it('read와 alerts 권한이 모두 있으면 "모든 권한"을 표시한다', () => {
    render(
      <MemberCard
        {...defaultProps}
        permissions={{ read: true, alerts: true }}
      />
    );
    
    expect(screen.getByText('모든 권한')).toBeInTheDocument();
  });

  // 권한 표시 - 읽기 전용
  it('read 권한만 있으면 "읽기 전용"을 표시한다', () => {
    render(
      <MemberCard
        {...defaultProps}
        permissions={{ read: true, alerts: false }}
      />
    );
    
    expect(screen.getByText('읽기 전용')).toBeInTheDocument();
  });

  // 권한 표시 - 제한됨
  it('권한이 없으면 "제한됨"을 표시한다', () => {
    render(
      <MemberCard
        {...defaultProps}
        permissions={{ read: false, alerts: false }}
      />
    );
    
    expect(screen.getByText('제한됨')).toBeInTheDocument();
  });

  // 아바타 이미지
  it('avatarUrl이 제공되면 OptimizedAvatar를 렌더링한다', () => {
    render(
      <MemberCard
        {...defaultProps}
        avatarUrl="https://example.com/avatar.jpg"
      />
    );
    
    const avatar = screen.getByAltText('홍길동님의 프로필');
    expect(avatar).toBeInTheDocument();
  });

  // 폴백 아바타
  it('avatarUrl이 없으면 이름 첫 글자로 폴백 아바타를 표시한다', () => {
    render(<MemberCard {...defaultProps} />);
    
    expect(screen.getByText('홍')).toBeInTheDocument();
  });

  // 접근성 - aria-label
  it('적절한 aria-label을 가진다', () => {
    render(<MemberCard {...defaultProps} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', '홍길동님의 상세 정보 보기');
  });

  // 기본값 테스트
  it('currentStreak와 totalPoints의 기본값이 0이다', () => {
    render(<MemberCard {...defaultProps} />);
    
    // 스트릭과 포인트 모두 0으로 표시되어야 함
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(2);
  });

  // 스냅샷 테스트
  it('전체 props로 렌더링 시 스냅샷과 일치한다', () => {
    const { container } = render(
      <MemberCard
        userId="user-456"
        name="김철수"
        lastActivity={new Date().toISOString()}
        currentStreak={14}
        totalPoints={5678}
        permissions={{ read: true, alerts: true }}
        avatarUrl="https://example.com/avatar.jpg"
      />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });
});
