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
  /** Bottom sheet on phones (More menu). Default is a centred card on every size. */
  placement?: 'dialog' | 'sheet';
  /** Phones/tablets: almost full viewport. Desktop (`lg+`) stays the 400px card. */
  expandOnMobile?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Centred card that hugs its content. Caps height so the page behind stays still.
 * `placement="sheet"` is the phone More menu only.
 */
export function Modal({
  open,
  onClose,
  title,
  hideHeader,
  placement = 'dialog',
  expandOnMobile = false,
  children,
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const sheet = placement === 'sheet';
  const mobileFill = expandOnMobile && !sheet;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 grid animate-fade-in bg-scrim',
        sheet
          ? 'items-end md:place-items-center md:p-4'
          : mobileFill
            ? 'max-lg:items-end max-lg:p-1.5 max-lg:pt-[max(8px,env(safe-area-inset-top))] lg:place-items-center lg:p-4'
            : 'place-items-center p-3 sm:p-4',
      )}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'flex w-full flex-col overflow-hidden bg-surface shadow-card outline-none',
          sheet
            ? 'max-h-[min(90dvh,640px)] rounded-t-[24px] pb-[env(safe-area-inset-bottom)] md:w-[min(400px,calc(100%-2rem))] md:rounded-[24px] md:pb-0'
            : mobileFill
              ? 'max-lg:h-[min(94dvh,100%)] max-lg:max-h-[min(94dvh,100%)] max-lg:w-full max-lg:rounded-[20px] max-lg:pb-[env(safe-area-inset-bottom)] lg:max-h-[min(90dvh,640px)] lg:w-[min(100%,400px)] lg:rounded-[24px] lg:pb-0'
              : 'max-h-[min(90dvh,640px)] w-[min(100%,400px)] rounded-[24px] pb-0',
          className,
        )}
      >
        {!hideHeader && (
          <div className="flex shrink-0 items-center justify-between px-4 pt-3.5">
            <h2 className="font-semibold">{title}</h2>
            <CloseButton onClick={onClose} />
          </div>
        )}
        <div
          className={cn(
            'min-h-0 overflow-y-auto overscroll-contain',
            mobileFill && 'max-lg:flex max-lg:flex-1 max-lg:flex-col',
          )}
        >
          {children}
        </div>
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
