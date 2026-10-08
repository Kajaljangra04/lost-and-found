import { FaHeart, FaBoxOpen, FaExclamationTriangle, FaBrain } from "react-icons/fa";
import {
  useGetFoundItemsQuery,
  useGetLostItemsQuery,
  useCategoryQuery,
} from "../../redux/api/api";

const SuccessStats = () => {
  const { data: foundData } = useGetFoundItemsQuery({ page: 1, limit: 1 });
  const { data: lostData } = useGetLostItemsQuery({ page: 1, limit: 1 });
  const { data: categoryData } = useCategoryQuery({});

  const foundCount = foundData?.meta?.total || 0;
  const lostCount = lostData?.meta?.total || 0;
  const categoryCount = categoryData?.data?.length || 0;
  const total = foundCount + lostCount;

  const stats = [
    {
      icon: <FaBoxOpen className="w-8 h-8" />,
      number: foundCount.toLocaleString(),
      label: "Found Items Listed",
      description: "Items currently waiting to be reunited",
    },
    {
      icon: <FaExclamationTriangle className="w-8 h-8" />,
      number: lostCount.toLocaleString(),
      label: "Lost Items Reported",
      description: "Help someone find what matters",
    },
    {
      icon: <FaHeart className="w-8 h-8" />,
      number: total.toLocaleString(),
      label: "Total Reports",
      description: "Every report is a chance to reconnect",
    },
    {
      icon: <FaBrain className="w-8 h-8" />,
      number: String(categoryCount),
      label: "Item Categories",
      description: "Searchable with descriptions & AI matching",
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto flex max-w-4xl flex-col items-center space-y-4 text-center mb-16">
          <h2 className="text-4xl md:text-5xl tracking-tight font-extrabold leading-tight text-white">
            Making{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Connections
            </span>{" "}
            That Matter
          </h2>
          <p className="font-light text-gray-300 text-lg md:text-xl max-w-3xl">
            A live community platform — report items, browse what's been found,
            and let AI help you search. These numbers update in real time.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="group">
              <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl border border-gray-700 p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-gray-600 text-center h-full">
                <div className="text-cyan-400 group-hover:text-blue-400 transition-colors duration-300 mb-4 flex justify-center">
                  {stat.icon}
                </div>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-white block">
                    {stat.number}
                  </span>
                </div>
                <h3 className="font-bold text-xl text-white group-hover:text-cyan-400 transition-colors duration-300 mb-2">
                  {stat.label}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessStats;