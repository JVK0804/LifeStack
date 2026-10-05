import { useEffect, useState } from 'react';

type AsyncState<T> = { data: T | undefined; error: Error | undefined; loading: boolean };

/** Runs `load` once on mount and ignores results that arrive after unmount. */
export function useAsync<T>(load: () => Promise<T>): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, error: undefined, loading: true });

  useEffect(() => {
    let active = true;
    load().then(
      (data) => active && setState({ data, error: undefined, loading: false }),
      (error: Error) => active && setState({ data: undefined, error, loading: false }),
    );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
