import React, { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  position?: 'left' | 'right';
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isRight = position === 'right';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />
      <div className={`fixed inset-y-0 ${isRight ? 'right-0' : 'left-0'} max-w-full flex`}>
        <div
          className={twMerge(
            clsx(
              'w-screen max-w-md bg-white shadow-2xl border-l border-surface-200 flex flex-col transform transition-transform duration-300 ease-in-out',
              className
            )
          )}
        >
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 bg-surface-50/70">
              <h2 className="text-base font-bold text-surface-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="p-6 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
};
