import { act, renderHook } from '@testing-library/react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('só entrega o novo valor depois que ele para de mudar', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'jo' },
    });

    rerender({ value: 'joa' });
    rerender({ value: 'joao' });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe('jo');

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('joao');
  });
});
