import { useCallback, useRef, useState } from 'react';
import { useNotifications } from '../components/notifications/useNotifications';

export type ActionOutcome<Result> = { ok: true; result: Result } | { ok: false };

export interface Action<Args extends unknown[], Result> {
  pending: boolean;
  run: (...args: Args) => Promise<ActionOutcome<Result>>;
}

export function useAction<Args extends unknown[], Result>(
  perform: (...args: Args) => Promise<Result>,
  successMessage?: string,
): Action<Args, Result> {
  const { notifySuccess, notifyError } = useNotifications();
  const [pending, setPending] = useState(false);
  const running = useRef(false);

  const run = useCallback(
    async (...args: Args): Promise<ActionOutcome<Result>> => {
      if (running.current) {
        return { ok: false };
      }
      running.current = true;
      setPending(true);
      try {
        const result = await perform(...args);
        if (successMessage) {
          notifySuccess(successMessage);
        }
        return { ok: true, result };
      } catch (error) {
        notifyError((error as Error).message);
        return { ok: false };
      } finally {
        running.current = false;
        setPending(false);
      }
    },
    [perform, successMessage, notifySuccess, notifyError],
  );

  return { pending, run };
}
