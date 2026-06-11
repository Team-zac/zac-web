import "server-only";

import { apiFetch } from "@/lib/api-fetch";

type AnyRecord = Record<string, any>;
type AffiliationListItem = {
  _count: { characterAffiliations: number };
  color: string | null;
  id: string;
  name: string;
  parent: { name: string } | null;
  type: string;
  visibility: string;
  world: { title: string };
};
type AffiliationDetail = AnyRecord & { characterAffiliations: AnyRecord[]; parent: AnyRecord | null; world: AnyRecord };
type AffiliationEdit = AnyRecord & {
  world: AnyRecord & {
    affiliations: { description: string | null; id: string; name: string; type: string }[];
  };
};

export async function getMyAffiliations(userId: string) {
  void userId;
  return apiFetch<AffiliationListItem[]>("/api/affiliations");
}

export async function getAffiliationDetail(affiliationId: string) {
  return apiFetch<AffiliationDetail | null>(`/api/affiliations/${affiliationId}?view=detail`);
}

export async function getAffiliationForEdit(affiliationId: string, userId: string) {
  void userId;
  return apiFetch<AffiliationEdit | null>(`/api/affiliations/${affiliationId}?view=edit`);
}
