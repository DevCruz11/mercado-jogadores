import { Modal } from './Modal';
import { ResultItem, ResultSummary } from './ResultSummary';

interface ResultDialogProps {
  title: string;
  items: ResultItem[];
  onClose: () => void;
}

export function ResultDialog({ title, items, onClose }: ResultDialogProps) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <button type="button" className="button button--primary" onClick={onClose}>
          Fechar
        </button>
      }
    >
      <ResultSummary items={items} />
    </Modal>
  );
}
