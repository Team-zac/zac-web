"use client";

import { useEffect, useRef } from "react";

import { trackViewCount } from "@/components/view-count/view-count-navigation";

export function CharacterViewTracker({ characterId }: { characterId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    trackViewCount(`/api/characters/${characterId}/views`);
  }, [characterId]);

  return null;
}
