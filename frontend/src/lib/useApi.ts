import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/**
 * Loads data when the screen gains focus, so edits made on other screens show up.
 * Wrap `load` in useCallback; it reloads whenever `load` changes.
 *
 * Returns the data plus `loading` and `error` for the screen's loading/error states,
 * `reload` for retry buttons, and `setData` to update the list in place after a save.
 */
export function useApi<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setError(null);
    try {
      setData(await load());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      // Only the first load shows a spinner; later reloads keep the old data on screen.
      setLoading(false);
    }
  }, [load]);

  // Runs on first render and again whenever the user navigates back to this screen.
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { data, setData, error, loading, reload };
}

/**
 * Wraps a mutation so the same button can't fire twice while a request is in flight.
 * Pass `busy` to the button's `disabled` and show `error` near it.
 * `run` resolves to the result, or undefined if the request failed.
 */
export function useMutation() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <T>(action: () => Promise<T>): Promise<T | undefined> => {
    setBusy(true);
    setError(null);
    try {
      return await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }, []);

  return { busy, error, run, setError };
}
