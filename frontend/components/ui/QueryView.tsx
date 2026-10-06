import { UseQueryResult } from "@tanstack/react-query";
import { ReactNode } from "react";
import { ErrorState } from "./StateView";

interface QueryViewProps<T, U> {
  query: UseQueryResult<T>;
  /** Derive what to render (filtering, slicing) without touching the cache. */
  select?: (data: T) => U;
  loading: ReactNode;
  /** Rendered instead of children when this returns true. */
  isEmpty?: (data: U) => boolean;
  empty?: ReactNode;
  errorTitle?: string;
  children: (data: U) => ReactNode;
}

/** One place that decides loading → error → empty → data for any query. */
export function QueryView<T, U = T>({ query, select, loading, isEmpty, empty, errorTitle, children }: QueryViewProps<T, U>) {
  if (query.data !== undefined) {
    const data = select ? select(query.data) : (query.data as unknown as U);
    if (isEmpty?.(data)) return <>{empty}</>;
    return <>{children(data)}</>;
  }
  if (query.isError) return <ErrorState error={query.error} title={errorTitle} onRetry={() => query.refetch()} compact />;
  return <>{loading}</>;
}
