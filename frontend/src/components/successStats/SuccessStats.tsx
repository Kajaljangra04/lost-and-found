import {
  FaHeart,
  FaBoxOpen,
  FaExclamationTriangle,
  FaBrain,
  FaChartLine,
} from "react-icons/fa";
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
      icon: <FaBoxOpen className="h-5 w-5" />,
      number: foundCount.toLocaleString(),
      label: "Found Items Listed",
      description: "Items currently waiting to be reunited",
    },
    {
      icon: <FaExclamationTriangle className="h-5 w-5" />,
      number: lostCount.toLocaleString(),
      label: "Lost Items Reported",
      description: "Help someone find what matters",
    },
    {
      icon: <FaHeart className="h-5 w-5" />,
      number: total.toLocaleString(),
      label: "Total Reports",
      description: "Every report is a chance to reconnect",
    },
    {
      icon: <FaBrain className="h-5 w-5" />,
      number: String(categoryCount),
      label: "Item Categories",
      description: "Searchable with descriptions & AI matching",
    },
  ];

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="section-head">
          <span className="eyebrow">
            <FaChartLine />
            Live impact
          </span>
          <h2 className="section-title">Making Connections That Matter</h2>
          <p className="section-sub">
            A live community platform — report items, browse what's been found,
            and let AI help you search. These numbers update in real time.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="card card-hover p-6 text-center">
              <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent">
                {stat.icon}
              </div>
              <div className="text-4xl font-bold tabular-nums text-ink">
                {stat.number}
              </div>
              <h3 className="mt-2 text-[13px] font-semibold uppercase tracking-wider text-ink-mute">
                {stat.label}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-dim">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessStats;
