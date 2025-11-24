import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from './ErrorBoundary';
import { useState } from 'react';

// 에러를 발생시키는 테스트 컴포넌트
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('테스트 에러가 발생했습니다!');
  }
  return <div className="text-green-600">✓ 정상 작동 중</div>;
}

// 버튼으로 에러를 트리거하는 컴포넌트
function ErrorTrigger() {
  const [shouldThrow, setShouldThrow] = useState(false);
  
  if (shouldThrow) {
    throw new Error('버튼 클릭으로 에러가 발생했습니다!');
  }
  
  return (
    <div className="p-4">
      <p className="mb-4 text-gray-700 dark:text-gray-300">아래 버튼을 클릭하면 에러가 발생합니다.</p>
      <button
        onClick={() => setShouldThrow(true)}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        에러 발생시키기
      </button>
    </div>
  );
}

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    fallback: { control: false },
    onError: { action: 'error occurred' },
  },
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

// 정상 작동 (에러 없음)
export const NormalRender: Story = {
  args: {
    children: (
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-2">정상 작동 중</h3>
        <p className="text-gray-600 dark:text-gray-400">
          ErrorBoundary로 감싸진 컴포넌트입니다. 에러가 없으면 이렇게 정상적으로 렌더링됩니다.
        </p>
      </div>
    ),
  },
};

// 에러 발생 시 (기본 폴백)
export const WithError: Story = {
  args: {
    children: <ThrowError shouldThrow={true} />,
  },
};

// 커스텀 폴백 UI
export const CustomFallback: Story = {
  args: {
    fallback: (
      <div className="p-8 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg">
        <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
          🚨 커스텀 에러 메시지
        </h3>
        <p className="text-red-700 dark:text-red-300 mb-4">
          사용자 정의 에러 UI입니다. 에러가 발생했을 때 이 메시지가 표시됩니다.
        </p>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          다시 시도
        </button>
      </div>
    ),
    children: <ThrowError shouldThrow={true} />,
  },
};

// onError 콜백
export const WithErrorCallback: Story = {
  args: {
    onError: (error, errorInfo) => {
      console.error('ErrorBoundary caught:', error, errorInfo);
      // 실제로는 여기서 에러 로깅 서비스에 전송
    },
    children: <ThrowError shouldThrow={true} />,
  },
};

// 인터랙티브 에러 트리거
export const InteractiveError: Story = {
  args: {
    children: <ErrorTrigger />,
  },
  parameters: {
    docs: {
      description: {
        story: '버튼을 클릭하면 에러가 발생하고 ErrorBoundary가 에러를 잡습니다.',
      },
    },
  },
};

// 중첩된 ErrorBoundary
export const NestedErrorBoundaries: Story = {
  render: () => (
    <div className="space-y-4">
      <ErrorBoundary fallback={<div className="p-4 bg-red-100 dark:bg-red-900/30 rounded">외부 ErrorBoundary</div>}>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h4 className="font-bold mb-2">외부 ErrorBoundary</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            이 영역은 정상 작동 중입니다.
          </p>
          
          <ErrorBoundary fallback={<div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded">내부 ErrorBoundary</div>}>
            <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded">
              <h5 className="font-bold mb-2">내부 ErrorBoundary</h5>
              <ThrowError shouldThrow={true} />
            </div>
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '내부 ErrorBoundary만 에러를 잡고, 외부는 정상 작동합니다.',
      },
    },
  },
};

// 여러 자식 컴포넌트
export const MultipleChildren: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ErrorBoundary>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h4 className="font-bold mb-2">컴포넌트 1</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">정상 작동</p>
        </div>
      </ErrorBoundary>
      
      <ErrorBoundary>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h4 className="font-bold mb-2">컴포넌트 2</h4>
          <ThrowError shouldThrow={true} />
        </div>
      </ErrorBoundary>
      
      <ErrorBoundary>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h4 className="font-bold mb-2">컴포넌트 3</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">정상 작동</p>
        </div>
      </ErrorBoundary>
      
      <ErrorBoundary>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h4 className="font-bold mb-2">컴포넌트 4</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">정상 작동</p>
        </div>
      </ErrorBoundary>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '각 컴포넌트를 별도의 ErrorBoundary로 감싸서 격리시킵니다. 하나의 에러가 다른 컴포넌트에 영향을 주지 않습니다.',
      },
    },
  },
};
