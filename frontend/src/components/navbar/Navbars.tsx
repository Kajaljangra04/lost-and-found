import { useEffect, useState } from "react";
import { signOut, useUserVerification } from "../../auth/auth";
import { Dropdown, DropdownHeader, DropdownItem, DropdownDivider } from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toastNotify from "../modal/toastNotify";
import {
  FaSearch,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaList,
  FaTachometerAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Report Lost", to: "/reportlostItem" },
  { label: "Report Found", to: "/reportFoundItem" },
  { label: "Lost Items", to: "/lostItems" },
  { label: "Found Items", to: "/foundItems" },
  { label: "AI Search", to: "/ai-search" },
];

export function Navbars() {
  const navigate = useNavigate();
  const location = useLocation();
  const users = useUserVerification();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile sheet whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  const handleSignOut = () => {
    signOut(navigate);
    toastNotify({ message: "Log out successfully", status: true });
  };

  const isActive = (to: string) =>
    to === "/"
      ? location.pathname === "/" && !location.hash
      : location.pathname === to;

  const linkClass = (active: boolean) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
      active
        ? "bg-white/[0.07] text-ink"
        : "text-ink-dim hover:bg-white/5 hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-indigo-500 shadow-glow">
            <FaSearch className="text-sm text-white" />
          </span>
          <span className="hidden sm:block leading-tight">
            <span className="block text-[15px] font-extrabold tracking-tight text-ink">
              Lost &amp; Found
            </span>
            <span className="block text-[11px] font-medium text-ink-mute">
              Find what matters
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={linkClass(isActive(link.to))}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/#aboutUs"
            className={linkClass(
              location.pathname === "/" && location.hash === "#aboutUs"
            )}
          >
            About
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {users?.email ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-right lg:block">
                <p className="text-sm font-semibold text-ink">
                  {users?.name || "User"}
                </p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-mute">
                  {users?.role || "USER"}
                </p>
              </div>

              <Dropdown
                arrowIcon={false}
                inline
                label={
                  <div className="group relative cursor-pointer">
                    {users?.userImg ? (
                      <img
                        src={users?.userImg}
                        alt="User"
                        className="h-10 w-10 rounded-full border border-line-strong object-cover transition group-hover:border-accent/60"
                      />
                    ) : (
                      <div className="grid h-10 w-10 place-items-center rounded-full border border-line-strong bg-surface-3 text-sm font-semibold text-ink transition group-hover:border-accent/60">
                        {users?.name?.charAt(0)?.toUpperCase() ||
                          users?.email?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-canvas bg-ok" />
                  </div>
                }
                className="border border-line bg-surface shadow-pop"
              >
                <DropdownHeader className="bg-surface-2/60">
                  <div className="flex items-center gap-3 py-2">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-surface-4 text-xs font-bold text-ink">
                      {users?.name?.charAt(0)?.toUpperCase() ||
                        users?.email?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </div>
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {users?.email || "User"}
                      </span>
                      <span className="block text-xs text-ink-mute">
                        {users?.role}
                      </span>
                    </div>
                  </div>
                </DropdownHeader>

                {users?.role === "ADMIN" && (
                  <DropdownItem className="rounded-lg text-ink-dim hover:bg-white/5 hover:text-ink">
                    <Link to="/dashboard" className="flex w-full items-center gap-2.5">
                      <FaTachometerAlt className="text-accent" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownItem>
                )}

                <DropdownItem className="rounded-lg text-ink-dim hover:bg-white/5 hover:text-ink">
                  <Link
                    to="/dashboard/settings"
                    className="flex w-full items-center gap-2.5"
                  >
                    <FaCog className="text-accent" />
                    <span>Settings</span>
                  </Link>
                </DropdownItem>

                <DropdownItem className="rounded-lg text-ink-dim hover:bg-white/5 hover:text-ink">
                  <Link
                    to="/dashboard/myLostItems"
                    className="flex w-full items-center gap-2.5"
                  >
                    <FaList className="text-warn" />
                    <span>My lost items</span>
                  </Link>
                </DropdownItem>

                <DropdownItem className="rounded-lg text-ink-dim hover:bg-white/5 hover:text-ink">
                  <Link
                    to="/dashboard/myFoundItems"
                    className="flex w-full items-center gap-2.5"
                  >
                    <FaSearch className="text-ok" />
                    <span>My found items</span>
                  </Link>
                </DropdownItem>

                <DropdownItem className="rounded-lg text-ink-dim hover:bg-white/5 hover:text-ink">
                  <Link
                    to="/dashboard/myClaimRequest"
                    className="flex w-full items-center gap-2.5"
                  >
                    <FaUser className="text-indigo-300" />
                    <span>My claims</span>
                  </Link>
                </DropdownItem>

                <DropdownDivider className="bg-line" />

                <DropdownItem
                  onClick={handleSignOut}
                  className="rounded-lg text-rose-300 hover:bg-rose-500/15 hover:text-rose-200"
                >
                  <div className="flex w-full items-center gap-2.5">
                    <FaSignOutAlt />
                    <span>Sign out</span>
                  </div>
                </DropdownItem>
              </Dropdown>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get started
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg text-ink-dim transition hover:bg-white/5 hover:text-ink lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="animate-fade-in border-t border-line bg-canvas/95 px-4 pb-4 pt-2 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-white/[0.07] text-ink"
                    : "text-ink-dim hover:bg-white/5 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/#aboutUs"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-dim transition-colors hover:bg-white/5 hover:text-ink"
            >
              About
            </Link>
            {!users?.email && (
              <div className="mt-2 flex gap-2 border-t border-line pt-3">
                <Link to="/login" className="btn btn-outline flex-1">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary flex-1">
                  Get started
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
