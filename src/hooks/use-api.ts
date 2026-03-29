"use client";

import useSWR, { type SWRConfiguration } from "swr";
import { apiGet } from "@/lib/api";

function fetcher<T>(path: string): Promise<T> {
  return apiGet<T>(path);
}

export function useApi<T>(path: string | null, config?: SWRConfiguration<T>) {
  return useSWR<T>(path, fetcher<T>, {
    revalidateOnFocus: false,
    ...config,
  });
}
