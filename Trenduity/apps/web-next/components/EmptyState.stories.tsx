import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'text' },
    title: { control: 'text' },
    description: { control: 'text' },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

// 기본 (설명 없음)
export const Default: Story = {
  args: {
    title: '데이터가 없습니다',
  },
};

// 설명 포함
export const WithDescription: Story = {
  args: {
    title: '멤버가 없습니다',
    description: '가족을 초대하여 함께 시작해 보세요.',
  },
};

// 커스텀 아이콘
export const CustomIcon: Story = {
  args: {
    icon: '🎉',
    title: '모두 완료했습니다!',
    description: '오늘의 모든 카드를 완료했어요.',
  },
};

// 알림 없음
export const NoAlerts: Story = {
  args: {
    icon: '🔔',
    title: '알림이 없습니다',
    description: '새로운 알림이 생기면 여기에 표시됩니다.',
  },
};

// 검색 결과 없음
export const NoSearchResults: Story = {
  args: {
    icon: '🔍',
    title: '검색 결과가 없습니다',
    description: '다른 검색어로 다시 시도해 보세요.',
  },
};

// 에러 상태
export const ErrorState: Story = {
  args: {
    icon: '⚠️',
    title: '데이터를 불러올 수 없습니다',
    description: '잠시 후 다시 시도해 주세요.',
  },
};

// 카드 내부
export const InCard: Story = {
  args: {
    icon: '📊',
    title: '활동 내역이 없습니다',
    description: '첫 번째 카드를 완료하면 여기에 기록됩니다.',
  },
  decorators: [
    (Story) => (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <Story />
      </div>
    ),
  ],
};

// 큰 컨테이너
export const InLargeContainer: Story = {
  args: {
    icon: '👥',
    title: '멤버를 추가하세요',
    description: '가족 구성원을 초대하여 활동을 시작하세요. 초대 링크를 공유하면 됩니다.',
  },
  decorators: [
    (Story) => (
      <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-md w-full min-h-[400px] flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

// 다양한 상태
export const VariousStates: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <EmptyState icon="📭" title="받은 메시지 없음" />
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <EmptyState 
          icon="🎯" 
          title="목표가 없습니다" 
          description="새로운 목표를 설정해 보세요."
        />
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <EmptyState 
          icon="⭐" 
          title="즐겨찾기 없음" 
          description="자주 사용하는 항목을 즐겨찾기에 추가하세요."
        />
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <EmptyState 
          icon="📝" 
          title="노트가 없습니다" 
          description="첫 노트를 작성해 보세요."
        />
      </div>
    </div>
  ),
};
