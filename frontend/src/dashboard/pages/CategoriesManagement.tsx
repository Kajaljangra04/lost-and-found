import { useState } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaSave,
  FaTimes,
  FaBoxOpen,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";
import {
  useCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../redux/api/api";

// Real API category interface
interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
}

const CategoriesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormData>({ name: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState<FormData>({ name: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  const { data: categoriesData, isLoading } = useCategoryQuery(undefined);
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  const categories: Category[] = categoriesData?.data || [];

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditForm({ name: category.name });
  };

  const handleSave = async () => {
    if (editingId && editForm.name.trim()) {
      try {
        await updateCategory({
          id: editingId,
          data: { name: editForm.name.trim() },
        }).unwrap();
        setEditingId(null);
        setEditForm({ name: "" });
        toast.success("Category updated successfully");
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to update category"));
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ name: "" });
  };

  const handleAdd = async () => {
    if (newCategory.name.trim()) {
      try {
        await createCategory({ name: newCategory.name.trim() }).unwrap();
        setNewCategory({ name: "" });
        setShowAddForm(false);
        toast.success("Category added successfully");
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to create category"));
      }
    }
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete.id).unwrap();
        setShowDeleteModal(false);
        setCategoryToDelete(null);
        toast.success("Category deleted successfully");
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to delete category"));
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
            Category Management
          </h1>
          <p className="mt-1 text-sm text-ink-mute">
            Manage item categories and classifications
          </p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
          <FaPlus />
          Add Category
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-mute">Total Categories</p>
              <p className="text-2xl font-bold tabular-nums text-ink">
                {categories.length}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
              <FaBoxOpen />
            </div>
          </div>
        </div>

        <div className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-mute">Recently Added</p>
              <p className="text-2xl font-bold tabular-nums text-ink">
                {
                  categories.filter((cat) => {
                    const createdDate = new Date(cat.createdAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return createdDate > weekAgo;
                  }).length
                }
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-ok/10 text-ok">
              <FaBoxOpen />
            </div>
          </div>
        </div>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="card p-5">
          <h3 className="mb-4 text-lg font-semibold text-ink">
            Add New Category
          </h3>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Category name"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              className="field flex-1"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!newCategory.name.trim() || isCreating}
                className="btn btn-primary"
              >
                <FaSave />
                {isCreating ? "Adding..." : "Add"}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewCategory({ name: "" });
                }}
                className="btn btn-outline"
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card p-5">
        <div className="relative">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="field pl-10"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Category Name
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Updated At
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredCategories.map((category) => (
                <tr
                  key={category.id}
                  className="transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-6 py-4">
                    {editingId === category.id ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="field"
                      />
                    ) : (
                      <div className="font-medium text-ink">
                        {category.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-dim">
                    {formatDate(category.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-dim">
                    {formatDate(category.updatedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {editingId === category.id ? (
                        <>
                          <button
                            onClick={handleSave}
                            disabled={!editForm.name.trim() || isUpdating}
                            className="rounded-lg p-2 text-emerald-400 transition-colors hover:bg-emerald-500/15 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Save category"
                          >
                            <FaSave />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="rounded-lg p-2 text-ink-mute transition-colors hover:bg-white/5 hover:text-ink"
                            title="Cancel edit"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(category)}
                            className="rounded-lg p-2 text-ink-mute transition-colors hover:bg-white/5 hover:text-ink"
                            title="Edit category"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(category)}
                            className="rounded-lg p-2 text-rose-400 transition-colors hover:bg-rose-500/15 hover:text-rose-300"
                            title="Delete category"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCategories.length === 0 && (
          <div className="py-12 text-center">
            <FaBoxOpen className="mx-auto mb-4 text-4xl text-ink-mute" />
            <p className="text-sm text-ink-mute">
              {searchTerm
                ? "No categories found matching your search criteria."
                : "No categories found. Add one to get started."}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <div className="relative top-20 mx-auto w-96 rounded-2xl border border-line bg-surface p-5 shadow-pop">
            <div className="mt-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10">
                <FaTrash className="h-6 w-6 text-rose-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink">
                Delete Category
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-ink-dim">
                  Are you sure you want to delete the category "
                  <span className="font-medium text-ink">
                    {categoryToDelete?.name}
                  </span>
                  "? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="btn btn-danger w-24"
                  >
                    {isDeleting ? "..." : "Delete"}
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    disabled={isDeleting}
                    className="btn btn-outline w-24"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;
