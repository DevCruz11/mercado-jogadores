import { buildLineupSlots, FORMATIONS } from '../features/clubs/lineup-slots';

describe('buildLineupSlots (RN19)', () => {
  it.each([
    ['3-1', ['GOL', 'ZAG/LAT', 'ZAG/LAT', 'ZAG/LAT', 'ATA']],
    ['2-2', ['GOL', 'ZAG/LAT', 'ZAG/LAT', 'ATA', 'ATA']],
    ['2-1-1', ['GOL', 'ZAG/LAT', 'ZAG/LAT', 'MEI', 'ATA']],
    ['1-2-1', ['GOL', 'ZAG/LAT', 'MEI', 'MEI', 'ATA']],
  ] as const)('a formação %s tem as vagas %j', (formation, expected) => {
    const slots = buildLineupSlots(formation);
    expect(slots.map((slot) => slot.positions.join('/'))).toEqual(expected);
  });

  it('sempre gera 5 vagas com chaves únicas', () => {
    FORMATIONS.forEach((formation) => {
      const keys = buildLineupSlots(formation).map((slot) => slot.key);
      expect(keys).toHaveLength(5);
      expect(new Set(keys).size).toBe(5);
    });
  });
});
