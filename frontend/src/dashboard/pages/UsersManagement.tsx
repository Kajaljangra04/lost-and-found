import { useState } from "react";
import { FaTrash, FaSearch, FaShieldAlt, FaUser, FaBan } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useGetAllUsersQuery,
  useBlockUserMutation,
  useChangeUserRoleMutation,
  useSoftDeleteUserMutation,
} from "../../redux/api/api";

interface ApiUser {
  id: string;
  username: string;
  email: string;
  activated: boolean;
  password: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
  userImg: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  createdAt: string;
  lastLogin?: string;
  itemsReported: number;
  claimsMade: number;
  profileImage?: string;
}

const UsersManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const { data: allUsersData, isLoading } = useGetAllUsersQuery(undefined);
  const [blockUser] = useBlockUserMutation();
  const [changeUserRole] = useChangeUserRoleMutation();
  const [softDeleteUser] = useSoftDeleteUserMutation();

  // Transform API user data to match our interface
  const transformUser = (apiUser: ApiUser): User => ({
    id: apiUser.id,
    name: apiUser.username,
    email: apiUser.email,
    role: apiUser.role,
    status: apiUser.activated ? "ACTIVE" : "SUSPENDED",
    createdAt: apiUser.createdAt,
    lastLogin: undefined,
    itemsReported: 0,
    claimsMade: 0,
    profileImage: apiUser.userImg || undefined,
  });

  const users = allUsersData?.data ? allUsersData.data.map(transformUser) : [];

  const filteredUsers = users.filter((user: User) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "ALL" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await changeUserRole({ id, role: newRole }).unwrap();
      toast.success("User role changed successfully");
    } catch {
      toast.error("Failed to change user role");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      if (newStatus === "SUSPENDED") {
        await blockUser(id).unwrap();
        toast.success("User blocked successfully");
      } else if (newStatus === "ACTIVE") {
        await blockUser(id).unwrap();
        toast.success("User activated successfully");
      } else {
        toast.info(
          "Status change functionality needs to be implemented on the backend"
        );
      }
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    setIsDeleteLoading(true);
    try {
      await softDeleteUser(deletingUser.id).unwrap();
      toast.success("User deleted successfully");
      setIsDeleteModalOpen(false);
      setDeletingUser(null);
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingUser(null);
    setIsDeleteLoading(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "border-bad/30 bg-bad/10 text-rose-300";
      case "USER":
        return "border-ok/30 bg-ok/10 text-emerald-300";
      default:
        return "border-line-strong bg-white/5 text-ink-dim";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "border-ok/30 bg-ok/10 text-emerald-300";
      case "SUSPENDED":
        return "border-warn/30 bg-warn/10 text-amber-300";
      case "BANNED":
        return "border-bad/30 bg-bad/10 text-rose-300";
      default:
        return "border-line-strong bg-white/5 text-ink-dim";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <FaShieldAlt className="text-accent" />;
      case "USER":
        return <FaUser className="text-ink-mute" />;
      default:
        return <FaUser className="text-ink-mute" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div>
          <div className="skeleton mb-6 h-8 w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            User Management
          </h1>
          <p className="mt-1 text-sm text-ink-mute">
            Manage system users and permissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-mute">Total Users</p>
              <p className="text-2xl font-bold tabular-nums text-ink">
                {users.length}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
              <FaUser />
            </div>
          </div>
        </div>

        <div className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-mute">Active Users</p>
              <p className="text-2xl font-bold tabular-nums text-ink">
                {users.filter((user: User) => user.status === "ACTIVE").length}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-ok/10 text-ok">
              <FaUser />
            </div>
          </div>
        </div>

        <div className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-mute">Admins</p>
              <p className="text-2xl font-bold tabular-nums text-ink">
                {users.filter((user: User) => user.role === "ADMIN").length}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
              <FaShieldAlt />
            </div>
          </div>
        </div>

        <div className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-mute">Suspended</p>
              <p className="text-2xl font-bold tabular-nums text-ink">
                {
                  users.filter((user: User) => user.status === "SUSPENDED")
                    .length
                }
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-warn/10 text-warn">
              <FaBan />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="field pl-10"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-40">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="field"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="USER">User</option>
              </select>
            </div>

            <div className="w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="field"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  User
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredUsers.map((user: User) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {getRoleIcon(user.role)}
                      <div>
                        <div className="font-medium text-ink">
                          {user.name}
                        </div>
                        <div className="text-sm text-ink-mute">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className={`cursor-pointer rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide focus:outline-none ${getRoleColor(
                        user.role
                      )}`}
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.status}
                      onChange={(e) =>
                        handleStatusChange(user.id, e.target.value)
                      }
                      className={`cursor-pointer rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide focus:outline-none ${getStatusColor(
                        user.status
                      )}`}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-dim">
                    {formatDate(user.createdAt)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDelete(user)}
                        className="rounded-lg p-2 text-rose-400 transition-colors hover:bg-rose-500/15 hover:text-rose-300"
                        title="Delete User"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center">
            <FaUser className="mx-auto mb-4 text-4xl text-ink-mute" />
            <p className="text-sm text-ink-mute">
              No users found matching your criteria
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-pop">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-rose-500/10">
                  <FaTrash className="text-xl text-rose-400" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-ink">
                  Delete User
                </h2>
                <p className="mb-4 text-sm text-ink-dim">
                  Are you sure you want to delete this user? This action cannot
                  be undone.
                </p>
              </div>

              {deletingUser && (
                <div className="mb-6 rounded-xl border border-line bg-surface-2 p-4 text-left">
                  <div className="mb-2 flex items-center space-x-3">
                    {getRoleIcon(deletingUser.role)}
                    <div>
                      <h3 className="font-medium text-ink">
                        {deletingUser.name}
                      </h3>
                      <p className="text-sm text-ink-mute">
                        {deletingUser.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-ink-mute">
                    <span>Role: {deletingUser.role}</span>
                    <span>Status: {deletingUser.status}</span>
                  </div>
                  <div className="mt-1 text-sm text-ink-mute">
                    Joined: {formatDate(deletingUser.createdAt)}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDeleteCancel}
                  disabled={isDeleteLoading}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleteLoading}
                  className="btn btn-danger flex-1"
                >
                  {isDeleteLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    "Delete User"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
