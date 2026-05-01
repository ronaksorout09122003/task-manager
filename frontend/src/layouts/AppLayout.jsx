import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckSquare, FolderKanban, KeyRound, LayoutDashboard, LogOut, Menu, Users, X } from "lucide-react";
import { getErrorMessage } from "../api/client";
import Badge from "../components/Badge";
import Button from "../components/Button";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { useAuth } from "../context/AuthContext";
import { classNames } from "../utils/classNames";
import { isAdmin, isSuperAdmin } from "../utils/roles";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", to: "/projects", icon: FolderKanban },
  { label: "Tasks", to: "/tasks", icon: CheckSquare },
  { label: "Team", to: "/team", icon: Users, adminOnly: true },
];

function SidebarContent({ onNavigate }) {
  const { user, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const submitPasswordChange = async (payload) => {
    setIsPasswordSaving(true);
    try {
      await changePassword(payload);
      toast.success("Password updated");
      setPasswordModalOpen(false);
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
      throw requestError;
    } finally {
      setIsPasswordSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slateLine px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean text-lg font-black text-white">
            TT
          </div>
          <div>
            <p className="text-base font-bold text-ink">Team Task</p>
            <p className="text-sm text-slate-500">Manager</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin(user))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                classNames(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                  isActive ? "bg-ocean text-white shadow-sm" : "text-slate-700 hover:bg-slate-100",
                )
              }
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
      </nav>
      <div className="border-t border-slateLine p-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="truncate text-sm font-bold text-ink">{user?.name}</p>
          <Badge value={user?.role} className="mt-2" />
        </div>
        <Button
          variant="ghost"
          className="mt-3 w-full justify-start"
          onClick={() => setPasswordModalOpen(true)}
        >
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Change password
        </Button>
        <Button variant="ghost" className="mt-3 w-full justify-start" onClick={handleLogout}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </Button>
        <ChangePasswordModal
          isOpen={passwordModalOpen}
          onClose={() => setPasswordModalOpen(false)}
          onSubmit={submitPasswordChange}
          isLoading={isPasswordSaving}
        />
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-mist">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slateLine bg-white lg:block">
        <SidebarContent />
      </aside>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slateLine bg-white/95 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 px-0"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
          <div>
            <p className="text-sm font-bold text-ink">Team Task Manager</p>
            <p className="text-xs text-slate-500">
              {isSuperAdmin(user)
                ? "Super admin workspace"
                : isAdmin(user)
                  ? "Admin workspace"
                  : "Member workspace"}
            </p>
          </div>
        </div>
        <Badge value={user?.role} />
      </header>
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-ink/40"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-80 max-w-[86vw] bg-white shadow-soft">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-3 top-3 z-10 h-9 w-9 px-0"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
