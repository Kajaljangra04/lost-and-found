import { Spinner, Modal, ModalHeader, ModalBody } from "flowbite-react";
import img from "../../assets/3576506_65968.jpg";
import {
  useDeleteMyFoundItemMutation,
  useEditMyFoundItemMutation,
  useGetMyFoundItemQuery,
} from "../../redux/api/api";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toastNotify from "../../components/modal/toastNotify";
import QueryErrorBanner from "../../components/QueryErrorBanner";
import {
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaInbox,
} from "react-icons/fa";

type MyFoundItem = {
  id: string;
  img?: string;
  foundItemName?: string;
  description?: string;
  location?: string;
  date?: string;
  categoryId?: string;
  isClaimed?: boolean;
};

type EditFoundItemForm = {
  id?: string;
  foundItemName: string;
  description: string;
  location: string;
  date: string;
};

const MyFoundItems = () => {
  const { data: myFoundItems, isLoading, error } = useGetMyFoundItemQuery({});
  const [deleteMyFoundItem] = useDeleteMyFoundItemMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MyFoundItem | null>(null);
  const [currId, setCurrId] = useState<string | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MyFoundItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (item: MyFoundItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      const res = await deleteMyFoundItem(itemToDelete.id);
      if (res?.data?.statusCode == 200) {
        toastNotify({ message: res?.data?.message, status: true });
      } else {
        toastNotify({ message: "Failed to delete", status: false });
      }
    } catch {
      toastNotify({ message: "Failed to delete", status: false });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    setIsDeleting(false);
  };

  const [editMyFoundItem] = useEditMyFoundItemMutation();

  const openModal = (item: MyFoundItem) => {
    setCurrentItem(item);
    setIsOpen(true);
    setCurrId(item?.id);
  };

  const closeModal = () => {
    setIsOpen(false);
    setCurrentItem(null);
    reset();
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditFoundItemForm>();

  const onSubmit = async (data: EditFoundItemForm) => {
    data.id = currId;
    data.date = new Date(data?.date).toISOString();

    const res = await editMyFoundItem(data);
    if (res?.data?.statusCode == 200) {
      toastNotify({ message: res?.data?.message, status: true });
    } else {
      toastNotify({ message: "Failed to update", status: false });
    }

    closeModal();
  };

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="xl" className="mb-4 text-accent" />
          <p className="text-ink-dim">Loading your found items...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-ink md:text-5xl">
              My Found Items
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-ink-dim">
              Manage and track your found item reports
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="card card-hover p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-mute">Total Items</p>
                <p className="text-2xl font-bold tabular-nums text-ink">
                  {myFoundItems?.data?.length || 0}
                </p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
                <FaSearch />
              </div>
            </div>
          </div>

          <div className="card card-hover p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-mute">Not Claimed</p>
                <p className="text-2xl font-bold tabular-nums text-ink">
                  {myFoundItems?.data?.filter((item: MyFoundItem) => !item.isClaimed)
                    .length || 0}
                </p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-bad/10 text-bad">
                <FaTimesCircle />
              </div>
            </div>
          </div>

          <div className="card card-hover p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink-mute">Claimed</p>
                <p className="text-2xl font-bold tabular-nums text-ink">
                  {myFoundItems?.data?.filter((item: MyFoundItem) => item.isClaimed)
                    .length || 0}
                </p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-ok/10 text-ok">
                <FaCheckCircle />
              </div>
            </div>
          </div>
        </div>

        {error && <QueryErrorBanner />}

        {/* Table */}
        {myFoundItems?.data?.length === 0 ? (
          <div className="py-16 text-center">
            <div className="card mx-auto max-w-md p-12">
              <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-accent/10 text-3xl text-accent">
                <FaInbox />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-ink">
                No Found Items Found
              </h3>
              <p className="mb-6 text-ink-dim">
                You haven't reported any found items yet. Start by reporting a
                found item to track it here.
              </p>
            </div>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                      Date Found
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {myFoundItems?.data?.map((myFoundItem: MyFoundItem) => (
                    <tr
                      key={myFoundItem.id}
                      className="transition-colors duration-200 hover:bg-white/[0.03]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-12 h-12 mr-4">
                            <img
                              className="h-12 w-12 rounded-lg border border-line object-cover"
                              src={myFoundItem?.img || img}
                              alt={myFoundItem?.foundItemName}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = img;
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-medium text-ink">
                              {myFoundItem?.foundItemName}
                            </div>
                            <div className="max-w-xs truncate text-sm text-ink-mute">
                              {myFoundItem?.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {myFoundItem?.isClaimed ? (
                            <>
                              <FaCheckCircle className="mr-2 text-ok" />
                              <span className="badge badge-ok">Claimed</span>
                            </>
                          ) : (
                            <>
                              <FaTimesCircle className="mr-2 text-bad" />
                              <span className="badge badge-danger">
                                Not Claimed
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-dim">
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="mr-2 text-ink-mute" />
                          <span className="max-w-xs truncate">
                            {myFoundItem?.location}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-dim">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2 text-ink-mute" />
                          <span>{myFoundItem?.date ? myFoundItem.date.split("T")[0] : "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openModal(myFoundItem)}
                            className="btn btn-sm btn-outline"
                            title="Edit item"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(myFoundItem)}
                            className="btn btn-sm btn-danger"
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
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        show={isOpen}
        size="md"
        popup={true}
        onClose={closeModal}
        className="border border-line bg-surface shadow-pop"
      >
        <ModalHeader className="border-b border-line">
          <h3 className="text-xl font-semibold text-ink">Edit Found Item</h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6 p-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label htmlFor="foundItemName" className="field-label">
                  Item Name
                </label>
                <input
                  id="foundItemName"
                  defaultValue={currentItem?.foundItemName}
                  {...register("foundItemName", { required: true })}
                  className="field"
                />
                {errors.foundItemName && (
                  <span className="field-error">This field is required</span>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="field-label">
                  Description
                </label>
                <input
                  id="description"
                  defaultValue={currentItem?.description}
                  {...register("description", { required: true })}
                  className="field"
                />
                {errors.description && (
                  <span className="field-error">This field is required</span>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="location" className="field-label">
                  Location
                </label>
                <input
                  id="location"
                  defaultValue={currentItem?.location}
                  {...register("location", { required: true })}
                  className="field"
                />
                {errors.location && (
                  <span className="field-error">This field is required</span>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="date" className="field-label">
                  Date Found
                </label>
                <input
                  type="date"
                  id="date"
                  defaultValue={currentItem?.date?.split("T")[0]}
                  {...register("date", { required: true })}
                  className="field"
                />
                {errors.date && (
                  <span className="field-error">This field is required</span>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={isDeleteModalOpen}
        size="md"
        popup={true}
        onClose={handleDeleteCancel}
        className="border border-line bg-surface shadow-pop"
      >
        <ModalHeader className="border-b border-line">
          <h3 className="text-xl font-semibold text-ink">
            Delete Found Item
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6 p-2">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-rose-500/10">
                  <FaTrash className="text-xl text-rose-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-ink">
                  Are you sure you want to delete this item?
                </h3>
                <p className="mb-4 text-sm text-ink-mute">
                  This action cannot be undone. The found item report will be
                  permanently removed.
                </p>
              </div>

              {itemToDelete && (
                <div className="mb-6 rounded-xl border border-line bg-surface-2 p-4 text-left">
                  <div className="flex items-center">
                    <img
                      className="mr-4 h-12 w-12 rounded-lg border border-line object-cover"
                      src={itemToDelete?.img || img}
                      alt={itemToDelete?.foundItemName}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = img;
                      }}
                    />
                    <div>
                      <h4 className="mb-1 font-medium text-ink">
                        {itemToDelete?.foundItemName}
                      </h4>
                      <p className="mb-1 text-sm text-ink-mute">
                        {itemToDelete?.description}
                      </p>
                      <div className="flex justify-between text-sm text-ink-mute">
                        <span>Location: {itemToDelete?.location}</span>
                        <span>Date: {itemToDelete?.date?.split("T")[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="btn btn-danger"
                >
                  {isDeleting ? (
                    <>
                      <Spinner size="sm" className="mr-2 text-accent" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Item"
                  )}
                </button>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default MyFoundItems;
