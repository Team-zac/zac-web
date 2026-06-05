"use client";

let pendingViewCountRequest: Promise<void> | null = null;

export function trackViewCount(url: string) {
  const request = fetch(url, {
    keepalive: true,
    method: "POST",
  })
    .then(() => undefined)
    .catch(() => undefined)
    .finally(() => {
      if (pendingViewCountRequest === request) {
        pendingViewCountRequest = null;
      }
    });

  pendingViewCountRequest = request;
}

export async function waitForPendingViewCount() {
  await pendingViewCountRequest;
}
