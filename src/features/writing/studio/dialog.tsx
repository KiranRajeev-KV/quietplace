import { useEffect, useRef, type ReactNode } from 'react';
export function DeskDialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="desk-dialog"
      onCancel={onClose}
      aria-labelledby="desk-dialog-title"
    >
      <div className="desk-dialog-heading">
        <h2 id="desk-dialog-title">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Close dialog">
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
