"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { InviteMemberForm } from "@/components/landing-portal/invite-member-form";
import {
  removeProjectMemberForApp,
  updateProjectMemberRoleForApp,
  type ProjectAccessSettings,
} from "@/lib/landing-portal";
import { isLocalPortalWorkbenchClientEnabled } from "@/lib/local-portal-workbench";

type Member = ProjectAccessSettings["members"][number];

export function ProjectAccessMembersView({
  settings,
}: {
  settings: ProjectAccessSettings;
}) {
  const router = useRouter();
  const sandboxEnabled = isLocalPortalWorkbenchClientEnabled();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsState, setSettingsState] = useState(settings);

  useEffect(() => {
    setSettingsState(settings);
  }, [settings]);

  // Default fallback if members array is empty or undefined
  const members = useMemo(() => settingsState.members ?? [], [settingsState.members]);
  const activeOwners = useMemo(
    () => members.filter((member) => member.role === "OWNER").length,
    [members],
  );

  // 1. Search Filter Feature
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const normalizedQuery = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.email.toLowerCase().includes(normalizedQuery) ||
        (m.fullName && m.fullName.toLowerCase().includes(normalizedQuery)),
    );
  }, [members, searchQuery]);

  // 2. Role Distribution Feature
  const roleStats = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach((m) => {
      counts[m.role] = (counts[m.role] || 0) + 1;
    });
    return counts;
  }, [members]);

  function runAction(task: () => Promise<void>) {
    startTransition(async () => {
      await task();
      if (!sandboxEnabled) {
        router.refresh();
      }
    });
  }

  const getInitials = (fullName?: string | null, email?: string) => {
    if (fullName) return fullName.substring(0, 2).toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return "U";
  };

  const getRoleBadgeTone = (role: string) => {
    if (role === "OWNER") return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
    if (role === "VIEWER") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="px-6 py-6 border-b border-[var(--portal-border)] bg-[var(--portal-surface-soft)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--portal-foreground)]">Team Access</h2>
            <p className="text-sm text-[var(--portal-muted)] mt-1">Manage who can view or edit this project.</p>
          </div>
        </div>

        {/* Dynamic Stats Row */}
        {members.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--portal-muted)]">Distribution:</span>
            {Object.entries(roleStats).map(([role, count]) => (
              <div key={role} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--portal-foreground)] bg-[var(--portal-surface)] border border-[var(--portal-border)] px-2.5 py-1 rounded-md shadow-sm">
                <span>{count}</span>
                <span className="text-[var(--portal-muted)] font-medium capitalize">{role.toLowerCase()}{count > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Control Bar (Search) */}
      <div className="grid gap-6 border-b border-[var(--portal-border)] p-6 xl:grid-cols-[minmax(280px,360px)_1fr]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">
            Invite member
          </p>
          <InviteMemberForm
            projectId={settingsState.projectId}
            variant="clientPortal"
            onInviteCreated={(invite) => {
              if (sandboxEnabled) {
                setSettingsState((current) => ({
                  ...current,
                  invites: [invite, ...current.invites],
                }));
              }
            }}
          />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-muted)]">
            Search access
          </p>
          <div className="relative mt-4 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[var(--portal-muted)]">search</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface)] text-sm text-[var(--portal-foreground)] placeholder-[var(--portal-muted)]/50 outline-none transition-all focus:border-[var(--portal-foreground)] focus:ring-1 focus:ring-[var(--portal-foreground)] shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Member List */}
      <div className="flex-1 bg-[var(--portal-surface)]">
        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--portal-surface-soft)] border border-[var(--portal-border)] text-[var(--portal-muted)] mb-4">
              <span className="material-symbols-outlined text-[24px]">group_off</span>
            </div>
            <h3 className="text-sm font-semibold text-[var(--portal-foreground)]">No members found</h3>
            <p className="mt-1 text-xs text-[var(--portal-muted)] max-w-xs mx-auto">
              {searchQuery ? "No matching members for your search query." : "You are the only member on this project."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--portal-border)]">
            {filteredMembers.map((member) => {
              const cannotRemoveOrDowngradeLastOwner =
                member.role === "OWNER" && activeOwners <= 1;

              return (
              <li key={member.portalUserId} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 hover:bg-[var(--portal-surface-soft)] transition-colors group">
                <div className="flex items-center gap-4">
                  {/* Generated Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--portal-foreground)] text-sm font-bold text-[var(--portal-surface)] shadow-sm">
                    {getInitials(member.fullName, member.email)}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-semibold text-[var(--portal-foreground)] truncate">
                      {member.fullName || member.email}
                    </p>
                    {member.fullName && (
                      <p className="text-xs text-[var(--portal-muted)] truncate">{member.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Role Badge */}
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeTone(member.role)}`}>
                    {member.role}
                  </div>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${member.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}>
                    {member.status}
                  </div>

                  {member.role !== "OWNER" ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        runAction(async () => {
                          await updateProjectMemberRoleForApp({
                            projectId: settingsState.projectId,
                            memberPortalUserId: member.portalUserId,
                            role: "OWNER",
                          });
                          setSettingsState((current) => ({
                            ...current,
                            members: current.members.map((entry) =>
                              entry.portalUserId === member.portalUserId
                                ? { ...entry, role: "OWNER" }
                                : entry,
                            ),
                          }));
                        })
                      }
                      className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-800 disabled:opacity-40"
                    >
                      Make owner
                    </button>
                  ) : null}
                  {member.role !== "VIEWER" ? (
                    <button
                      type="button"
                      disabled={isPending || cannotRemoveOrDowngradeLastOwner}
                      onClick={() =>
                        runAction(async () => {
                          await updateProjectMemberRoleForApp({
                            projectId: settingsState.projectId,
                            memberPortalUserId: member.portalUserId,
                            role: "VIEWER",
                          });
                          setSettingsState((current) => ({
                            ...current,
                            members: current.members.map((entry) =>
                              entry.portalUserId === member.portalUserId
                                ? { ...entry, role: "VIEWER" }
                                : entry,
                            ),
                          }));
                        })
                      }
                      className="text-[10px] font-bold uppercase tracking-widest text-[var(--portal-muted)] hover:text-[var(--portal-foreground)] disabled:opacity-40"
                    >
                      Make viewer
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={isPending || cannotRemoveOrDowngradeLastOwner}
                    onClick={() =>
                      runAction(async () => {
                        await removeProjectMemberForApp({
                          projectId: settingsState.projectId,
                          memberPortalUserId: member.portalUserId,
                        });
                        setSettingsState((current) => ({
                          ...current,
                          members: current.members.filter(
                            (entry) => entry.portalUserId !== member.portalUserId,
                          ),
                        }));
                      })
                    }
                    className="text-[10px] font-bold uppercase tracking-widest text-rose-600 hover:text-rose-800 disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
