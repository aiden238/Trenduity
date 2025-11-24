import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './StatCard';
import { Users, Activity, Trophy, TrendingUp } from 'lucide-react';

const meta: Meta<typeof StatCard> = {
  title: 'Components/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    value: { control: 'text' },
    unit: { control: 'text' },
    icon: { control: false },
    gradient: {
      control: 'select',
      options: [
        'from-blue-500 to-cyan-500',
        'from-purple-500 to-pink-500',
        'from-amber-500 to-orange-500',
        'from-green-500 to-emerald-500',
      ],
    },
    info: { control: 'text' },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

// 기본
export const Default: Story = {
  args: {
    title: '총 멤버',
    value: '24',
    unit: '명',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-500',
  },
};

// 활동 중 (info 배지 포함)
export const WithInfoBadge: Story = {
  args: {
    title: '활동 중',
    value: '18',
    unit: '명',
    icon: Activity,
    gradient: 'from-purple-500 to-pink-500',
    info: '최근 24시간',
  },
};

// 총 포인트 (단위 없음)
export const NoUnit: Story = {
  args: {
    title: '총 포인트',
    value: '1,240',
    icon: Trophy,
    gradient: 'from-amber-500 to-orange-500',
  },
};

// 누적 스트릭
export const WithStreak: Story = {
  args: {
    title: '누적 스트릭',
    value: '327',
    unit: '일',
    icon: TrendingUp,
    gradient: 'from-green-500 to-emerald-500',
    info: '전체 멤버 평균',
  },
};

// 문자열 값
export const StringValue: Story = {
  args: {
    title: '상태',
    value: '정상',
    icon: Activity,
    gradient: 'from-blue-500 to-cyan-500',
  },
};

// 긴 제목
export const LongTitle: Story = {
  args: {
    title: '이번 주 완료한 카드 수',
    value: '156',
    unit: '개',
    icon: Trophy,
    gradient: 'from-purple-500 to-pink-500',
  },
};

// 큰 숫자
export const LargeNumber: Story = {
  args: {
    title: '전체 포인트',
    value: '9,999,999',
    unit: '점',
    icon: Trophy,
    gradient: 'from-amber-500 to-orange-500',
    info: '역대 최고',
  },
};

// 모든 그라디언트
export const AllGradients: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        title="파란색"
        value="24"
        unit="명"
        icon={Users}
        gradient="from-blue-500 to-cyan-500"
      />
      <StatCard
        title="보라색"
        value="18"
        unit="명"
        icon={Activity}
        gradient="from-purple-500 to-pink-500"
      />
      <StatCard
        title="주황색"
        value="1,240"
        icon={Trophy}
        gradient="from-amber-500 to-orange-500"
      />
      <StatCard
        title="초록색"
        value="327"
        unit="일"
        icon={TrendingUp}
        gradient="from-green-500 to-emerald-500"
      />
    </div>
  ),
};
