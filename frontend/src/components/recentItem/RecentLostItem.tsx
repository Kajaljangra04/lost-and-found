import { Spinner } from "flowbite-react";
import { Link } from "react-router-dom";
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
      <div className="min-h-[40vh] flex items-center justify-center bg-gray-900">
        <Spinner size="lg" />
      </div>
    );
  }

  const items = lostItems?.data ?? [];

  return (
    <div className="bg-gray-900 py-10">
      <div className="px-4 mx-auto max-w-screen-2xl sm:py-6 lg:px-6">
        <div className="mx-auto text-center">
          <h2 className="mb-4 text-3xl lg:text-4xl tracking-tight font-extrabold text-white pt-20 md:pt-16">
            Recent Lost Items
          </h2>
          <p className="font-light text-gray-400 sm:text-xl mb-8">
            These are the recent lost item reports
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🧳</p>
          <p className="text-gray-400 text-lg">
            Nothing reported lost yet — if you lost something, tell us.
          </p>
          <Link
            to="/reportlostItem"
            className="inline-block mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Report a Lost Item
          </Link>
        </div>
      ) : (
        <div className="container mx-auto flex justify-center mb-10">
          <div className="grid gap-8 mx-auto grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
            {items.slice(0, 8).map((item: LostItem) => {
              return (
                <div
                  key={item?.id}
                  className="group relative bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl overflow-hidden shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-cyan-500/10 border border-gray-700 hover:border-gray-600 max-w-sm"
                >
                  <div className="relative overflow-hidden">
                    <div className="h-56 w-full overflow-hidden">
                      <img
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>

                    {item?.isFound ? (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm border border-green-400/50">
                        ✓ Found
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm border border-red-400/50">
                        ⚠ Lost
                      </div>
                    )}
                  </div>

                  <div className="p-5 text-white">
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-400 transition-colors duration-300 line-clamp-1">
                      {item?.lostItemName}
                    </h3>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {item?.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-400 mr-2">📅</span>
                        <span className="text-gray-200">
                          {formatDate(item?.date)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-400 mr-2">📍</span>
                        <span className="text-gray-200 line-clamp-1">
                          {item?.location}
                        </span>
                      </div>
                    </div>

                    <Link to={`/lostItems/${item?.id}`} className="block">
                      <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg hover:shadow-xl">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentLostItem;