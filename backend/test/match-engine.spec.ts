import { MatchPlayer, playMatch } from '../src/league/match-engine';

function player(
  id: number,
  name: string,
  position: MatchPlayer['position'],
  attributes: Partial<MatchPlayer>,
): MatchPlayer {
  return {
    id,
    name,
    position,
    condition: 'APTO',
    shooting: 50,
    passing: 50,
    dribbling: 50,
    defending: 50,
    ...attributes,
  };
}

describe('playMatch (RN20)', () => {
  const home = {
    clubId: 1,
    starters: [
      player(30, 'Rui Prado', 'GOL', { defending: 77 }),
      player(32, 'Téo Brandão', 'ZAG', { defending: 84 }),
      player(31, 'Davi Lins', 'LAT', {
        condition: 'MAL_CONDICIONADO',
        dribbling: 74,
        defending: 66,
      }),
      player(33, 'Lauro Neves', 'MEI', { passing: 82 }),
      player(34, 'Otto Rangel', 'ATA', { shooting: 75 }),
    ],
  };
  const away = {
    clubId: 2,
    starters: [
      player(40, 'Ivo Teles', 'GOL', { defending: 72 }),
      player(41, 'Hugo Vaz', 'ZAG', { defending: 84 }),
      player(42, 'Lino Matos', 'LAT', { dribbling: 79, defending: 63 }),
      player(43, 'Nei Soares', 'MEI', { passing: 70 }),
      player(44, 'Ugo Falcão', 'ATA', { shooting: 81 }),
    ],
  };

  it('reproduz o exemplo do enunciado (1 × 2, VISITANTE)', () => {
    const outcome = playMatch(home, away);

    expect(outcome.homeGoals).toBe(1);
    expect(outcome.awayGoals).toBe(2);
    expect(outcome.result).toBe('VISITANTE');
    expect(
      outcome.duels.map((duel) => [
        duel.order,
        duel.attacker.player.id,
        duel.attacker.value,
        duel.defender.player.id,
        duel.defender.value,
        duel.goal,
      ]),
    ).toEqual([
      [1, 34, 75, 40, 72, true],
      [2, 33, 82, 41, 84, false],
      [3, 31, 63, 42, 63, false],
      [4, 44, 81, 30, 77, true],
      [5, 43, 70, 32, 84, false],
      [6, 42, 79, 31, 56, true],
    ]);
  });
});
