import type { Meta, StoryObj } from '@storybook/react';
import { MemberCard } from './MemberCard';

const meta: Meta<typeof MemberCard> = {
  title: 'Components/MemberCard',
  component: MemberCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    userId: { control: 'text' },
    name: { control: 'text' },
    avatarUrl: { control: 'text' },
    lastActive: { control: 'date' },
    currentStreak: { control: 'number' },
    totalPoints: { control: 'number' },
    permissions: {
      control: 'select',
      options: ['모든 권한', '읽기 전용', '제한됨'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof MemberCard>;

// 기본 (활동 중)
export const ActiveMember: Story = {
  args: {
    userId: 'user-1',
    name: '김영희',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kim',
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
    currentStreak: 7,
    totalPoints: 350,
    permissions: '모든 권한',
  },
};

// 대기 (24시간 이상)
export const InactiveMember: Story = {
  args: {
    userId: 'user-2',
    name: '이철수',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lee',
    lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2일 전
    currentStreak: 0,
    totalPoints: 120,
    permissions: '읽기 전용',
  },
};

// 아바타 없음 (첫 글자 표시)
export const NoAvatar: Story = {
  args: {
    userId: 'user-3',
    name: '박민수',
    lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5시간 전
    currentStreak: 3,
    totalPoints: 180,
    permissions: '모든 권한',
  },
};

// 제한됨 권한
export const RestrictedPermission: Story = {
  args: {
    userId: 'user-4',
    name: '정수진',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jung',
    lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30분 전
    currentStreak: 14,
    totalPoints: 720,
    permissions: '제한됨',
  },
};

// 활동 없음 (null lastActive)
export const NoActivity: Story = {
  args: {
    userId: 'user-5',
    name: '최지훈',
    lastActive: null,
    currentStreak: 0,
    totalPoints: 0,
    permissions: '읽기 전용',
  },
};

// 높은 스트릭
export const HighStreak: Story = {
  args: {
    userId: 'user-6',
    name: '강미영',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kang',
    lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1시간 전
    currentStreak: 45,
    totalPoints: 2350,
    permissions: '모든 권한',
  },
};

// 긴 이름
export const LongName: Story = {
  args: {
    userId: 'user-7',
    name: '홍길동김영희이철수박민수',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hong',
    lastActive: new Date(Date.now() - 10 * 60 * 1000), // 10분 전
    currentStreak: 2,
    totalPoints: 95,
    permissions: '모든 권한',
  },
};

// 모든 권한 레벨
export const AllPermissions: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <MemberCard
        userId="user-8"
        name="전체 권한"
        avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
        lastActive={new Date()}
        currentStreak={10}
        totalPoints={500}
        permissions="모든 권한"
      />
      <MemberCard
        userId="user-9"
        name="읽기 전용"
        avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Reader"
        lastActive={new Date()}
        currentStreak={5}
        totalPoints={250}
        permissions="읽기 전용"
      />
      <MemberCard
        userId="user-10"
        name="제한됨"
        avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Restricted"
        lastActive={new Date()}
        currentStreak={1}
        totalPoints={50}
        permissions="제한됨"
      />
    </div>
  ),
};

// 다양한 활동 상태
export const AllActivityStates: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <MemberCard
        userId="user-11"
        name="방금 활동"
        avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Recent"
        lastActive={new Date()}
        currentStreak={7}
        totalPoints={350}
        permissions="모든 권한"
      />
      <MemberCard
        userId="user-12"
        name="1시간 전"
        avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Hour"
        lastActive={new Date(Date.now() - 60 * 60 * 1000)}
        currentStreak={5}
        totalPoints={200}
        permissions="모든 권한"
      />
      <MemberCard
        userId="user-13"
        name="1일 전"
        avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Day"
        lastActive={new Date(Date.now() - 24 * 60 * 60 * 1000)}
        currentStreak={0}
        totalPoints={150}
        permissions="읽기 전용"
      />
      <MemberCard
        userId="user-14"
        name="1주 전"
        avatarUrl="https://api.dicebear.com/7.x/avataaars/svg?seed=Week"
        lastActive={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
        currentStreak={0}
        totalPoints={80}
        permissions="제한됨"
      />
    </div>
  ),
};
