'use client';

import React from 'react';
import { getFocusClass, type FocusStyle } from '../utils/focusUtils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼 변형 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 전체 너비 */
  fullWidth?: boolean;
  /** 로딩 상태 */
  loading?: boolean;
  /** 포커스 스타일 */
  focusStyle?: FocusStyle;
  /** 아이콘 (왼쪽) */
  leftIcon?: React.ReactNode;
  /** 아이콘 (오른쪽) */
  rightIcon?: React.ReactNode;
}

/**
 * 웹용 Button 컴포넌트
 * 키보드 접근성 및 포커스 스타일 포함
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      focusStyle = 'default',
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // 변형별 스타일 - WCAG AAA 준수 (7:1 대비)
    const variantClasses = {
      primary: 'bg-blue-800 hover:bg-blue-900 text-white dark:bg-blue-400 dark:hover:bg-blue-300',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white',
      outline: 'border-2 border-blue-800 hover:bg-blue-50 text-blue-800 dark:border-blue-400 dark:hover:bg-blue-950 dark:text-blue-400',
      ghost: 'hover:bg-gray-100 text-gray-900 dark:hover:bg-slate-800 dark:text-white',
      danger: 'bg-red-700 hover:bg-red-800 text-white dark:bg-red-400 dark:hover:bg-red-300',
    };

    // 크기별 스타일 - AAA 터치 영역 (최소 44x44px)
    const sizeClasses = {
      sm: 'px-4 py-2.5 text-sm min-h-[44px]',      // 44px
      md: 'px-5 py-3 text-base min-h-[48px]',      // 48px
      lg: 'px-6 py-4 text-lg min-h-[56px]',        // 56px
    };

    // 비활성화 스타일
    const disabledClasses = 'opacity-50 cursor-not-allowed';

    // 포커스 스타일
    const focusClasses = getFocusClass(focusStyle);

    // 전체 클래스 조합
    const buttonClasses = [
      'inline-flex items-center justify-center gap-2',
      'font-semibold rounded-lg',
      'transition-all duration-200',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      focusClasses,
      fullWidth ? 'w-full' : '',
      (disabled || loading) ? disabledClasses : '',
      className,
    ].join(' ');

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        type={props.type || 'button'}
        {...props}
      >
        {/* 로딩 스피너 */}
        {loading && (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* 왼쪽 아이콘 */}
        {!loading && leftIcon && <span>{leftIcon}</span>}

        {/* 버튼 텍스트 */}
        {children}

        {/* 오른쪽 아이콘 */}
        {!loading && rightIcon && <span>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
