"use client";

import { useState } from "react";
import { MoreHorizontal, UserPlus } from "lucide-react";
import { useStore } from "@/lib/store";
import { adminUsers as seed } from "@/lib/data/people";
import type { AdminUser } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Avatar, Card, PageHeader } from "@/components/ui/primitives";
import { Dropdown } from "@/components/ui/disclosure";
import { Input, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/overlay";
import { useToast } from "@/components/ui/toast";

export default function UsersPage() {
  const { state } = useStore();
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>(seed);
  const [invite, setInvite] = useState(false);
  const [f, setF] = useState({ name: "", email: "", roleId: "support-agent" });
  const role = (id: string) => state.roles.find((r) => r.id === id)?.name ?? id;

  return (
    <>
      <PageHeader title="Staff users" description="Invite teammates and manage their roles." actions={<Button onClick={() => setInvite(true)}><UserPlus /> Invite user</Button>} />
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-slate-50/70 text-xs uppercase tracking-wide text-muted">
              {["User", "Role", "Status", "Last active", ""].map((h) => (
                <th key={h} className="px-5 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-3">
                    <Avatar src={u.avatar || undefined} name={u.name} size={34} />
                    <span>
                      <span className="block font-medium">{u.name}</span>
                      <span className="block text-xs text-muted">{u.email}</span>
                    </span>
                  </span>
                </td>
                <td className="px-5 py-3">
                  <Select aria-label={`Role for ${u.name}`} value={u.roleId} onChange={(e) => (setUsers(users.map((x) => (x.id === u.id ? { ...x, roleId: e.target.value } : x))), toast({ title: `${u.name} is now ${role(e.target.value)}` }))} options={state.roles.map((r) => ({ value: r.id, label: r.name }))} className="h-9 w-44" />
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={u.status} />
                </td>
                <td className="px-5 py-3 text-muted">{timeAgo(u.lastActive)}</td>
                <td className="px-5 py-3 text-right">
                  <Dropdown
                    label={`Actions for ${u.name}`}
                    trigger={<span className="grid size-8 place-items-center rounded-lg text-muted hover:bg-slate-100"><MoreHorizontal className="size-4" /></span>}
                    items={[
                      { label: "Reset password", onClick: () => toast({ title: "Reset link sent", description: u.email }) },
                      { label: "Revoke sessions", onClick: () => toast({ title: `${u.name} signed out everywhere` }) },
                      { divider: true, label: "" },
                      { label: u.status === "Disabled" ? "Enable" : "Disable", danger: u.status !== "Disabled", onClick: () => setUsers(users.map((x) => (x.id === u.id ? { ...x, status: x.status === "Disabled" ? "Active" : "Disabled" } : x))) },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal
        open={invite}
        onClose={() => setInvite(false)}
        title="Invite a teammate"
        footer={
          <>
            <Button variant="outline" onClick={() => setInvite(false)}>Cancel</Button>
            <Button
              disabled={!f.name || !/^\S+@\S+\.\S+$/.test(f.email)}
              onClick={() => {
                setUsers([...users, { id: `A-${Date.now()}`, name: f.name, email: f.email, avatar: "", roleId: f.roleId, status: "Invited", lastActive: new Date().toISOString() }]);
                setInvite(false);
                setF({ name: "", email: "", roleId: "support-agent" });
                toast({ title: "Invitation sent", description: f.email });
              }}
            >
              Send invite
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <Input label="Work email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="name@voyara.travel" />
          <Select label="Role" value={f.roleId} onChange={(e) => setF({ ...f, roleId: e.target.value })} options={state.roles.map((r) => ({ value: r.id, label: r.name }))} hint={state.roles.find((r) => r.id === f.roleId)?.description} />
        </div>
      </Modal>
    </>
  );
}
