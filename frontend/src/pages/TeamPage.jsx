import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../api/client";
import { usersApi } from "../api/resources";
import Badge from "../components/Badge";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import { SelectInput, TextInput } from "../components/FormControls";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import UserFormModal from "../components/UserFormModal";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS } from "../utils/constants";
import { isSuperAdmin } from "../utils/roles";

const roleOptions = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Admin" },
  { value: "MEMBER", label: "Member" },
];
const memberRoleOptions = [{ value: "MEMBER", label: "Member" }];

const roleLabel = (role) => ROLE_LABELS[role] || role;
const roleSentence = (role) => {
  if (role === "SUPER_ADMIN") return "a super admin";
  if (role === "ADMIN") return "an admin";
  return "a member";
};

function RoleSelect({ teamUser, disabled, onChange, className = "" }) {
  return (
    <SelectInput
      className={`mt-0 ${className}`}
      value={teamUser.role}
      onChange={(event) => onChange(teamUser, event.target.value)}
      disabled={disabled}
      aria-label={`Change app role for ${teamUser.name}`}
    >
      {roleOptions.map((role) => (
        <option key={role.value} value={role.value}>
          {role.label}
        </option>
      ))}
    </SelectInput>
  );
}

export default function TeamPage() {
  const { user, refreshUser } = useAuth();
  const canManageRoles = isSuperAdmin(user);
  const allowedCreateRoles = canManageRoles ? roleOptions : memberRoleOptions;
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRoleSaving, setIsRoleSaving] = useState(false);
  const [isUserSaving, setIsUserSaving] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [roleChange, setRoleChange] = useState(null);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await usersApi.list(search);
      setUsers(data.users);
      setError("");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    loadUsers();
  };

  const requestRoleChange = (teamUser, nextRole) => {
    if (!canManageRoles) return;
    if (!teamUser || teamUser.role === nextRole) return;
    setRoleChange({ user: teamUser, role: nextRole });
  };

  const createUser = async (payload) => {
    setIsUserSaving(true);
    try {
      const { data } = await usersApi.create(payload);
      setUsers((current) => [...current, data.user].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success("User created");
      setIsUserModalOpen(false);
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setIsUserSaving(false);
    }
  };

  const confirmRoleChange = async () => {
    if (!roleChange) return;

    setIsRoleSaving(true);
    try {
      const { data } = await usersApi.updateRole(roleChange.user.id, roleChange.role);
      setUsers((current) =>
        current.map((teamUser) => (teamUser.id === data.user.id ? data.user : teamUser)),
      );

      if (data.user.id === user?.id) {
        await refreshUser();
      }

      toast.success("Role updated");
      setRoleChange(null);
    } catch (requestError) {
      setRoleChange(null);
      toast.error(getErrorMessage(requestError));
    } finally {
      setIsRoleSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading team" />;
  if (error) return <EmptyState title="Team could not load" description={error} />;

  return (
    <div>
      <PageHeader
        title="Team"
        description="Manage app-wide roles and review project participation."
        actions={
          <Button onClick={() => setIsUserModalOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add user
          </Button>
        }
      />
      <form
        className="mb-5 flex flex-col gap-3 rounded-xl border border-slateLine bg-white p-4 shadow-sm sm:flex-row"
        onSubmit={submitSearch}
      >
        <TextInput
          placeholder="Search by name"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="mt-0"
        />
        <Button type="submit">
          <Search className="h-4 w-4" aria-hidden="true" />
          Search
        </Button>
      </form>
      {users.length ? (
        <>
          <div className="grid gap-3 md:hidden">
            {users.map((teamUser) => (
              <article
                key={teamUser.id}
                className="rounded-xl border border-slateLine bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-base font-bold text-ink">{teamUser.name}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-normal text-slate-500">
                      App role
                    </p>
                  </div>
                  <Badge value={teamUser.role} />
                </div>

                <div className="mt-4">
                  {canManageRoles ? (
                    <RoleSelect
                      teamUser={teamUser}
                      disabled={isRoleSaving}
                      onChange={requestRoleChange}
                      className="w-full"
                    />
                  ) : (
                    <div className="rounded-lg border border-slateLine bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                      {roleLabel(teamUser.role)}
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-normal text-slate-500">
                      Projects
                    </p>
                    <p className="mt-1 text-lg font-bold text-ink">
                      {teamUser._count?.projectMemberships || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-normal text-slate-500">
                      Assigned tasks
                    </p>
                    <p className="mt-1 text-lg font-bold text-ink">
                      {teamUser._count?.assignedTasks || 0}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-slateLine bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slateLine">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                      App role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                      Projects
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                      Assigned tasks
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slateLine">
                  {users.map((teamUser) => (
                    <tr key={teamUser.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-ink">{teamUser.name}</p>
                      </td>
                      <td className="px-4 py-4">
                        {canManageRoles ? (
                          <RoleSelect
                            teamUser={teamUser}
                            disabled={isRoleSaving}
                            onChange={requestRoleChange}
                            className="w-44"
                          />
                        ) : (
                          <Badge value={teamUser.role} />
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                        {teamUser._count?.projectMemberships || 0}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                        {teamUser._count?.assignedTasks || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <EmptyState title="No users found" description="Try another name." />
      )}
      <ConfirmDialog
        isOpen={Boolean(roleChange)}
        onClose={() => setRoleChange(null)}
        onConfirm={confirmRoleChange}
        isLoading={isRoleSaving}
        title="Change user role?"
        description={
          roleChange
            ? `${roleChange.user.name} will become ${roleSentence(roleChange.role)}.`
            : ""
        }
        confirmLabel="Change role"
        confirmVariant="primary"
      />
      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={createUser}
        roleOptions={allowedCreateRoles}
        isLoading={isUserSaving}
      />
    </div>
  );
}
