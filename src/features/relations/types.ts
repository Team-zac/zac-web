import type { RelationDirection, RelationStatus, Visibility } from "@prisma/client";

export type RelationActionState = { error?: string; ok?: boolean };

export type RelationNode = {
  affiliationColor: string | null;
  affiliationId: string | null;
  affiliationName: string | null;
  id: string;
  left: number;
  name: string;
  top: number;
};

export type RelationEdge = {
  contextAffiliationId: string | null;
  contextAffiliationName: string | null;
  description: string;
  direction: RelationDirection;
  id: string;
  name: string;
  sourceCharacterId: string;
  sourceName: string;
  status: RelationStatus;
  targetCharacterId: string;
  targetName: string;
  visibility: Visibility;
  width: number;
  x: number;
  y: number;
  rotate: number;
};

export type RelationGraphData = {
  affiliations: {
    id: string;
    name: string;
  }[];
  canEdit: boolean;
  characters: {
    id: string;
    name: string;
  }[];
  edges: RelationEdge[];
  nodes: RelationNode[];
  world: {
    id: string;
    title: string;
  };
};
