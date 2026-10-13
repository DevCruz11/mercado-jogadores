import { Club, PurchaseResult } from '../../api/types';
import { ResultDialog } from '../../components/ResultDialog';
import { formatDateTime, formatMoney } from '../../utils/format';

interface PurchaseResultDialogProps {
  result: PurchaseResult;
  clubs: Club[];
  onClose: () => void;
}

export function PurchaseResultDialog({ result, clubs, onClose }: PurchaseResultDialogProps) {
  const club = clubs.find((candidate) => candidate.id === result.club_id);
  return (
    <ResultDialog
      title={`Compra de ${result.player_name}`}
      onClose={onClose}
      items={[
        { label: 'Clube', value: club?.name ?? `#${result.club_id}` },
        { label: 'Valor', value: formatMoney(result.value) },
        { label: 'Taxa', value: formatMoney(result.fee) },
        { label: 'Custo total (valor + taxa)', value: formatMoney(result.value + result.fee) },
        { label: 'Fim da fidelidade', value: formatDateTime(result.contract.loyalty_until) },
        { label: 'Novo caixa', value: formatMoney(result.club_cash) },
      ]}
    />
  );
}
