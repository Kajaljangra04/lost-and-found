import { useGetLostItemsQuery } from "../../redux/api/api";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useState } from "react";
import type { lostItem } from "../../types/types";

const formatDate = (date: string | Date | undefined) => {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const LostItemsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("lostItemName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [limit] = useState(12);

  const { data: lostItems, isLoading } = useGetLostItemsQuery({
    searchTerm,
    page: currentPage,
    limit,
    sortBy,
    sortOrder,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, order] = e.target.value.split("-");
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const totalPages = lostItems?.meta?.totalPage || 1;

  if (isLoading)
    return (
      <div className="page">
        <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:py-6 lg:px-6">
          {/* Header Skeleton */}
          <div className="mx-auto mb-12 max-w-2xl space-y-4 text-center">
            <div className="skeleton mx-auto h-9 w-64" />
            <div className="skeleton mx-auto h-5 w-3/4 max-w-md" />
          </div>

          {/* Search Skeleton */}
          <div className="card mb-8 p-6">
            <div className="mx-auto max-w-4xl">
              <div className="skeleton mb-6 h-12" />
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="skeleton h-10 flex-1" />
                <div className="skeleton h-10 w-32" />
              </div>
            </div>
          </div>

          {/* Cards Skeleton */}
          <div className="container mx-auto px-4">
            <div className="mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="card overflow-hidden">
                  <div className="skeleton h-56 rounded-none" />
                  <div className="p-6">
                    <div className="skeleton mb-3 h-6 w-2/3" />
                    <div className="mb-4 space-y-2">
                      <div className="skeleton h-4" />
                      <div className="skeleton h-4 w-3/4" />
                    </div>
                    <div className="mb-4 space-y-2">
                      <div className="skeleton h-4 w-1/2" />
                      <div className="skeleton h-4 w-2/3" />
                    </div>
                    <div className="skeleton h-10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="page pb-16">
      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:py-6 lg:px-6">
        {/* Header Section */}
        <div className="section-head">
          <h2 className="section-title">All Lost Items</h2>
          <p className="section-sub">
            Help reunite people with their lost belongings
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="card mb-8 p-6">
          <div className="mx-auto max-w-4xl">
            {/* Search Bar */}
            <form className="mb-6" onSubmit={handleSearch}>
              <label className="field-label sr-only">Search</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4">
                  <FaSearch className="text-ink-mute" />
                </div>
                <input
                  type="search"
                  id="default-search"
                  className="field ps-11 pe-28"
                  placeholder="Search by name, location, or description..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                />
                <button
                  type="submit"
                  className="btn btn-brand absolute end-2.5 top-1/2 -translate-y-1/2"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Filters Row */}
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              {/* Sort Controls */}
              <div className="flex w-full items-center gap-3 sm:w-auto">
                <FaFilter className="shrink-0 text-ink-mute" />
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={handleSortChange}
                  className="field w-full sm:w-64"
                >
                  <option value="lostItemName-asc">Name (A-Z)</option>
                  <option value="lostItemName-desc">Name (Z-A)</option>
                  <option value="date-desc">Date (Newest First)</option>
                  <option value="date-asc">Date (Oldest First)</option>
                  <option value="location-asc">Location (A-Z)</option>
                  <option value="location-desc">Location (Z-A)</option>
                </select>
              </div>

              {/* Clear Search Button */}
              {searchTerm && (
                <button onClick={clearSearch} className="btn btn-outline">
                  <FaTimes />
                  Clear search
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-center text-sm font-medium text-ink-mute">
            {searchTerm
              ? `Search results for "${searchTerm}" - ${
                  lostItems?.data?.length || 0
                } items found`
              : `Showing ${lostItems?.data?.length || 0} lost items`}
          </p>
        </div>
      </div>

      {/* card items */}
      <div className="container mx-auto px-4">
        {lostItems?.data?.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-2xl border border-line bg-surface shadow-card">
              <FaSearch className="text-2xl text-ink-mute" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-ink">
              {searchTerm ? "No items found" : "No lost items yet"}
            </h3>
            <p className="mx-auto mb-6 max-w-md text-ink-dim">
              {searchTerm
                ? `No items found for "${searchTerm}". Try adjusting your search terms or browse all items.`
                : "No lost items have been reported yet. Check back later or be the first to report a lost item!"}
            </p>
            {searchTerm && (
              <button onClick={clearSearch} className="btn btn-outline">
                Clear search and view all items
              </button>
            )}
          </div>
        ) : (
          <div className="mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lostItems?.data?.map((lostItem: lostItem) => {
              return (
                <div
                  key={lostItem?.id}
                  className="card card-hover group overflow-hidden"
                >
                  <div className="relative overflow-hidden">
                    <div className="h-56 w-full overflow-hidden bg-surface-2">
                      <img
                        src={lostItem?.img}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        alt={lostItem?.lostItemName}
                        width={500}
                        height={500}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/bgimg.png";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>

                    {lostItem?.isFound ? (
                      <span className="badge badge-ok absolute right-3 top-3 bg-surface/90 backdrop-blur-md">
                        <FaCheck />
                        Found
                      </span>
                    ) : (
                      <span className="badge badge-danger absolute right-3 top-3 bg-surface/90 backdrop-blur-md">
                        <FaExclamationTriangle />
                        Lost
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="mb-3 line-clamp-1 text-lg font-bold text-ink transition-colors group-hover:text-accent">
                      {lostItem?.lostItemName}
                    </h3>

                    <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-ink-dim">
                      {lostItem?.description}
                    </p>

                    <div className="mb-5 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <FaCalendarAlt className="shrink-0 text-ink-mute" />
                        <span className="text-ink-dim">
                          {formatDate(lostItem?.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FaMapMarkerAlt className="shrink-0 text-ink-mute" />
                        <span className="line-clamp-1 text-ink-dim">
                          {lostItem.location}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/lostItems/${lostItem?.id}`}
                      className="btn btn-outline w-full"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-col items-center space-y-4 pb-8">
          {/* Page Info */}
          <div className="text-sm text-ink-mute">
            Showing page {currentPage} of {totalPages} (
            {lostItems?.meta?.total || 0} total items)
          </div>

          <nav className="inline-flex items-center gap-1 rounded-2xl border border-line bg-surface p-2 shadow-card">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                currentPage === 1
                  ? "cursor-not-allowed text-ink-mute"
                  : "text-ink-dim hover:bg-white/5 hover:text-ink"
              }`}
            >
              <FaChevronLeft className="mr-2 h-3 w-3" />
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                const endPage = Math.min(
                  totalPages,
                  startPage + maxVisiblePages - 1
                );

                // Adjust startPage if we're near the end
                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }

                // First page
                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => handlePageChange(1)}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-ink-dim transition-colors hover:bg-white/5"
                    >
                      1
                    </button>
                  );
                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis1" className="px-2 text-ink-mute">
                        ...
                      </span>
                    );
                  }
                }

                // Visible pages
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        currentPage === i
                          ? "bg-accent-strong text-accent-ink"
                          : "text-ink-dim hover:bg-white/5"
                      }`}
                    >
                      {i}
                    </button>
                  );
                }

                // Last page
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis2" className="px-2 text-ink-mute">
                        ...
                      </span>
                    );
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => handlePageChange(totalPages)}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-ink-dim transition-colors hover:bg-white/5"
                    >
                      {totalPages}
                    </button>
                  );
                }

                return pages;
              })()}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? "cursor-not-allowed text-ink-mute"
                  : "text-ink-dim hover:bg-white/5 hover:text-ink"
              }`}
            >
              Next
              <FaChevronRight className="ml-2 h-3 w-3" />
            </button>
          </nav>

          {/* Quick Jump */}
          {totalPages > 10 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-ink-mute">Go to page:</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                  }
                }}
                className="field w-16 px-2 py-1 text-center"
              />
              <span className="text-ink-mute">of {totalPages}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LostItemsPage;
