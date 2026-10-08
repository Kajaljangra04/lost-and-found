import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaSearch,
  FaClipboardList,
  FaUsers,
  FaBoxOpen,
  FaExclamationTriangle,
  FaCog,
  FaBars,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaSignOutAlt,
  FaUser,
  FaList,
} from "react-icons/fa";
import { useUserVerification, signOut } from "../auth/auth";
import "react-toastify/dist/ReactToastify.css";
import {
  Dropdown,
  DropdownHeader,
  DropdownItem,
  DropdownDivider,
} from "flowbite-react";
import toastNotify from "../components/modal/toastNotify";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useUserVerification();
  const menuItems = [
    {
      title: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/dashboard",
      badge: null,
      adminOnly: true,
    },
    {
      title: "Found Items",
      icon: <FaSearch />,
      path: "/dashboard/found-items",
      adminOnly: true,
      badge: null,
    },
    {
      title: "Lost Items",
      icon: <FaExclamationTriangle />,
      path: "/dashboard/lost-items",
      adminOnly: true,
      badge: null,
    },
    {
      title: "Claims",
      icon: <FaClipboardList />,
      path: "/dashboard/claims",
      adminOnly: true,
      badge: null,
    },
    {
      title: "Users",
      icon: <FaUsers />,
      path: "/dashboard/users",
      badge: null,
      adminOnly: true,
    },
    {
      title: "Categories",
      icon: <FaBoxOpen />,
      path: "/dashboard/categories",
      badge: null,
      adminOnly: true,
    },
    {
      title: "My Lost Items",
      icon: <FaSearch />,
      path: "/dashboard/myLostItems",
      badge: null,
      adminOnly: false,
    },
    {
      title: "My Found Items",
      icon: <FaBoxOpen />,
      path: "/dashboard/myFoundItems",
      badge: null,
      adminOnly: false,
    },
    {
      title: "My Claims",
      icon: <FaBoxOpen />,
      path: "/dashboard/myClaimRequest",
      badge: null,
      adminOnly: false,
    },
    {
      title: "Settings",
      icon: <FaCog />,
      path: "/dashboard/settings",
      badge: null,
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || user?.role == "ADMIN"
  );

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const handleSignOut = () => {
    signOut(navigate);
    toastNotify({ message: "Log out successfully", status: true });
  };

  return (
    <div className="min-h-screen">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-64 border-r border-line bg-surface transition-all duration-300 shadow-pop ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-line p-4">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent to-indigo-500 shadow-glow">
                <FaSearch className="text-sm text-white" />
              </span>
              <div className="leading-tight">
                <h1 className="text-[15px] font-extrabold tracking-tight text-ink">
                  Lost &amp; Found
                </h1>
                <p className="text-[11px] font-medium text-ink-mute">
                  Dashboard
                </p>
              </div>
            </div>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-ink-mute transition-colors hover:bg-white/5 hover:text-ink lg:hidden"
          >
            <FaTimes />
          </button>

          {/* Desktop Collapse Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden rounded-lg p-2 text-ink-mute transition-colors hover:bg-white/5 hover:text-ink lg:block"
          >
            {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {filteredMenuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  isActive(item.path)
                    ? "bg-white/[0.07] text-ink"
                    : "text-ink-dim hover:bg-white/5 hover:text-ink"
                }`}
              >
                <div
                  className={`flex-shrink-0 ${
                    sidebarCollapsed ? "mx-auto" : "mr-3"
                  }`}
                >
                  {item.icon}
                </div>

                {!sidebarCollapsed && (
                  <>
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <span className="badge badge-danger ml-auto">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Tooltip for collapsed sidebar */}
                {sidebarCollapsed && (
                  <div className="absolute left-full z-50 ml-2 invisible whitespace-nowrap rounded-lg border border-line bg-surface-3 px-3 py-2 text-xs font-medium text-ink opacity-0 shadow-pop transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    {item.title}
                    {item.badge && (
                      <span className="badge badge-danger ml-2">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="my-4 mx-3 border-t border-line"></div>

          {/* Quick Actions */}
          <div className="px-3 space-y-1">
            <Link
              to="/"
              className="group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-ink-dim transition-colors duration-150 hover:bg-white/5 hover:text-ink"
            >
              <div
                className={`flex-shrink-0 ${
                  sidebarCollapsed ? "mx-auto" : "mr-3"
                }`}
              >
                <FaHome />
              </div>
              {!sidebarCollapsed && <span>Back to Site</span>}

              {sidebarCollapsed && (
                <div className="absolute left-full z-50 ml-2 invisible whitespace-nowrap rounded-lg border border-line bg-surface-3 px-3 py-2 text-xs font-medium text-ink opacity-0 shadow-pop transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  Back to Site
                </div>
              )}
            </Link>

            <button
              onClick={handleSignOut}
              className="group relative flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-rose-300 transition-colors duration-150 hover:bg-rose-500/10 hover:text-rose-200"
            >
              <div
                className={`flex-shrink-0 ${
                  sidebarCollapsed ? "mx-auto" : "mr-3"
                }`}
              >
                <FaSignOutAlt />
              </div>
              {!sidebarCollapsed && <span>Sign Out</span>}

              {sidebarCollapsed && (
                <div className="absolute left-full z-50 ml-2 invisible whitespace-nowrap rounded-lg border border-line bg-surface-3 px-3 py-2 text-xs font-medium text-rose-300 opacity-0 shadow-pop transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  Sign Out
                </div>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 border-b border-line bg-canvas/75 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-ink-dim transition-colors hover:bg-white/5 hover:text-ink lg:hidden"
            >
              <FaBars />
            </button>

            {/* Page Title */}
            <div className="flex-1 lg:ml-0 ml-4">
              <h1 className="text-lg font-semibold tracking-tight text-ink">
                {location.pathname === "/dashboard" && "Dashboard Overview"}
                {location.pathname.includes("/found-items") &&
                  "Found Items Management"}
                {location.pathname.includes("/lost-items") &&
                  "Lost Items Management"}
                {location.pathname.includes("/claims") && "Claims Management"}
                {location.pathname.includes("/users") && "User Management"}
                {location.pathname.includes("/categories") &&
                  "Category Management"}
                {location.pathname.includes("/settings") && "Settings"}
              </h1>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-ink">
                  {user?.name || "User"}
                </p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-mute">
                  {user?.role || "USER"}
                </p>
              </div>

              <Dropdown
                arrowIcon={false}
                inline
                label={
                  <div className="group relative cursor-pointer">
                    {user?.userImg ? (
                      <img
                        src={user?.userImg}
                        alt="User"
                        className="h-10 w-10 rounded-full border border-line-strong object-cover transition group-hover:border-accent/60"
                      />
                    ) : (
                      <div className="grid h-10 w-10 place-items-center rounded-full border border-line-strong bg-surface-3 text-sm font-semibold text-ink transition group-hover:border-accent/60">
                        {user?.name?.charAt(0)?.toUpperCase() ||
                          user?.username?.charAt(0)?.toUpperCase() ||
                          user?.email?.charAt(0)?.toUpperCase() ||
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
                    {user?.userImg ? (
                      <img
                        src={user?.userImg}
                        alt="User"
                        className="h-9 w-9 rounded-full border border-line object-cover"
                      />
                    ) : (
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-surface-4 text-xs font-bold text-ink">
                        {user?.name?.charAt(0)?.toUpperCase() ||
                          user?.username?.charAt(0)?.toUpperCase() ||
                          user?.email?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {user?.email ? user?.email : "User"}
                      </span>
                      <span className="block text-xs text-ink-mute">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </DropdownHeader>

                {user?.role === "ADMIN" && (
                  <DropdownItem className="rounded-lg text-ink-dim hover:bg-white/5 hover:text-ink">
                    <Link
                      to="/dashboard"
                      className="flex w-full items-center gap-2.5"
                    >
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

                <DropdownItem className="rounded-lg text-ink-dim hover:bg-white/5 hover:text-ink">
                  <Link to="/" className="flex w-full items-center gap-2.5">
                    <FaHome className="text-accent" />
                    <span>Back to Site</span>
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
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
