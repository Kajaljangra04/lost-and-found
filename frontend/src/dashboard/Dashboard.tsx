import {
  FaUsers,
  FaBoxOpen,
  FaClipboardList,
  FaExclamationTriangle,
  FaChartLine,
} from "react-icons/fa";
import { useAdminStatsQuery, useGetRecentActivityQuery } from "../redux/api/api";
import type { RecentActivity } from "../types/types";
import { Link } from "react-router-dom";

const timeAgo = (date?: string | Date) => {
  if (!date) return "just now";
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const activityStyles: Record<
  string,
  { dot: string; badge: string }
> = {
  found: { dot: "bg-accent", badge: "badge-accent" },
  lost: { dot: "bg-bad", badge: "badge-danger" },
  claim: { dot: "bg-warn", badge: "badge-warn" },
  approved: { dot: "bg-ok", badge: "badge-ok" },
  rejected: { dot: "bg-bad", badge: "badge-danger" },
  default: { dot: "bg-ink-mute", badge: "badge-neutral" },
};

const Dashboard = () => {
  const { data: adminStats, isLoading } = useAdminStatsQuery({});
  const { data: recentActivityData } = useGetRecentActivityQuery({});
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          {/* Welcome Section Skeleton */}
          <div className="skeleton mb-6 h-32"></div>

          {/* Stats Grid Skeleton */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-24"></div>
            ))}
          </div>

          {/* Recent Activity Section Skeleton */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Activity Feed Skeleton */}
            <div className="card p-6">
              <div className="skeleton mb-6 h-6 w-1/3"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start space-x-3 p-3">
                    <div className="skeleton mt-2 h-2 w-2 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-3/4"></div>
                      <div className="skeleton h-3 w-1/4"></div>
                    </div>
                    <div className="skeleton h-6 w-16 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Skeleton */}
            <div className="card p-6">
              <div className="skeleton mb-6 h-6 w-1/3"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-16"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const recentActivity = recentActivityData?.data || [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card p-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Welcome back to the Dashboard!
        </h1>
        <p className="mt-2 text-ink-dim">
          Here's what's happening with your lost and found system today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-mute">Total Found Items</p>
              <p className="text-2xl font-bold tabular-nums text-ink">
                {adminStats?.data?.foundItems || "0"}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
              <FaBoxOpen />
            </div>
          </div>
        </div>

        <div className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-mute">Total Lost Items</p>
              <p className="text-2xl font-bold tabular-nums text-ink">
                {adminStats?.data?.lostItems || "0"}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
              <FaExclamationTriangle />
            </div>
          </div>
        </div>

        <div className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-mute">Pending Claims</p>
              <p className="text-2xl font-bold tabular-nums text-ink">
                {adminStats?.data?.pendingClaims || "0"}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
              <FaClipboardList />
            </div>
          </div>
        </div>

        <div className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-mute">Active Users</p>
              <p className="text-2xl font-bold tabular-nums text-ink">
                {adminStats?.data?.totalUsers || "0"}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
              <FaUsers />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Activity Feed */}
        <div className="card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Recent Activity</h2>
          </div>
          <div className="space-y-2">
            {recentActivity.length === 0 && (
              <p className="py-4 text-sm text-ink-mute">
                No recent activity yet — new items and claims will show up
                here.
              </p>
            )}
            {recentActivity.map((activity: RecentActivity) => {
              const style =
                activityStyles[activity.type] || activityStyles.default;
              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 rounded-lg p-3 transition-colors hover:bg-white/[0.03]"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${style.dot}`}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">
                      {activity.title}
                    </p>
                    <p className="text-xs text-ink-mute">
                      {timeAgo(activity.time)}
                    </p>
                  </div>

                  <span className={`badge capitalize ${style.badge}`}>
                    {activity.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="mb-6 text-lg font-semibold text-ink">Quick Actions</h2>

          <div className="space-y-3">
            <Link to="/dashboard/categories">
              <button className="flex w-full items-center justify-between rounded-xl border border-line bg-surface-2 p-4 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-3">
                <span>Add New Category</span>
                <FaChartLine className="w-5 h-5 text-accent" />
              </button>
            </Link>

            <Link to="/dashboard/users">
              <button className="flex w-full items-center justify-between rounded-xl border border-line bg-surface-2 p-4 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-3">
                <span>Manage Users</span>
                <FaUsers className="w-5 h-5 text-accent" />
              </button>
            </Link>

            <Link to="/dashboard/settings">
              <button className="flex w-full items-center justify-between rounded-xl border border-line bg-surface-2 p-4 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-3">
                <span>Settings</span>
                <FaBoxOpen className="w-5 h-5 text-accent" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
