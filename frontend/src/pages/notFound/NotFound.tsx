import { Link } from "react-router-dom";
import { FaSearch, FaHome, FaList } from "react-icons/fa";

const NotFound = () => {
  return (
    <div className="page grid place-items-center px-4 py-24">
      <div className="max-w-lg animate-fade-in text-center">
        <div className="relative mb-8 inline-flex items-center justify-center">
          <div className="grid h-24 w-24 place-items-center rounded-2xl border border-line bg-surface shadow-card">
            <FaSearch className="text-3xl text-accent" />
          </div>
          <span className="absolute -bottom-2 -right-2 rounded-full border border-line-strong bg-surface-3 px-2.5 py-1 text-xs font-bold text-ink-mute">
            404
          </span>
        </div>

        <p className="mb-3 text-5xl font-extrabold tracking-tight text-ink">
          This item is <span className="text-gradient">lost</span>
        </p>
        <p className="mb-8 text-lg text-ink-dim">
          The page you're looking for can't be found. Maybe it was reported
          somewhere else — or maybe it never existed here at all.
        </p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className="btn btn-primary btn-lg">
            <FaHome />
            Back to Home
          </Link>
          <Link to="/foundItems" className="btn btn-outline btn-lg">
            <FaList />
            Browse Found Items
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
