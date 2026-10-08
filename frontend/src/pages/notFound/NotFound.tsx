import { Link } from "react-router-dom";
import { FaSearch, FaHome, FaList } from "react-icons/fa";

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="text-center max-w-lg animate-fade-in">
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
              <FaSearch className="text-white text-2xl" />
            </div>
          </div>
          <span className="absolute -bottom-2 -right-2 w-10 h-10 bg-gray-800 border-2 border-cyan-500 rounded-full flex items-center justify-center text-cyan-400 text-sm font-bold">
            404
          </span>
        </div>

        <p className="text-5xl font-extrabold text-white mb-3">
          This item is <span className="text-gradient">lost</span>
        </p>
        <p className="text-lg text-gray-400 mb-8">
          The page you're looking for can't be found. Maybe it was reported
          somewhere else — or maybe it never existed here at all.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <FaHome className="mr-2" />
            Back to Home
          </Link>
          <Link
            to="/foundItems"
            className="inline-flex items-center justify-center gap-2 border-2 border-cyan-600 text-cyan-400 hover:bg-cyan-600 hover:text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
          >
            <FaList className="mr-2" />
            Browse Found Items
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;