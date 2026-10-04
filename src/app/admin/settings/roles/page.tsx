"use client";

import { Suspense, useState } from "react";
import { Check, Lock, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { adminUsers, RESOURCES } from "@/lib/data/people";
import type { Permission } from "@/lib/types";
import { useQueryTab } from "@/lib/use-query-tab";
import { cn } from "@/lib/utils";
import { Card, PageHeader } from "@/components/ui/primitives";
import { Tabs } from "@/components/ui/disclosure";
import { useToast } from "@/components/ui/toast";

const PERMS: Permission[] = ["View", "Create", "Edit", "Delete", "Approve", "Export"];

function Inner() {
  const { state, actions } = useStore();
  const toast = useToast();
  const [tab, setTab] = useQueryTab("tab", ["roles", "permissions"] as const, "roles");
  const [roleId, setRoleId] = useState(state.roles[2]?.id ?? "admin");
  const role = state.roles.find((r) => r.id === roleId)!;
  const locked = role.id === "super-admin";

  const toggle = (res: string, p: Permission) => {
    if (locked) return;
    const cur = role.permissions[res] ?? [];
    const next = cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p];
    actions.setRolePermissions(role.id, res, next);
  };

  return (
    <>
      <PageHeader title="Roles & permissions" description="Control what each role can see and do. Changes apply on the user's next action." />
      <Tabs className="mb-6" value={tab} onChange={setTab} tabs={[{ value: "roles", label: "Roles", count: state.roles.length }, { value: "permissions", label: "Permission matrix" }]} />
      {tab === "roles" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.roles.map((r) => {
            const members = adminUsers.filter((u) => u.roleId === r.id);
            const count = Object.values(r.permissions).reduce((s, p) => s + p.length, 0);
            return (
              <Card key={r.id} className="flex flex-col p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary-50 text-primary">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-semibold">{r.name}</h2>
                    <p className="text-xs text-muted">
                      {members.length} member{members.length === 1 ? "" : "s"} · {count} permissions
                    </p>
                  </div>
                </div>
                <p className="mt-3 flex-1 text-sm text-muted">{r.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {Object.keys(r.permissions).map((res) => (
                    <span key={res} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs">
                      {res}
                    </span>
                  ))}
                </div>
                <button onClick={() => (setRoleId(r.id), setTab("permissions"))} className="mt-4 self-start text-sm font-medium text-secondary hover:text-primary">
                  Edit permissions →
                </button>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-4">
            {state.roles.map((r) => (
              <button key={r.id} onClick={() => setRoleId(r.id)} aria-pressed={r.id === roleId} className={cn("rounded-lg px-3 py-1.5 text-sm font-medium", r.id === roleId ? "bg-primary text-white" : "bg-slate-100 text-ink hover:bg-slate-200")}>
                {r.name}
              </button>
            ))}
          </div>
          {locked && (
            <p className="flex items-center gap-2 border-b border-line bg-slate-50 px-5 py-3 text-sm text-muted">
              <Lock className="size-4" /> Super Admin always has every permission.
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <caption className="sr-only">Permissions for {role.name}</caption>
              <thead>
                <tr className="border-b border-line bg-slate-50/70 text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 text-left font-semibold">Module</th>
                  {PERMS.map((p) => (
                    <th key={p} className="px-3 py-3 font-semibold">
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {RESOURCES.map((res) => (
                  <tr key={res}>
                    <th scope="row" className="px-5 py-3 text-left font-medium">
                      {res}
                    </th>
                    {PERMS.map((p) => {
                      const on = (role.permissions[res] ?? []).includes(p);
                      return (
                        <td key={p} className="px-3 py-3 text-center">
                          <button
                            onClick={() => toggle(res, p)}
                            disabled={locked}
                            role="checkbox"
                            aria-checked={on}
                            aria-label={`${role.name}: ${p} ${res}`}
                            className={cn("mx-auto grid size-6 place-items-center rounded-md border transition-colors disabled:cursor-not-allowed", on ? "border-primary bg-primary text-white" : "border-slate-300 bg-white hover:border-primary")}
                          >
                            {on && <Check className="size-3.5" strokeWidth={3} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!locked && (
            <div className="flex justify-end border-t border-line px-5 py-3">
              <button onClick={() => toast({ title: `${role.name} permissions saved` })} className="h-10 rounded-[10px] bg-primary px-4 text-sm font-medium text-white hover:bg-primary-700">
                Save changes
              </button>
            </div>
          )}
        </Card>
      )}
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
