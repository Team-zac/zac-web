"use client";

import { useEffect, useRef } from "react";

import { trackViewCount } from "@/components/view-count/view-count-navigation";

export function WorldViewTracker({ worldId }: { worldId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    trackViewCount(`/api/worlds/${worldId}/views`);
  }, [worldId]);

  return null;
}
