import { Prisma } from "@prisma/client";

import { AuthRequiredError, ForbiddenError, NotFoundError } from "@/server/permissions";

export type ActionErrorState = {
  error?: string;
};

export function isRedirectError(error: unknown) {
  return error instanceof Error && error.message.includes("NEXT_REDIRECT");
}

export function isAccessError(error: unknown) {
  return error instanceof AuthRequiredError || error instanceof ForbiddenError || error instanceof NotFoundError;
}

export function toSafeErrorMessage(error: unknown) {
  if (error instanceof AuthRequiredError) return "로그인이 필요합니다.";
  if (error instanceof ForbiddenError) return "접근 권한이 없습니다.";
  if (error instanceof NotFoundError) return "대상을 찾을 수 없습니다.";
  if (error instanceof Prisma.PrismaClientKnownRequestError) return "요청한 데이터를 처리할 수 없습니다.";
  if (error instanceof Prisma.PrismaClientValidationError) return "입력값을 확인해주세요.";
  if (error instanceof Error && error.message.trim()) return error.message;
  return "요청을 처리하는 중 오류가 발생했습니다.";
}

export function actionError<TState extends ActionErrorState>(error: unknown): TState {
  if (isRedirectError(error)) throw error;
  return { error: toSafeErrorMessage(error) } as TState;
}
