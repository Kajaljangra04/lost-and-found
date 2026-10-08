import {
  useGetSingleFoundItemQuery,
  useCreateClaimMutation,
} from "../../redux/api/api";
import { Spinner } from "flowbite-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";
import "react-toastify/dist/ReactToastify.css";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUser,
  FaTag,
  FaTimes,
  FaCheckCircle,
  FaBoxOpen,
  FaExclamationTriangle,
} from "react-icons/fa";

const SingleFoundItem = () => {
  const { foundItem: foundItemParam } = useParams<{ foundItem: string }>();
  const foundItemId = foundItemParam;

  const { data: singleFoundItem, isLoading } = useGetSingleFoundItemQuery(
    foundItemId ?? "",
    { skip: !foundItemId }
  );

  const [createClaim, { isLoading: claimLoading }] = useCreateClaimMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<{ lostDate: string; distinguishingFeatures: string }>();

  if (!foundItemId) {
    return (
      <div className="page flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold text-ink">Item Not Found</h1>
          <p className="mb-6 text-ink-dim">
            The requested item could not be found.
          </p>
          <Link
            to="/foundItems"
            className="link-accent inline-flex items-center gap-2"
          >
            <FaArrowLeft />
            Back to Found Items
          </Link>
        </div>
      </div>
    );
  }

  const handleClaimModal = () => {
    setIsClaimModalOpen(true);
  };

  const onSubmit = async (data: {
    lostDate: string;
    distinguishingFeatures: string;
  }) => {
    setIsSubmitting(true);

    try {
      const claimData = {
        foundItemId: foundItemId,
        distinguishingFeatures: data.distinguishingFeatures,
        lostDate: new Date(data.lostDate).toISOString(),
      };

      const res = await createClaim(claimData);
      if (res?.error) {
        toast.error(
          getErrorMessage(res.error, "Failed to submit claim. Please try again.")
        );
      } else if (res.data?.success) {
        toast.success(
          "Claim submitted successfully! We will review your request."
        );
        setIsClaimModalOpen(false);
        reset();
      } else {
        toast.error("Failed to submit claim. Please try again.");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page flex items-center justify-center">
        <div className="text-center">
          <Spinner size="xl" className="mb-4 text-accent" />
          <p className="text-ink-dim">Loading found item details...</p>
        </div>
      </div>
    );
  }

  // Extract the item data from API response
  const foundItemData = singleFoundItem?.data;

  // Handle case where item is not found
  if (!foundItemData) {
    return (
      <div className="page flex items-center justify-center px-4 py-12">
        <div className="card w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-bad/30 bg-bad/10">
            <FaExclamationTriangle className="text-xl text-rose-300" />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-ink">Item Not Found</h2>
          <p className="mb-6 text-ink-dim">
            The found item you're looking for doesn't exist or may have been
            removed.
          </p>
          <Link to="/foundItems" className="btn btn-outline w-full">
            <FaArrowLeft />
            Back to Found Items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page">
        {/* Header with Back Button */}
        <div className="border-b border-line">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Link
              to="/foundItems"
              className="link-accent mb-4 inline-flex items-center gap-2 text-sm"
            >
              <FaArrowLeft />
              Back to Found Items
            </Link>
            <h1 className="mb-2 text-3xl font-bold text-ink md:text-4xl">
              {foundItemData?.foundItemName || "Found Item"}
            </h1>
            <p className="text-ink-dim">
              Found item details and claim information
            </p>
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
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    src={foundItemData?.img}
                    alt={foundItemData?.foundItemName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/bgimg.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </div>

                {/* Status Badge */}
                <div className="absolute right-4 top-4">
                  {foundItemData?.isClaimed ? (
                    <span className="badge badge-ok bg-surface/90 backdrop-blur-md">
                      <FaCheckCircle />
                      Claimed
                    </span>
                  ) : (
                    <span className="badge badge-accent bg-surface/90 backdrop-blur-md">
                      <FaBoxOpen />
                      Available
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
                  {foundItemData?.description ||
                    "No description available for this item."}
                </p>
              </div>

              {/* Details */}
              <div className="card p-6">
                <dl className="divide-y divide-line">
                  <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
                    <dt className="flex items-center gap-2.5 text-sm text-ink-mute">
                      <FaCalendarAlt className="text-accent" />
                      Date Found
                    </dt>
                    <dd className="text-right text-sm font-semibold text-ink">
                      {foundItemData?.date
                        ? new Date(foundItemData.date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "Date not specified"}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="flex items-center gap-2.5 text-sm text-ink-mute">
                      <FaMapMarkerAlt className="text-accent" />
                      Location
                    </dt>
                    <dd className="text-right text-sm font-semibold text-ink">
                      {foundItemData?.location || "Location not specified"}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="flex items-center gap-2.5 text-sm text-ink-mute">
                      <FaTag className="text-accent" />
                      Category
                    </dt>
                    <dd className="text-right text-sm font-semibold text-ink">
                      {foundItemData?.category?.name || "Uncategorized"}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
                    <dt className="flex items-center gap-2.5 text-sm text-ink-mute">
                      <FaUser className="text-accent" />
                      Found By
                    </dt>
                    <dd className="text-right text-sm font-semibold text-ink">
                      {foundItemData?.user?.username || "Anonymous"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Claim Process Information */}
              <div className="card p-6">
                <h3 className="mb-4 text-lg font-bold text-ink">
                  Claim Process
                </h3>
                <p className="mb-6 leading-relaxed text-ink-dim">
                  {foundItemData?.claimProcess ||
                    "To claim this item, please provide the date you lost it and any distinguishing features that can help verify ownership."}
                </p>

                {!foundItemData?.isClaimed ? (
                  <button
                    onClick={handleClaimModal}
                    className="btn btn-brand btn-lg w-full"
                  >
                    Start Claim Process
                  </button>
                ) : (
                  <div className="rounded-xl border border-ok/30 bg-ok/10 p-4 text-center">
                    <p className="font-medium text-emerald-300">
                      This item has already been claimed
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Claim Modal */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="card relative w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line p-6">
              <h3 className="text-xl font-bold text-ink">Claim Process</h3>
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="rounded-lg p-1.5 text-ink-mute transition-colors hover:text-ink"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="mb-6 text-sm text-ink-dim">
                Please provide the following information to verify your
                ownership of this item.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="lostDate" className="field-label">
                    When did you lose this item? *
                  </label>
                  <input
                    id="lostDate"
                    type="date"
                    {...register("lostDate", {
                      required: "Lost date is required",
                    })}
                    className="field"
                  />
                  {errors.lostDate && (
                    <p className="field-error">
                      {errors.lostDate.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="distinguishingFeatures" className="field-label">
                    Distinguishing Features *
                  </label>
                  <textarea
                    id="distinguishingFeatures"
                    rows={4}
                    placeholder="Describe unique features, colors, brands, scratches, or any other identifying characteristics..."
                    {...register("distinguishingFeatures", {
                      required: "Distinguishing features are required",
                      minLength: {
                        value: 10,
                        message: "Please provide at least 10 characters",
                      },
                    })}
                    className="field resize-none"
                  />
                  {errors.distinguishingFeatures && (
                    <p className="field-error">
                      {errors.distinguishingFeatures.message as string}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsClaimModalOpen(false)}
                    className="btn btn-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || claimLoading}
                    className="btn btn-brand flex-1"
                  >
                    {isSubmitting || claimLoading ? (
                      <>
                        <Spinner
                          size="sm"
                          className="fill-accent-ink text-accent-ink"
                        />
                        Submitting...
                      </>
                    ) : (
                      "Submit Claim"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SingleFoundItem;
