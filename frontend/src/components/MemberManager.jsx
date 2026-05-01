import { useMemo, useState } from "react";
import { UserPlus, X } from "lucide-react";
import Badge from "./Badge";
import Button from "./Button";
import { SelectInput } from "./FormControls";

export default function MemberManager({
  members = [],
  users = [],
  isAdmin,
  onAdd,
  onRemove,
  isLoading = false,
  lockedUserId,
}) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const memberIds = useMemo(
    () => new Set(members.map((member) => member.userId || member.user?.id)),
    [members],
  );
  const availableUsers = users.filter((user) => !memberIds.has(user.id));

  const addMember = async () => {
    if (!selectedUserId) return;
    await onAdd(selectedUserId);
    setSelectedUserId("");
  };

  return (
    <div className="rounded-xl border border-slateLine bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink">Project team</h2>
          <p className="mt-1 text-sm text-slate-600">
            Members can view the project and their assigned work.
          </p>
        </div>
        {isAdmin ? (
          <div className="flex min-w-0 gap-2 sm:min-w-96">
            <SelectInput
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
            >
              <option value="">Add team member</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </SelectInput>
            <Button onClick={addMember} disabled={!selectedUserId} isLoading={isLoading}>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Add
            </Button>
          </div>
        ) : null}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-slateLine bg-slate-50 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{member.user.name}</p>
              <Badge value={member.user.role} className="mt-2" />
            </div>
            {isAdmin && member.user.id !== lockedUserId ? (
              <button
                type="button"
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-3 text-xs font-bold text-rose-700 transition hover:border-rose-200 hover:bg-rose-100"
                onClick={() => onRemove(member.user.id)}
                aria-label={`Remove ${member.user.name}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
