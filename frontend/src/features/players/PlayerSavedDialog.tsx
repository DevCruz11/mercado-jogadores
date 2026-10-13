import { Player } from '../../api/types';
import { ResultDialog } from '../../components/ResultDialog';
import { CONDITION_LABELS, formatMoney } from '../../utils/format';

export function PlayerSavedDialog({ player, onClose }: { player: Player; onClose: () => void }) {
  return (
    <ResultDialog
      title={`${player.name} salvo`}
      onClose={onClose}
      items={[
        { label: 'Posição', value: player.position },
        { label: 'Overall', value: player.overall },
        { label: 'Condição', value: CONDITION_LABELS[player.condition] },
        { label: 'Valor base', value: formatMoney(player.base_value) },
        { label: 'Valor de mercado', value: formatMoney(player.market_value) },
      ]}
    />
  );
}
