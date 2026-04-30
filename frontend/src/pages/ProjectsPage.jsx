import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { getErrorMessage } from "../api/client";
import { projectsApi } from "../api/resources";
import Badge from "../components/Badge";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import ProgressBar from "../components/ProgressBar";
import ProjectFormModal from "../components/ProjectFormModal";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/date";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formProject, setFormProject] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const { data } = await projectsApi.list();
      setProjects(data.projects);
      setError("");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openCreate = () => {
    setFormProject(null);
    setIsFormOpen(true);
  };

  const openEdit = (project) => {
    setFormProject(project);
    setIsFormOpen(true);
  };

  const submitProject = async (payload) => {
    setIsSaving(true);
    try {
      if (formProject) {
        await projectsApi.update(formProject.id, payload);
        toast.success("Project updated");
      } else {
        await projectsApi.create(payload);
        toast.success("Project created");
      }
      setIsFormOpen(false);
      await loadProjects();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProject = async () => {
    if (!projectToDelete) return;
    setIsSaving(true);
    try {
      await projectsApi.remove(projectToDelete.id);
      toast.success("Project deleted");
      setProjectToDelete(null);
      await loadProjects();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading projects" />;
  if (error) return <EmptyState title="Projects could not load" description={error} />;

  return (
    <div>
      <PageHeader
        title="Projects"
        description={
          isAdmin
            ? "Create, update, staff, and track every project."
            : "Projects where you are a team member."
        }
        actions={
          isAdmin ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              New project
            </Button>
          ) : null
        }
      />
      {projects.length ? (
        <div className="overflow-hidden rounded-xl border border-slateLine bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slateLine">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                    Project
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                    Dates
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-normal text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slateLine">
                {projects.map((project) => (
                  <tr key={project.id} className="bg-white">
                    <td className="max-w-md px-4 py-4">
                      <Link
                        to={`/projects/${project.id}`}
                        className="font-semibold text-ink hover:text-ocean"
                      >
                        {project.title}
                      </Link>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                        {project.description || "No description"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge value={project.status} />
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">
                      <p>Start {formatDate(project.startDate)}</p>
                      <p className="text-slate-500">Due {formatDate(project.dueDate)}</p>
                    </td>
                    <td className="min-w-52 px-4 py-4">
                      <ProgressBar
                        value={project.progress}
                        label={`${project.taskSummary.completed}/${project.taskSummary.total} tasks`}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/projects/${project.id}`}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-slateLine bg-white px-3 text-sm font-semibold text-ink transition hover:bg-slate-50"
                        >
                          Open
                        </Link>
                        {isAdmin ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 px-0"
                              onClick={() => openEdit(project)}
                              aria-label="Edit project"
                            >
                              <Edit3 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 px-0 text-rose-600 hover:bg-rose-50"
                              onClick={() => setProjectToDelete(project)}
                              aria-label="Delete project"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No projects yet"
          description={
            isAdmin
              ? "Create the first project to start assigning work."
              : "You have not been added to a project yet."
          }
          action={isAdmin ? <Button onClick={openCreate}>Create project</Button> : null}
        />
      )}
      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        project={formProject}
        onSubmit={submitProject}
        isLoading={isSaving}
      />
      <ConfirmDialog
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        onConfirm={deleteProject}
        isLoading={isSaving}
        title="Delete project?"
        description={`This will delete ${projectToDelete?.title || "the project"} and its tasks.`}
      />
    </div>
  );
}
