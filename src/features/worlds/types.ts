import type { Visibility, WorldRole } from "@prisma/client";

export type WorldActionState = {
  error?: string;
};

export type WorldCardData = {
  description: string;
  genre: string | null;
  id: string;
  role?: WorldRole;
  tags: string[];
  title: string;
  updatedAt: Date;
  viewCount: bigint;
  visibility: Visibility;
};

