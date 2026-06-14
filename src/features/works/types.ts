import type { PublishStatus, Visibility, WorkCharacterRole, WorkType } from "@prisma/client";

export type WorkActionState = { error?: string; ok?: boolean };

export type WorkCharacterInput = {
  characterId: string;
  note: string;
  role: WorkCharacterRole;
};

export type WorkAffiliationInput = {
  affiliationId: string;
  note: string;
};

export type WorkCardData = {
  chapterCount: number;
  id: string;
  publishStatus: PublishStatus;
  summary: string;
  tags: string[];
  title: string;
  type: WorkType;
  updatedAt: Date;
  viewCount: bigint;
  visibility: Visibility;
  worldTitle: string;
};
