import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Edit3, Plus, Trash2 } from "lucide-react";
import { getErrorMessage } from "../api/client";
import { projectsApi, tasksApi, usersApi } from "../api/resources";
import Badge from "../components/Badge";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import MemberManager from "../components/MemberManager";
import PageHeader from "../components/PageHeader";
import ProgressBar from "../components/ProgressBar";
import ProjectFormModal from "../components/ProjectFormModal";
import TaskFormModal from "../components/TaskFormModal";
import TaskTable from "../components/TaskTable";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/date";
import { isAdmin as hasAdminAccess } from "../utils/roles";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = hasAdminAccess(user);
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const loadProject = async () => {
    setIsLoading(true);
    try {
      const [projectResponse, usersResponse] = await Promise.all([
        projectsApi.getById(id),
        isAdmin ? usersApi.list() : Promise.resolve({ data: { users: [] } }),
      ]);
      setProject(projectResponse.data.project);
      setUsers(usersResponse.data.users);
      setError("");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const updateProject = async (payload) => {
    setIsSaving(true);
    try {
      const { data } = await projectsApi.update(id, payload);
      setProject(data.project);
      setProjectModalOpen(false);
      toast.success("Project updated");
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProject = async () => {
    setIsSaving(true);
    try {
      await projectsApi.remove(id);
      toast.success("Project deleted");
      navigate("/projects");
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  const addMember = async (userId) => {
    setIsSaving(true);
    try {
      await projectsApi.addMember(id, userId);
      toast.success("Member added");
      await loadProject();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  const removeMember = async (userId) => {
    setIsSaving(true);
    try {
      await projectsApi.removeMember(id, userId);
      toast.success("Member removed");
      await loadProject();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  const openCreateTask = () => {
    setSelectedTask(null);
    setTaskModalOpen(true);
  };

  const submitTask = async (payload) => {
    setIsSaving(true);
    try {
      if (selectedTask) {
        await tasksApi.update(selectedTask.id, payload);
        toast.success("Task updated");
      } else {
        await tasksApi.create(id, payload);
        toast.success("Task created");
      }
      setTaskModalOpen(false);
      await loadProject();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  const updateTaskStatus = async (task, status) => {
    try {
      const { data } = await tasksApi.updateStatus(task.id, status);
      setProject((current) => ({
        ...current,
        tasks: current.tasks.map((item) => (item.id === task.id ? data.task : item)),
      }));
      toast.success("Task status updated");
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    }
  };

  const deleteTask = async () => {
    if (!taskToDelete) return;
    setIsSaving(true);
    try {
      await tasksApi.remove(taskToDelete.id);
      toast.success("Task deleted");
      setTaskToDelete(null);
      await loadProject();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading project" />;
  if (error) return <EmptyState title="Project could not load" description={error} />;
  if (!project) return <EmptyState title="Project not found" />;

  return (
    <div>
      <Link
        to="/projects"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-ocean"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to projects
      </Link>
      <PageHeader
        title={project.title}
        description={project.description}
        actions={
          isAdmin ? (
            <>
              <Button variant="secondary" onClick={() => setProjectModalOpen(true)}>
                <Edit3 className="h-4 w-4" aria-hidden="true" />
                Edit project
              </Button>
              <Button variant="danger" onClick={() => setProjectToDelete(project)}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </Button>
            </>
          ) : null
        }
      />
      <section className="mb-6 grid gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slateLine bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Badge value={project.status} />
            <p className="text-sm font-semibold text-slate-600">
              {project.taskSummary.completed}/{project.taskSummary.total} tasks complete
            </p>
          </div>
          <ProgressBar value={project.progress} />
        </div>
        <div className="rounded-xl border border-slateLine bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Start date</p>
          <p className="mt-2 text-lg font-bold text-ink">{formatDate(project.startDate)}</p>
        </div>
        <div className="rounded-xl border border-slateLine bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">Due date</p>
          <p className="mt-2 text-lg font-bold text-ink">{formatDate(project.dueDate)}</p>
        </div>
      </section>
      <div className="space-y-6">
        <MemberManager
          members={project.members}
          users={users}
          isAdmin={isAdmin}
          onAdd={addMember}
          onRemove={removeMember}
          isLoading={isSaving}
          lockedUserId={project.createdById}
        />
        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Project tasks</h2>
              <p className="mt-1 text-sm text-slate-600">
                {isAdmin ? "Manage every task in this project." : "Your assigned project tasks."}
              </p>
            </div>
            {isAdmin ? (
              <Button onClick={openCreateTask}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                New task
              </Button>
            ) : null}
          </div>
          <TaskTable
            tasks={project.tasks}
            currentUser={user}
            showProject={false}
            onEdit={(task) => {
              setSelectedTask(task);
              setTaskModalOpen(true);
            }}
            onDelete={setTaskToDelete}
            onStatusChange={updateTaskStatus}
          />
        </section>
      </div>
      <ProjectFormModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        project={project}
        onSubmit={updateProject}
        isLoading={isSaving}
      />
      <TaskFormModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        task={selectedTask}
        members={project.members}
        onSubmit={submitTask}
        isLoading={isSaving}
      />
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={deleteTask}
        isLoading={isSaving}
        title="Delete task?"
        description={`This will delete ${taskToDelete?.title || "the task"}.`}
      />
      <ConfirmDialog
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        onConfirm={deleteProject}
        isLoading={isSaving}
        title="Delete project?"
        description={`This will delete ${projectToDelete?.title || "the project"} and all related tasks.`}
      />
    </div>
  );
}
