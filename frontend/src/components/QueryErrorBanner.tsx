import { FaExclamationTriangle } from "react-icons/fa";

/**
 * Renders an inline error banner when a data query fails,
 * so users see feedback instead of an empty grid/table.
 */
const QueryErrorBanner = ({ message }: { message?: string }) => {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-900/20 px-4 py-3 mb-6 text-sm text-red-300">
      <FaExclamationTriangle className="flex-shrink-0 text-red-400" />
      <span>
        {message ||
          "Something went wrong while loading this data. Please try again."}
      </span>
    </div>
  );
};

export default QueryErrorBanner;