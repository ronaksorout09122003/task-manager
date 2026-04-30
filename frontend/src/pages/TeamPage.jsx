import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getErrorMessage } from "../api/client";
import { usersApi } from "../api/resources";
import Badge from "../components/Badge";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import { TextInput } from "../components/FormControls";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";

export default function TeamPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
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

  if (isLoading) return <LoadingSpinner label="Loading team" />;
  if (error) return <EmptyState title="Team could not load" description={error} />;

  return (
    <div>
      <PageHeader
        title="Team"
        description="Admin-only user directory for assigning project members."
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
        <div className="overflow-hidden rounded-xl border border-slateLine bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slateLine">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                    Role
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
                      <Badge value={teamUser.role} />
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
      ) : (
        <EmptyState title="No users found" description="Try another name." />
      )}
    </div>
  );
}
