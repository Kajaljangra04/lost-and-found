import { Spinner } from "flowbite-react";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaCheck,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaSuitcase,
} from "react-icons/fa";
import { useGetLostItemsQuery } from "../../redux/api/api";
import type { LostItem } from "../../types/types";

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

const RecentLostItem = () => {
  const { data: lostItems, isLoading } = useGetLostItemsQuery({});

  if (isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center py-16">
        <Spinner size="lg" className="text-accent" />
      </div>
    );
  }

  const items = lostItems?.data ?? [];

  return (
    <div className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="section-head">
          <span className="eyebrow">
            <FaExclamationTriangle />
            Lost items
          </span>
          <h2 className="section-title">Recent Lost Items</h2>
          <p className="section-sub">
            These are the recent lost item reports
          </p>
        </div>

        {items.length === 0 ? (
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-surface-3 text-xl text-ink-mute">
              <FaSuitcase />
            </div>
            <p className="text-ink-dim">
              Nothing reported lost yet — if you lost something, tell us.
            </p>
            <Link to="/reportlostItem" className="btn btn-brand mt-6">
              Report a Lost Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {items.slice(0, 8).map((item: LostItem) => {
              return (
                <div key={item?.id} className="card card-hover overflow-hidden">
                  <div className="relative h-48 w-full border-b border-line bg-surface-2">
                    <img
                      className="h-full w-full object-cover"
                      src={item?.img}
                      alt={item?.lostItemName}
                      width={500}
                      height={500}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== "/bgimg.png") {
                          target.onerror = null;
                          target.src = "/bgimg.png";
                        }
                      }}
                    />
                    {item?.isFound ? (
                      <span className="badge badge-ok absolute right-3 top-3 backdrop-blur">
                        <FaCheck />
                        Found
                      </span>
                    ) : (
                      <span className="badge badge-danger absolute right-3 top-3 backdrop-blur">
                        <FaExclamationTriangle />
                        Lost
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="mb-2 line-clamp-1 text-lg font-bold text-ink">
                      {item?.lostItemName}
                    </h3>

                    <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-ink-dim">
                      {item?.description}
                    </p>

                    <div className="mb-5 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="shrink-0 text-ink-mute" />
                        <span className="text-ink-dim">
                          {formatDate(item?.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="shrink-0 text-ink-mute" />
                        <span className="line-clamp-1 text-ink-dim">
                          {item?.location}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/lostItems/${item?.id}`}
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
    </div>
  );
};

export default RecentLostItem;
