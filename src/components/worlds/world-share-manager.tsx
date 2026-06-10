"use client";

import { useState, useTransition } from "react";
import type { WorldRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { EntityLabel } from "@/components/ui/entity-label";

type ShareMember = {
  id: string;
  role: WorldRole;
  user: {
    email: string | null;
    id: string;
    image: string | null;
    name: string | null;
  };
};

type PendingInvite = {
  email: string;
  id: string;
  role: WorldRole;
};

function Avatar({ name }: { name: string }) {
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#E100FF]/80 to-[#FF0040]/80 font-black">
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function WorldShareManager({
  invites,
  members,
  owner,
  worldId,
}: {
  invites: PendingInvite[];
  members: ShareMember[];
  owner: ShareMember["user"];
  worldId: string;
}) {
  const t = useTranslations("worlds.share");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const ownerMember: ShareMember = { id: "owner", role: "OWNER", user: owner };
  const roleLabels: Record<WorldRole, string> = {
    ADMIN: t("roles.admin"),
    EDITOR: t("roles.editor"),
    OWNER: t("roles.owner"),
    VIEWER: t("roles.viewer"),
  };
  const allMembers = [
    ownerMember,
    ...members.filter((member) => member.user.id !== owner.id && member.role !== "OWNER"),
  ];

  function MemberRow({ member }: { member: ShareMember }) {
    const displayName = member.user.name ?? member.user.email ?? t("userFallback");
    return (
      <li className="grid grid-cols-[auto_minmax(0,1fr)_minmax(170px,auto)_auto] items-center gap-3 rounded-lg border border-white/15 bg-black/30 p-3 max-md:grid-cols-[auto_1fr]">
        <Avatar name={displayName} />
        <span className="grid min-w-0">
          <strong className="truncate">{displayName}</strong>
          <span className="truncate text-[13px] text-white/65">{member.user.email}</span>
        </span>
        {member.role === "OWNER" ? (
          <span className="min-h-[42px] rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2.5 text-sm font-black max-md:col-span-2">
            {roleLabels.OWNER}
          </span>
        ) : (
          <>
            <form
              action={(formData) =>
                startTransition(async () => {
                  await fetch(`/api/worlds/${worldId}/members/${member.id}`, { body: formData, method: "PATCH" });
                  router.refresh();
                })
              }
              className="contents"
            >
              <select
                aria-label={t("roleAria", { name: displayName })}
                className="min-h-[42px] rounded-lg border border-white/15 bg-black/70 px-3 font-bold outline-none focus:border-[#E100FF]/70 max-md:col-span-2"
                defaultValue={member.role}
                name="role"
                onChange={(event) => event.currentTarget.form?.requestSubmit()}
              >
                <option value="ADMIN">{roleLabels.ADMIN}</option>
                <option value="EDITOR">{roleLabels.EDITOR}</option>
                <option value="VIEWER">{roleLabels.VIEWER}</option>
              </select>
            </form>
            <button
              className="min-h-[42px] rounded-lg border border-white/15 bg-white/[0.06] px-4 font-black max-md:col-span-2"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await fetch(`/api/worlds/${worldId}/members/${member.id}`, { method: "DELETE" });
                  router.refresh();
                })
              }
              type="button"
            >
              {t("remove")}
            </button>
          </>
        )}
      </li>
    );
  }

  return (
    <>
      <article className="rounded-lg border border-white/15 bg-white/[0.055] p-[22px] shadow-[0_22px_54px_rgba(0,0,0,0.26)] backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-[28px] font-black">{t("members")}</h2>
          <button
            className="min-h-[42px] rounded-lg bg-gradient-to-br from-[#E100FF] to-[#FF0040] px-[18px] font-black"
            onClick={() => setInviteOpen(true)}
            type="button"
          >
            {t("invite")}
          </button>
        </div>
        <p className="mb-6 text-[13px] text-white/65">
          {t("roleDescription")}
        </p>
        <div className="grid gap-6">
          {(["OWNER", "ADMIN", "EDITOR", "VIEWER"] as WorldRole[]).map((role) => {
            const grouped = allMembers.filter((member) => member.role === role);
            if (!grouped.length) return null;
            return (
              <section className="grid gap-3" key={role}>
                <h3 className="text-xl font-black">{roleLabels[role]}</h3>
                <ul className="grid gap-2">
                  {grouped.map((member) => (
                    <MemberRow key={member.id} member={member} />
                  ))}
                </ul>
              </section>
            );
          })}
          {invites.length ? (
            <section className="grid gap-3">
              <h3 className="text-xl font-black">{t("pendingInvites")}</h3>
              <ul className="grid gap-2">
                {invites.map((invite) => (
                  <li
                    className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-white/15 bg-black/30 p-3 max-md:items-start max-md:flex-col"
                    key={invite.id}
                  >
                    <span className="grid">
                      <strong>{invite.email}</strong>
                      <span className="text-[13px] text-white/65">{roleLabels[invite.role]}</span>
                    </span>
                    <button
                      className="min-h-[38px] rounded-lg border border-white/15 bg-white/[0.06] px-4 font-black"
                      onClick={() =>
                        startTransition(async () => {
                          await fetch(`/api/worlds/${worldId}/invites/${invite.id}`, { method: "DELETE" });
                          router.refresh();
                        })
                      }
                      type="button"
                    >
                      {t("cancelInvite")}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </article>

      {inviteOpen ? (
        <div
          aria-labelledby="invite-title"
          aria-modal="true"
          className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-5"
          onClick={() => setInviteOpen(false)}
          role="dialog"
        >
          <form
            action={(formData) =>
              startTransition(async () => {
                await fetch(`/api/worlds/${worldId}/members`, { body: formData, method: "POST" });
                setInviteOpen(false);
                router.refresh();
              })
            }
            className="grid w-full max-w-[480px] gap-5 rounded-lg border border-white/15 bg-[#0c0c0e] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.52)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div>
              <p className="mb-2 inline-flex rounded-full border border-[#E100FF]/35 bg-[#E100FF]/10 px-2.5 py-1 text-xs font-black uppercase">
                <EntityLabel name="invite" />
              </p>
              <h2 className="text-[28px] font-black" id="invite-title">
                {t("inviteMember")}
              </h2>
            </div>
            <label className="grid gap-2 font-black">
              {t("email")}
              <input
                className="min-h-[52px] rounded-lg border border-white/15 bg-black/50 px-4 outline-none focus:border-[#E100FF]/70"
                name="email"
                placeholder="creator@zac.app"
                required
                type="email"
              />
            </label>
            <label className="grid gap-2 font-black">
              {t("role")}
              <select
                className="min-h-[52px] rounded-lg border border-white/15 bg-black/50 px-4 outline-none focus:border-[#E100FF]/70"
                defaultValue="EDITOR"
                name="role"
              >
                <option value="ADMIN">{roleLabels.ADMIN}</option>
                <option value="EDITOR">{roleLabels.EDITOR}</option>
                <option value="VIEWER">{roleLabels.VIEWER}</option>
              </select>
            </label>
            <div className="flex justify-end gap-2.5">
              <button
                className="min-h-[42px] rounded-lg border border-white/15 bg-white/[0.06] px-[18px] font-black"
                onClick={() => setInviteOpen(false)}
                type="button"
              >
                {t("cancel")}
              </button>
              <button
                className="min-h-[42px] rounded-lg bg-gradient-to-br from-[#E100FF] to-[#FF0040] px-[18px] font-black disabled:opacity-50"
                disabled={pending}
                type="submit"
              >
                {pending ? t("sharing") : t("shareAction")}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
