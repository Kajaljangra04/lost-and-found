import { useState } from "react";
import { FaEye, FaSearch, FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useGetAllClaimsQuery,
  useUpdateClaimStatusMutation,
} from "../../redux/api/api";

type ClaimItem = {
  id: string;
  status: string;
  distinguishingFeatures?: string;
  lostDate?: string;
  createdAt?: string;
  foundItem?: {
    foundItemName: string;
    description?: string;
    img?: string;
    category?: { name?: string };
    user?: { username?: string; email?: string };
  };
};

const ClaimsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ClaimItem | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  const { data: allClaims, isLoading } = useGetAllClaimsQuery(undefined);
  const [updateClaimStatus] = useUpdateClaimStatusMutation();

  const claims: ClaimItem[] = allClaims?.data || [];

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.foundItem?.foundItemName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      claim.foundItem?.user?.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      claim.foundItem?.user?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || claim.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (claimId: string, status: string) => {
    const claim = claims.find((claim) => claim.id === claimId);
    setSelectedClaim(claim ?? null);
    setNewStatus(status);
    setIsStatusModalOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!selectedClaim || !newStatus) return;

    setIsStatusLoading(true);
    try {
      await updateClaimStatus({
        claimId: selectedClaim.id,
        status: newStatus,
      }).unwrap();

      toast.success(
        `Claim for "${
          selectedClaim.foundItem?.foundItemName
        }" ${newStatus.toLowerCase()} successfully`
      );
      setIsStatusModalOpen(false);
      setSelectedClaim(null);
      setNewStatus("");
    } catch {
      toast.error("Failed to update claim status");
    } finally {
      setIsStatusLoading(false);
    }
  };

  const handleStatusCancel = () => {
    setIsStatusModalOpen(false);
    setSelectedClaim(null);
    setNewStatus("");
    setIsStatusLoading(false);
  };

  const handleBulkApprove = async () => {
    const pendingClaims = filteredClaims.filter(
      (claim) => claim.status === "PENDING"
    );
    if (pendingClaims.length === 0) {
      toast.warning("No pending claims to approve");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to approve ${pendingClaims.length} pending claims?`
      )
    ) {
      try {
        // Approve all pending claims
        const promises = pendingClaims.map((claim) =>
          updateClaimStatus({
            claimId: claim.id,
            status: "APPROVED",
          }).unwrap()
        );

        await Promise.all(promises);
        toast.success(`Successfully approved ${pendingClaims.length} claims`);
      } catch {
        toast.error("Failed to approve some claims");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "border-warn/30 bg-warn/10 text-amber-300";
      case "APPROVED":
        return "border-ok/30 bg-ok/10 text-emerald-300";
      case "REJECTED":
        return "border-bad/30 bg-bad/10 text-rose-300";
      default:
        return "border-line-strong bg-white/5 text-ink-dim";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
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
            Claims Management
          </h1>
          <p className="mt-1 text-sm text-ink-mute">
            Review and manage item claims
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleBulkApprove}
            className="btn btn-primary"
          >
            <FaCheck />
            Bulk/All Approve Pending
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-mute">Total Claims</p>
              <p className="text-2xl font-bold tabular-nums text-ink">
                {claims.length}
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
              <p className="text-sm text-ink-mute">Pending</p>
              <p className="text-2xl font-bold tabular-nums text-ink">
                {
                  claims.filter((claim) => claim.status === "PENDING")
                    .length
                }
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-warn/10 text-warn">
              <FaSearch />
            </div>
          </div>
        </div>

        <div className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-mute">Approved</p>
              <p className="text-2xl font-bold tabular-nums text-ink">
                {
                  claims.filter((claim) => claim.status === "APPROVED")
                    .length
                }
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-ok/10 text-ok">
              <FaCheck />
            </div>
          </div>
        </div>

        <div className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-mute">Rejected</p>
              <p className="text-2xl font-bold tabular-nums text-ink">
                {
                  claims.filter((claim) => claim.status === "REJECTED")
                    .length
                }
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-bad/10 text-bad">
              <FaTimes />
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
                placeholder="Search claims..."
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
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Found Item
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Claim Details
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Found By
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Lost Date
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredClaims.map((claim) => (
                <tr
                  key={claim.id}
                  className="transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={claim.foundItem?.img || "/bgimg.png"}
                        alt={claim.foundItem?.foundItemName}
                        className="h-12 w-12 rounded-lg border border-line object-cover"
                      />
                      <div>
                        <div className="font-medium text-ink">
                          {claim.foundItem?.foundItemName}
                        </div>
                        <div className="max-w-xs truncate text-sm text-ink-mute">
                          {claim.foundItem?.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge badge-neutral">
                      {claim.foundItem?.category?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="mb-1 text-sm font-medium text-ink">
                        Distinguishing Features:
                      </div>
                      <div className="truncate text-sm text-ink-mute">
                        {claim.distinguishingFeatures || "No details provided"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-ink">
                        {claim.foundItem?.user?.username}
                      </div>
                      <div className="text-sm text-ink-mute">
                        {claim.foundItem?.user?.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-dim">
                    {formatDate(claim.lostDate)}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={claim.status}
                      onChange={(e) =>
                        handleStatusChange(claim.id, e.target.value)
                      }
                      className={`cursor-pointer rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide focus:outline-none ${getStatusColor(
                        claim.status
                      )}`}
                    >
                      <option value="PENDING" className="bg-surface-3 text-ink">
                        PENDING
                      </option>
                      <option value="APPROVED" className="bg-surface-3 text-ink">
                        APPROVED
                      </option>
                      <option value="REJECTED" className="bg-surface-3 text-ink">
                        REJECTED
                      </option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClaims.length === 0 && (
          <div className="py-12 text-center">
            <FaSearch className="mx-auto mb-4 text-4xl text-ink-mute" />
            <p className="text-sm text-ink-mute">
              No claims found matching your criteria
            </p>
          </div>
        )}
      </div>

      {/* Status Change Confirmation Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-pop">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-accent/10">
                  <FaCheck className="text-xl text-accent" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-ink">
                  Change Claim Status
                </h2>
                <p className="mb-4 text-sm text-ink-dim">
                  Are you sure you want to change the status of this claim?
                </p>
              </div>

              {selectedClaim && (
                <div className="mb-6 rounded-xl border border-line bg-surface-2 p-4 text-left">
                  <div className="mb-3 flex items-center space-x-3">
                    <img
                      src={selectedClaim.foundItem?.img || "/bgimg.png"}
                      alt={selectedClaim.foundItem?.foundItemName}
                      className="h-12 w-12 rounded-lg border border-line object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-ink">
                        {selectedClaim.foundItem?.foundItemName}
                      </h3>
                      <p className="text-sm text-ink-mute">
                        {selectedClaim.foundItem?.category?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-mute">
                      Current Status:
                      <span
                        className={`badge ml-2 align-middle ${getStatusColor(
                          selectedClaim.status
                        )}`}
                      >
                        {selectedClaim.status}
                      </span>
                    </span>
                    <span className="text-sm text-ink-mute">
                      New Status:
                      <span
                        className={`badge ml-2 align-middle ${getStatusColor(
                          newStatus
                        )}`}
                      >
                        {newStatus}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleStatusCancel}
                  disabled={isStatusLoading}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStatusConfirm}
                  disabled={isStatusLoading}
                  className="btn btn-primary flex-1"
                >
                  {isStatusLoading ? (
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
                    "Update Status"
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

export default ClaimsManagement;
