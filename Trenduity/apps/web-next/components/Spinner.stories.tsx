import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'large'],
    },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

// 기본 (large)
export const Large: Story = {
  args: {
    size: 'large',
  },
};

// 작은 크기
export const Small: Story = {
  args: {
    size: 'small',
  },
};

// 커스텀 스타일
export const CustomColor: Story = {
  args: {
    size: 'large',
    className: 'border-purple-500',
  },
};

// 다양한 배경에서
export const OnDarkBackground: Story = {
  args: {
    size: 'large',
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-900 p-8 rounded-lg">
        <Story />
      </div>
    ),
  ],
};

// 카드 내부에서
export const InCard: Story = {
  args: {
    size: 'small',
  },
  decorators: [
    (Story) => (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <p className="text-gray-700 dark:text-gray-300 mb-4">데이터 로딩 중...</p>
        <Story />
      </div>
    ),
  ],
};

// 크기 비교
export const SizeComparison: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="text-center">
        <Spinner size="small" />
        <p className="mt-2 text-sm text-gray-600">Small</p>
      </div>
      <div className="text-center">
        <Spinner size="large" />
        <p className="mt-2 text-sm text-gray-600">Large</p>
      </div>
    </div>
  ),
};

// 다양한 색상
export const ColorVariants: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="text-center">
        <Spinner size="large" />
        <p className="mt-2 text-sm text-gray-600">Default (Blue)</p>
      </div>
      <div className="text-center">
        <Spinner size="large" className="border-purple-500" />
        <p className="mt-2 text-sm text-gray-600">Purple</p>
      </div>
      <div className="text-center">
        <Spinner size="large" className="border-green-500" />
        <p className="mt-2 text-sm text-gray-600">Green</p>
      </div>
      <div className="text-center">
        <Spinner size="large" className="border-red-500" />
        <p className="mt-2 text-sm text-gray-600">Red</p>
      </div>
    </div>
  ),
};
