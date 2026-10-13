import { ReactNode } from 'react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  title: string;
  confirmLabel: string;
  pending: boolean;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
  children: ReactNode;
}

export function ConfirmDialog({
  title,
  confirmLabel,
  pending,
  tone = 'primary',
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="button button--ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className={`button button--${tone}`}
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? 'Enviando…' : confirmLabel}
          </button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
