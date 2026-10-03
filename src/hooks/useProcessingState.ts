import { useState, useCallback } from 'react';

export interface ProcessingState<T> {
  status: 'idle' | 'processing' | 'complete' | 'error';
  progress: number;
  result: T | null;
  error: string | null;
}

export const useProcessingState = <T>() => {
  const [state, setState] = useState<ProcessingState<T>>({
    status: 'idle',
    progress: 0,
    result: null,
    error: null,
  });

  const setProgress = useCallback((progress: number) => {
    setState((prev) => ({ ...prev, progress }));
  }, []);

  const process = useCallback(async (processor: (setProgress: (progress: number) => void) => Promise<T>) => {
    setState({ status: 'processing', progress: 0, result: null, error: null });
    try {
      const result = await processor(setProgress);
      setState({ status: 'complete', progress: 100, result, error: null });
      return result;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Processing failed';
      setState({
        status: 'error',
        progress: 0,
        result: null,
        error: errMsg,
      });
      throw error;
    }
  }, [setProgress]);

  const reset = useCallback(() => {
    setState({ status: 'idle', progress: 0, result: null, error: null });
  }, []);

  return { state, process, setProgress, reset };
};
