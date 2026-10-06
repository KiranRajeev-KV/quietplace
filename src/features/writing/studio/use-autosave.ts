import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { get, set, del } from 'idb-keyval';
import { toManuscript, type Manuscript, type Writing } from '../domain/model';
import { writingRepository, WritingRequestError } from '../data/repository';
import { writingKeys } from '../data/queries';
type SaveState = 'saved' | 'dirty' | 'saving' | 'error' | 'conflict';
interface Recovery {
  manuscript: Manuscript;
  revision: number;
  updatedAt: string;
}
export function useAutosave(initial: Writing) {
  const client = useQueryClient(),
    [record, setRecord] = useState(initial),
    [manuscript, setManuscript] = useState(() => toManuscript(initial)),
    [state, setState] = useState<SaveState>('saved'),
    [error, setError] = useState(''),
    [ready, setReady] = useState(false),
    [recovered, setRecovered] = useState(false),
    [localSafe, setLocalSafe] = useState(true),
    [storageError, setStorageError] = useState('');
  const latest = useRef(toManuscript(initial)),
    revision = useRef(initial.revision),
    generation = useRef(0),
    savedGeneration = useRef(0),
    busy = useRef<Promise<boolean> | null>(null),
    mounted = useRef(true),
    blocked = useRef(false),
    retryCount = useRef(0),
    key = `writing-recovery:${initial.id}`;
  const saveMutation = useMutation({
    mutationFn: ({ rev, value }: { rev: number; value: Manuscript }) =>
      writingRepository.save(initial.id, rev, value),
  });
  const mutate = saveMutation.mutateAsync;
  const checkpoint = useCallback(async () => {
    if (generation.current === savedGeneration.current) return true;
    try {
      await set(key, {
        manuscript: latest.current,
        revision: revision.current,
        updatedAt: new Date().toISOString(),
      } satisfies Recovery);
      if (mounted.current) {
        setLocalSafe(true);
        setStorageError('');
      }
      return true;
    } catch {
      if (mounted.current) {
        setLocalSafe(false);
        setStorageError(
          'Device recovery is unavailable. Keep this page open until the server saves, or export the manuscript.',
        );
      }
      return false;
    }
  }, [key]);
  const flush = useCallback(async (): Promise<boolean> => {
    if (busy.current) return busy.current;
    if (blocked.current) return false;
    const work = async () => {
      while (generation.current !== savedGeneration.current) {
        const target = generation.current,
          value = structuredClone(latest.current);
        if (mounted.current) {
          setState('saving');
          setError('');
        }
        await checkpoint();
        try {
          const saved = await mutate({ rev: revision.current, value });
          revision.current = saved.revision;
          savedGeneration.current = target;
          retryCount.current = 0;
          client.setQueryData(writingKeys.manuscript(initial.id), saved);
          if (mounted.current) setRecord(saved);
          if (generation.current === savedGeneration.current) {
            await del(key).catch(() => undefined);
            if (mounted.current) setState('saved');
          } else await checkpoint();
          void client.invalidateQueries({ queryKey: writingKeys.studio });
        } catch (e) {
          const conflict = e instanceof WritingRequestError && e.code === 'revision_conflict';
          blocked.current = conflict;
          if (mounted.current) {
            setState(conflict ? 'conflict' : 'error');
            setError(e instanceof Error ? e.message : 'The connection was interrupted.');
          }
          await checkpoint();
          return false;
        }
      }
      return true;
    };
    busy.current = work().finally(() => {
      busy.current = null;
    });
    return busy.current;
  }, [checkpoint, client, initial.id, key, mutate]);
  const update = useCallback((patch: Partial<Manuscript>) => {
    latest.current = { ...latest.current, ...patch };
    generation.current++;
    setManuscript(latest.current);
    setState(blocked.current ? 'conflict' : 'dirty');
  }, []);
  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    void get<Recovery>(key)
      .then((copy) => {
        if (cancelled) return;
        if (copy && JSON.stringify(copy.manuscript) !== JSON.stringify(latest.current)) {
          latest.current = copy.manuscript;
          generation.current++;
          setManuscript(copy.manuscript);
          setRecovered(true);
          if (copy.revision !== revision.current) {
            blocked.current = true;
            setState('conflict');
            setError(
              'This device has unsaved writing, and the saved manuscript has moved on. Export the local copy, or deliberately replace the saved version.',
            );
          } else setState('dirty');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLocalSafe(false);
          setStorageError('Device recovery is unavailable. Export a copy if the connection fails.');
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
      mounted.current = false;
    };
  }, [key]);
  useEffect(() => {
    if (!ready || state !== 'dirty') return;
    const timeout = setTimeout(() => void flush(), 900),
      local = setTimeout(() => void checkpoint(), 120);
    return () => {
      clearTimeout(timeout);
      clearTimeout(local);
    };
  }, [checkpoint, flush, manuscript, ready, state]);
  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(() => {
      if (generation.current !== savedGeneration.current && !blocked.current) void flush();
    }, 5000);
    const online = () => void flush();
    const hidden = () => {
      if (document.visibilityState === 'hidden') {
        void checkpoint();
        void flush();
      }
    };
    window.addEventListener('online', online);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', online);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, [checkpoint, flush, ready]);
  useEffect(() => {
    if (state !== 'error' || retryCount.current >= 3) return;
    const timeout = setTimeout(
      () => {
        retryCount.current++;
        void flush();
      },
      2000 * 2 ** retryCount.current,
    );
    return () => clearTimeout(timeout);
  }, [flush, state]);
  function accept(saved: Writing) {
    revision.current = saved.revision;
    setRecord(saved);
    client.setQueryData(writingKeys.manuscript(initial.id), saved);
  }
  async function rebase() {
    blocked.current = false;
    const saved = await writingRepository.manuscript(initial.id);
    revision.current = saved.revision;
    setRecord(saved);
    setState('dirty');
    setError('');
    return flush();
  }
  async function discardLocal() {
    const saved = await writingRepository.manuscript(initial.id);
    await del(key);
    latest.current = toManuscript(saved);
    revision.current = saved.revision;
    generation.current++;
    savedGeneration.current = generation.current;
    blocked.current = false;
    setManuscript(latest.current);
    setRecord(saved);
    setState('saved');
    setError('');
    setRecovered(false);
    return saved;
  }
  return {
    manuscript,
    record,
    state,
    error,
    ready,
    recovered,
    localSafe,
    storageError,
    update,
    flush,
    checkpoint,
    accept,
    rebase,
    discardLocal,
    isDirty: () => generation.current !== savedGeneration.current,
    revision: () => revision.current,
  };
}
