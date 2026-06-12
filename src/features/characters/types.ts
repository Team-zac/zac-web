import type {
  CharacterAffiliationStatus,
  Visibility,
  WorldRole,
} from "@prisma/client";

export type CharacterActionState = { error?: string };

export type CharacterAffiliationInput = {
  affiliationId: string;
  endedLabel: string;
  isPrimary: boolean;
  note: string;
  rank: string;
  startedLabel: string;
  status: CharacterAffiliationStatus;
  title: string;
};

export type CharacterCardData = {
  alias: string | null;
  id: string;
  name: string;
  primaryAffiliation: string | null;
  role?: WorldRole;
  summary: string;
  tags: string[];
  updatedAt: Date;
  viewCount: bigint;
  visibility: Visibility;
  worldTitle: string;
};
