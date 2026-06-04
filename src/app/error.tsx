"use client";

import { ErrorStateCard } from "@/components/error-state-card";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <ErrorStateCard
      description="요청을 처리하는 중 문제가 발생했습니다."
      message={error.message || "알 수 없는 오류가 발생했습니다."}
      title="오류가 발생했습니다."
    />
  );
}
