import { FaExclamationTriangle } from "react-icons/fa";

/**
 * Renders an inline error banner when a data query fails,
 * so users see feedback instead of an empty grid/table.
 */
const QueryErrorBanner = ({ message }: { message?: string }) => {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-rose-300">
      <FaExclamationTriangle className="flex-shrink-0 text-rose-400" />
      <span>
        {message ||
          "Something went wrong while loading this data. Please try again."}
      </span>
    </div>
  );
};

export default QueryErrorBanner;
