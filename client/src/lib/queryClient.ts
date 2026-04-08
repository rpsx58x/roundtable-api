import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * API base URL resolution — three contexts:
 *
 *  1. Native app (iOS / Android via Capacitor)
 *     → Uses VITE_API_BASE_URL set at build time (e.g. https://api.roundtable.app)
 *
 *  2. Deployed web app (Perplexity Computer / S3 + port proxy)
 *     → Uses __PORT_5000__ which deploy_website replaces with the proxy path
 *
 *  3. Local dev server  (npm run dev on port 5000)
 *     → Empty string → relative URLs → Vite proxy handles it
 */
function resolveApiBase(): string {
  // Native build: VITE_API_BASE_URL is injected at build time
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL as string;
  }
  // Web deployment: __PORT_5000__ is replaced by deploy_website
  const proxy = "__PORT_5000__";
  return proxy.startsWith("__") ? "" : proxy;
}

export const API_BASE = resolveApiBase();

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(`${API_BASE}${queryKey.join("/")}`);
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }
    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
