"use client";

import { ErrorStateCard } from "@/components/error-state-card";

export default function NotFound() {
  return (
    <ErrorStateCard
      description="알 수 없는 정보입니다."
      title="알 수 없는 정보입니다."
    />
  );
}
