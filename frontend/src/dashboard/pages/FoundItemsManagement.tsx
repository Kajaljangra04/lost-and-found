import { useState } from "react";
import { FaEdit, FaTrash, FaEye, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useGetFoundItemsQuery,
  useDeleteMyFoundItemMutation,
  useEditMyFoundItemMutation,
} from "../../redux/api/api";

interface FoundItem {
  id: string;
  foundItemName: string;
  description: string;
  category: {
    name: string;
  };
  location: string;
  date: string;
  isClaimed: boolean;
  img?: string;
  user: {
    username: string;
  };
}

const FoundItemsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoundItem | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<FoundItem | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    foundItemName: "",
    description: "",
    location: "",
    date: "",
  });

  const {
    data: foundItemsData,
    isLoading,
    error,
  } = useGetFoundItemsQuery({
    searchTerm,
    sortBy: "foundItemName",
    sortOrder: "asc",
  });

  const [deleteFoundItem] = useDeleteMyFoundItemMutation();
  const [editMyFoundItem] = useEditMyFoundItemMutation();

  const handleEdit = (item: FoundItem) => {
    setEditingItem(item);
    setEditForm({
      foundItemName: item.foundItemName,
      description: item.description,
      location: item.location,
      date: new Date(item.date).toISOString().split("T")[0],
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsEditLoading(true);
    try {
      // Convert date to ISO-8601 DateTime format
      const isoDate = new Date(editForm.date).toISOString();

      await editMyFoundItem({
        id: editingItem.id,
        ...editForm,
        date: isoDate,
      }).unwrap();
      toast.success("Item updated successfully");
      setIsEditModalOpen(false);
      setEditingItem(null);
    } catch {
      toast.error("Failed to update item");
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditingItem(null);
    setIsEditLoading(false);
    setEditForm({
      foundItemName: "",
      description: "",
      location: "",
      date: "",
    });
  };

  const handleDelete = (item: FoundItem) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    setIsDeleteLoading(true);
    try {
      await deleteFoundItem(deletingItem.id).unwrap();
      toast.success("Item deleted successfully");
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
    setIsDeleteLoading(false);
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

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-bad/30 bg-bad/10 p-4">
          <p className="text-sm font-medium text-rose-300">
            Error loading found items. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const items = foundItemsData?.data || [];

  const filteredItems = items.filter((item: FoundItem) => {
    const matchesSearch =
      item.foundItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "CLAIMED" && item.isClaimed) ||
      (statusFilter === "ACTIVE" && !item.isClaimed);
    const matchesCategory =
      categoryFilter === "ALL" || item.category?.name === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (isClaimed: boolean) => {
    return isClaimed ? "badge-warn" : "badge-ok";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Found Items Management
          </h1>
          <p className="mt-1 text-sm text-ink-mute">
            Manage all found items in the system
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-mute">Total Items</p>
              <p className="text-2xl font-bold tabular-nums text-ink">
                {items?.length | 0}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
              <FaEye />
            </div>
          </div>
        </div>

        <div className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-mute">Active</p>
              <p className="text-2xl font-bold tabular-nums text-ink">
                {items.filter((item: FoundItem) => !item.isClaimed).length}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-ok/10 text-ok">
              <FaSearch />
            </div>
          </div>
        </div>

        <div className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-mute">Claimed</p>
              <p className="text-2xl font-bold tabular-nums text-ink">
                {items.filter((item: FoundItem) => item.isClaimed).length}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-warn/10 text-warn">
              <FaSearch />
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
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="field pl-10"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="field"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="CLAIMED">Claimed</option>
              </select>
            </div>

            <div className="w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="field"
              >
                <option value="ALL">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Personal Items">Personal Items</option>
                <option value="Keys">Keys</option>
                <option value="Documents">Documents</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Date Found
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Reported By
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredItems.map((item: FoundItem) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-ink">
                        {item.foundItemName}
                      </div>
                      <div className="max-w-xs truncate text-sm text-ink-mute">
                        {item.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-dim">
                    {item.category?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-dim">
                    {item.location}
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-dim">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${getStatusColor(item.isClaimed)}`}>
                      {item.isClaimed ? "Claimed" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-dim">
                    {item.user?.username || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="rounded-lg p-2 text-ink-mute transition-colors hover:bg-white/5 hover:text-ink"
                        title="Edit item"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="rounded-lg p-2 text-rose-400 transition-colors hover:bg-rose-500/15 hover:text-rose-300"
                        title="Delete item"
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

        {filteredItems.length === 0 && (
          <div className="py-12 text-center">
            <FaSearch className="mx-auto mb-4 text-4xl text-ink-mute" />
            <p className="text-sm text-ink-mute">
              No items found matching your criteria
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-pop">
            <h2 className="mb-4 text-xl font-bold text-ink">
              Edit Found Item
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="field-label">Item Name</label>
                <input
                  type="text"
                  value={editForm.foundItemName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, foundItemName: e.target.value })
                  }
                  disabled={isEditLoading}
                  className="field disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <label className="field-label">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  disabled={isEditLoading}
                  className="field disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="field-label">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  disabled={isEditLoading}
                  className="field disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <label className="field-label">Date Found</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, date: e.target.value })
                  }
                  disabled={isEditLoading}
                  className="field disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isEditLoading}
                  className="btn btn-primary flex-1"
                >
                  {isEditLoading ? (
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
                      Updating...
                    </>
                  ) : (
                    "Update Item"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleEditCancel}
                  disabled={isEditLoading}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  Delete Found Item
                </h2>
                <p className="mb-4 text-sm text-ink-dim">
                  Are you sure you want to delete this item? This action cannot
                  be undone.
                </p>
              </div>

              {deletingItem && (
                <div className="mb-6 rounded-xl border border-line bg-surface-2 p-4 text-left">
                  <h3 className="mb-2 font-medium text-ink">
                    {deletingItem.foundItemName}
                  </h3>
                  <p className="mb-2 text-sm text-ink-mute">
                    {deletingItem.description}
                  </p>
                  <div className="flex justify-between text-sm text-ink-mute">
                    <span>Location: {deletingItem.location}</span>
                    <span>
                      Date: {new Date(deletingItem.date).toLocaleDateString()}
                    </span>
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
                    "Delete Item"
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

export default FoundItemsManagement;
