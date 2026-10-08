import { useParams, Link } from "react-router-dom";
import { useGetSingleLostItemQuery } from "../../redux/api/api";
import { Spinner } from "flowbite-react";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUser,
  FaTag,
  FaEnvelope,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

const SingleLostItem = () => {
  const { lostItem: lostItemId } = useParams<{ lostItem: string }>();
  const { data: singleLostItem, isLoading } = useGetSingleLostItemQuery(
    lostItemId ?? "",
    { skip: !lostItemId }
  );

  if (isLoading) {
    return (
      <div className="page flex items-center justify-center">
        <div className="text-center">
          <Spinner size="xl" className="mb-4 text-accent" />
          <p className="text-ink-dim">Loading lost item details...</p>
        </div>
      </div>
    );
  }

  const lostItem = singleLostItem?.data;

  // Handle case where item is not found
  if (!lostItem) {
    return (
      <div className="page flex items-center justify-center px-4 py-12">
        <div className="card w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-bad/30 bg-bad/10">
            <FaExclamationTriangle className="text-xl text-rose-300" />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-ink">Item Not Found</h2>
          <p className="mb-6 text-ink-dim">
            The lost item you're looking for doesn't exist or may have been
            removed.
          </p>
          <Link to="/lostItems" className="btn btn-outline w-full">
            <FaArrowLeft />
            Back to Lost Items
          </Link>
        </div>
      </div>
    );
  }

  const {
    lostItemName,
    date,
    isFound,
    img,
    description,
    location,
    user,
    category,
  } = lostItem;

  return (
    <div className="page">
      {/* Header with Back Button */}
      <div className="border-b border-line">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            to="/lostItems"
            className="link-accent mb-4 inline-flex items-center gap-2 text-sm"
          >
            <FaArrowLeft />
            Back to Lost Items
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-ink md:text-4xl">
            {lostItemName || "Lost Item"}
          </h1>
          <p className="text-ink-dim">Lost item details and information</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Image Section */}
          <div className="space-y-6">
            <div className="group relative">
              <div className="aspect-square overflow-hidden rounded-2xl border border-line bg-surface-2 shadow-card">
                <img
                  src={img}
                  alt={lostItemName}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  width={500}
                  height={500}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/bgimg.png";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </div>

              {/* Status Badge */}
              <div className="absolute right-4 top-4">
                {isFound ? (
                  <span className="badge badge-ok bg-surface/90 backdrop-blur-md">
                    <FaCheck />
                    Found
                  </span>
                ) : (
                  <span className="badge badge-danger bg-surface/90 backdrop-blur-md">
                    <FaExclamationTriangle />
                    Missing
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-8">
            {/* Description */}
            <div className="card p-6">
              <h2 className="mb-4 text-xl font-bold text-ink">Description</h2>
              <p className="leading-relaxed text-ink-dim">
                {description || "No description available for this item."}
              </p>
            </div>

            {/* Details */}
            <div className="card p-6">
              <dl className="divide-y divide-line">
                <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
                  <dt className="flex items-center gap-2.5 text-sm text-ink-mute">
                    <FaCalendarAlt className="text-accent" />
                    Date Lost
                  </dt>
                  <dd className="text-right text-sm font-semibold text-ink">
                    {date
                      ? new Date(date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Date not specified"}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="flex items-center gap-2.5 text-sm text-ink-mute">
                    <FaMapMarkerAlt className="text-accent" />
                    Location
                  </dt>
                  <dd className="text-right text-sm font-semibold text-ink">
                    {location || "Location not specified"}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="flex items-center gap-2.5 text-sm text-ink-mute">
                    <FaTag className="text-accent" />
                    Category
                  </dt>
                  <dd className="text-right text-sm font-semibold text-ink">
                    {category?.name || "Uncategorized"}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
                  <dt className="flex items-center gap-2.5 text-sm text-ink-mute">
                    <FaUser className="text-accent" />
                    Reported By
                  </dt>
                  <dd className="text-right text-sm font-semibold text-ink">
                    {user?.username || "Anonymous"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Contact Information */}
            <div className="card p-6">
              <h3 className="mb-4 text-lg font-bold text-ink">
                Found This Item?
              </h3>
              <p className="mb-6 leading-relaxed text-ink-dim">
                If you have found this item, please contact the owner or report
                it through our platform to help reunite them with their
                belongings.
              </p>

              {!isFound ? (
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link
                    to="/reportFoundItem"
                    className="btn btn-brand flex-1"
                  >
                    Report Found Item
                  </Link>
                  <a
                    href={`mailto:${
                      user?.email || ""
                    }?subject=${encodeURIComponent(
                      `I found your lost item: ${lostItemName}`
                    )}&body=${encodeURIComponent(
                      `Hi ${
                        user?.username || "there"
                      },\n\nI think I found your lost item "${lostItemName}" near ${location}. Here are some details:\n\n[Describe the item you found]\n\nYou can reach me back at this email address.\n\nThanks!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline flex-1"
                  >
                    <FaEnvelope />
                    Contact Owner
                  </a>
                </div>
              ) : (
                <div className="rounded-xl border border-ok/30 bg-ok/10 p-4 text-center">
                  <p className="font-medium text-emerald-300">
                    This item has been marked as found!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleLostItem;
