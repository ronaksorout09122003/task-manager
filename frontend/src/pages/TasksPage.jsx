import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../api/client";
import { projectsApi, tasksApi, usersApi } from "../api/resources";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import TaskFilters from "../components/TaskFilters";
import TaskFormModal from "../components/TaskFormModal";
import TaskTable from "../components/TaskTable";
import { useAuth } from "../context/AuthContext";

export default function TasksPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignedToId: "",
    overdue: "",
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const [taskResponse, userResponse] = await Promise.all([
        tasksApi.list(filters),
        isAdmin ? usersApi.list() : Promise.resolve({ data: { users: [] } }),
      ]);
      setTasks(taskResponse.data.tasks);
      setUsers(userResponse.data.users);
      setError("");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filters.status, filters.priority, filters.assignedToId, filters.overdue]);

  const openEditTask = async (task) => {
    if (!isAdmin) return;

    setIsSaving(true);
    try {
      const { data } = await projectsApi.members(task.project.id);
      setMembers(data.members);
      setSelectedTask(task);
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  const submitTask = async (payload) => {
    setIsSaving(true);
    try {
      await tasksApi.update(selectedTask.id, payload);
      toast.success("Task updated");
      setSelectedTask(null);
      await loadTasks();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  const updateTaskStatus = async (task, status) => {
    try {
      const { data } = await tasksApi.updateStatus(task.id, status);
      setTasks((current) => current.map((item) => (item.id === task.id ? data.task : item)));
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
      await loadTasks();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading tasks" />;
  if (error) return <EmptyState title="Tasks could not load" description={error} />;

  return (
    <div>
      <PageHeader
        title="Tasks"
        description={
          isAdmin
            ? "Filter and manage all project tasks."
            : "Your assigned tasks across accessible projects."
        }
      />
      <div className="mb-5">
        <TaskFilters filters={filters} onChange={setFilters} users={users} isAdmin={isAdmin} />
      </div>
      <TaskTable
        tasks={tasks}
        currentUser={user}
        onEdit={openEditTask}
        onDelete={setTaskToDelete}
        onStatusChange={updateTaskStatus}
      />
      <TaskFormModal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        members={members}
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
    </div>
  );
}
