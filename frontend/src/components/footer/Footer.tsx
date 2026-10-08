import { Link } from "react-router-dom";
import { FaLinkedin, FaGithub, FaSearch } from "react-icons/fa";

const Footers = () => {
  const year = new Date().getFullYear();

  const quickLinks = [
    { label: "Found Items", to: "/foundItems" },
    { label: "Lost Items", to: "/lostItems" },
    { label: "AI Search", to: "/ai-search" },
    { label: "About us", to: "/#aboutUs" },
  ];

  const actions = [
    { label: "Report a Lost Item", to: "/reportlostItem" },
    { label: "Report a Found Item", to: "/reportFoundItem" },
    { label: "Log in", to: "/login" },
    { label: "Create an account", to: "/register" },
  ];

  return (
    <footer className="border-t border-line bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-indigo-500">
                <FaSearch className="text-sm text-white" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-ink">
                Lost &amp; Found
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-mute">
              Connecting people with their lost belongings, one item at a time.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-mute">
              Quick Links
            </h2>
            <ul className="space-y-2.5 text-sm">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-ink-dim transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get involved */}
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-mute">
              Get Involved
            </h2>
            <ul className="space-y-2.5 text-sm">
              {actions.map((action) => (
                <li key={action.label}>
                  <Link
                    to={action.to}
                    className="text-ink-dim transition-colors hover:text-ink"
                  >
                    {action.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About the project */}
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-mute">
              About The Project
            </h2>
            <p className="text-sm leading-relaxed text-ink-mute">
              A full-stack demo built with React, Node.js, Prisma &amp;
              PostgreSQL. Report items, file claims, and let AI-powered search
              find what matters.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <span className="text-sm text-ink-mute">
            © {year} Lost &amp; Found Management. All rights reserved.
          </span>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/alamin147"
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-9 w-9 place-items-center rounded-lg text-ink-dim transition hover:bg-white/5 hover:text-ink"
              aria-label="GitHub profile"
            >
              <FaGithub size={18} />
            </a>
            <a
              href="https://www.linkedin.com/in/alamin-developer/"
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-9 w-9 place-items-center rounded-lg text-ink-dim transition hover:bg-white/5 hover:text-ink"
              aria-label="LinkedIn profile"
            >
              <FaLinkedin size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footers;
