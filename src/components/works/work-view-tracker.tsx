"use client";

import { useEffect, useRef } from "react";

import { trackViewCount } from "@/components/view-count/view-count-navigation";

export function WorkViewTracker({ workId }: { workId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    trackViewCount(`/api/works/${workId}/views`);
  }, [workId]);

  return null;
}
