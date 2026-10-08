import { useMyClaimsQuery } from "../../redux/api/api";
import type { Claim } from "../../types/types";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  FaSearch,
  FaTimes,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUser,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaInbox,
} from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

const MyClaimReqPage = () => {
  const { data: myClaims, isLoading } = useMyClaimsQuery({});

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Get status icon and badge classes
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          icon: <FaClock className="h-3.5 w-3.5" />,
          badge: "badge badge-warn",
          label: "Pending",
        };
      case "APPROVED":
      case "ACCEPTED":
        return {
          icon: <FaCheckCircle className="h-3.5 w-3.5" />,
          badge: "badge badge-ok",
          label: "Approved",
        };
      case "REJECTED":
        return {
          icon: <FaTimesCircle className="h-3.5 w-3.5" />,
          badge: "badge badge-danger",
          label: "Rejected",
        };
      default:
        return {
          icon: <FaClock className="h-3.5 w-3.5" />,
          badge: "badge badge-neutral",
          label: "Unknown",
        };
    }
  };

  // Filter and sort claims
  const filteredAndSortedClaims = useMemo(() => {
    if (!myClaims?.data) return [];

    const filtered = myClaims.data.filter((claim: Claim) => {
      const matchesSearch =
        searchTerm === "" ||
        claim?.foundItem?.foundItemName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        claim?.foundItem?.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        claim?.foundItem?.location
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || claim?.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort claims
    filtered.sort((a: Claim, b: Claim) => {
      let aValue, bValue;

      switch (sortBy) {
        case "createdAt":
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        case "foundItemName":
          aValue = a?.foundItem?.foundItemName?.toLowerCase() || "";
          bValue = b?.foundItem?.foundItemName?.toLowerCase() || "";
          break;
        case "status":
          aValue = a?.status || "";
          bValue = b?.status || "";
          break;
        default:
          aValue = a?.createdAt || "";
          bValue = b?.createdAt || "";
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [myClaims?.data, searchTerm, statusFilter, sortBy, sortOrder]);

  const clearSearch = () => {
    setSearchTerm("");
  };

  if (isLoading) {
    return (
      <div className="page">
        {/* Loading skeletons */}
        <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
          <div className="section-head">
            <div className="skeleton mx-auto h-10 w-64" />
            <div className="skeleton mx-auto h-5 w-3/4 max-w-md" />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          {/* Filter skeleton */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row">
            <div className="skeleton h-12 flex-1" />
            <div className="skeleton h-12 w-48" />
          </div>

          {/* Cards skeleton */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="skeleton mb-4 h-48" />
                <div className="skeleton mb-3 h-6" />
                <div className="skeleton mb-2 h-4" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="page pb-12">
      {/* Header Section */}
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="section-head">
          <h1 className="section-title">My Claims</h1>
          <p className="section-sub">
            Track the status of your item claims and view detailed information
            about each request.
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="card mb-8 p-6">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Search Input */}
            <div className="relative flex-1">
              <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by item name, description, or location..."
                className="field pl-12 pr-12"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-mute transition-colors hover:text-ink"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="field"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split("-");
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="field"
              >
                <option value="createdAt-desc">Latest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="foundItemName-asc">Item Name (A-Z)</option>
                <option value="foundItemName-desc">Item Name (Z-A)</option>
                <option value="status-asc">Status (A-Z)</option>
                <option value="status-desc">Status (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-ink-dim">
            {filteredAndSortedClaims.length > 0 ? (
              <span>
                Showing {filteredAndSortedClaims.length} claim
                {filteredAndSortedClaims.length !== 1 ? "s" : ""}
                {searchTerm && (
                  <span className="ml-2 text-accent">
                    for "{searchTerm}"
                  </span>
                )}
                {statusFilter !== "ALL" && (
                  <span className="ml-2 text-accent">
                    with status "{statusFilter}"
                  </span>
                )}
              </span>
            ) : (
              <span>No claims found</span>
            )}
          </div>
        </div>

        {/* Claims Table */}
        {filteredAndSortedClaims.length === 0 ? (
          <div className="py-16 text-center">
            <div className="card mx-auto max-w-md p-12">
              <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-line bg-surface-2">
                <FaInbox className="text-2xl text-ink-mute" />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-ink">
                No Claims Found
              </h3>
              <p className="mb-6 text-ink-dim">
                {searchTerm || statusFilter !== "ALL"
                  ? "No claims match your current filters. Try adjusting your search or filter criteria."
                  : "You haven't submitted any claims yet. Browse found items and claim your lost belongings!"}
              </p>
              {(searchTerm || statusFilter !== "ALL") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                  }}
                  className="btn btn-outline mr-4"
                >
                  Clear Filters
                </button>
              )}
              <Link to="/foundItems" className="btn btn-brand">
                Browse Found Items
              </Link>
            </div>
          </div>
        ) : (
          /* Table View */
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-line bg-white/[0.02]">
                  <tr>
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
                      Found By
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                      Claim Date
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredAndSortedClaims.map((claim: Claim) => {
                    const statusConfig = getStatusConfig(claim?.status);

                    return (
                      <tr
                        key={claim.id}
                        className="transition-colors hover:bg-white/[0.03]"
                      >
                        <td className="px-6 py-4 text-sm text-ink-dim">
                          <div className="flex items-center">
                            <div className="mr-4 w-12 flex-shrink-0">
                              <img
                                className="h-12 w-12 rounded-lg border border-line object-cover"
                                src={claim?.foundItem?.img}
                                alt={claim?.foundItem?.foundItemName}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/bgimg.png";
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-ink">
                                {claim?.foundItem?.foundItemName}
                              </div>
                              <div className="max-w-xs truncate text-sm text-ink-mute">
                                {claim?.foundItem?.description ||
                                  "No description provided."}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={statusConfig.badge}>
                            {statusConfig.icon}
                            <span>{statusConfig.label}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-ink-dim">
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="mr-2 text-ink-mute" />
                            <span className="max-w-xs truncate">
                              {claim?.foundItem?.location ||
                                "Location not specified"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-ink-dim">
                          <div className="flex items-center">
                            <FaUser className="mr-2 text-ink-mute" />
                            <span>
                              {claim?.foundItem?.user?.username || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-ink-dim">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-2 text-ink-mute" />
                            <span>
                              {claim?.createdAt
                                ? new Date(claim.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )
                                : "Date not available"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/foundItems/${claim?.foundItem?.id}`}
                            className="btn btn-outline btn-sm"
                          >
                            <FaEye />
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClaimReqPage;
