import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name; shown as the header unless `hideHeader` */
  title: string;
  hideHeader?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Centred dialog on tablet/desktop, bottom sheet on phones.
 * Closes on Escape and on backdrop click; locks page scroll while open.
 */
export function Modal({ open, onClose, title, hideHeader, children, className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid animate-fade-in items-end bg-scrim md:place-items-center md:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'max-h-[92dvh] w-full animate-sheet-up overflow-auto rounded-t-[24px] bg-surface pb-[env(safe-area-inset-bottom)] shadow-card outline-none md:max-h-[90dvh] md:w-[min(440px,100%)] md:rounded-[24px] md:pb-0',
          className,
        )}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between px-4.5 pt-4">
            <h2 className="font-semibold">{title}</h2>
            <CloseButton onClick={onClose} />
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function CloseButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className={cn(
        'grid size-9.5 place-items-center rounded-field text-ink-2 hover:bg-surface-2',
        className,
      )}
    >
      <X className="size-5" />
    </button>
  );
}
