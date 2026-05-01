import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getErrorMessage } from "../api/client";
import { usersApi } from "../api/resources";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";

export default function AdminMembersPage() {
  const { adminId } = useParams();
  const [admin, setAdmin] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadMembers() {
      setIsLoading(true);
      try {
        const { data } = await usersApi.getAdminMembers(adminId);
        if (!isMounted) return;
        setAdmin(data.admin);
        setMembers(data.members);
        setError("");
      } catch (requestError) {
        if (isMounted) setError(getErrorMessage(requestError));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, [adminId]);

  if (isLoading) return <LoadingSpinner label="Loading members" />;
  if (error) return <EmptyState title="Members could not load" description={error} />;

  return (
    <div>
      <Link
        to="/team"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-ocean"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to admins
      </Link>
      <PageHeader
        title={admin ? `${admin.name}'s members` : "Admin members"}
        description="Members created under this admin account."
      />
      {members.length ? (
        <>
          <div className="grid gap-3 md:hidden">
            {members.map((member) => (
              <article
                key={member.id}
                className="rounded-xl border border-slateLine bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="break-words text-base font-bold text-ink">{member.name}</p>
                  <Badge value={member.role} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-normal text-slate-500">
                      Projects
                    </p>
                    <p className="mt-1 text-lg font-bold text-ink">
                      {member._count?.projectMemberships || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-normal text-slate-500">
                      Assigned tasks
                    </p>
                    <p className="mt-1 text-lg font-bold text-ink">
                      {member._count?.assignedTasks || 0}
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
                      Member
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
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-ink">{member.name}</p>
                      </td>
                      <td className="px-4 py-4">
                        <Badge value={member.role} />
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                        {member._count?.projectMemberships || 0}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                        {member._count?.assignedTasks || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <EmptyState title="No members yet" description="This admin has not created members yet." />
      )}
    </div>
  );
}
