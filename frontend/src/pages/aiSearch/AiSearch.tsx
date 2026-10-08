import React, { useState } from "react";
import {
  FaSearch,
  FaRobot,
  FaBrain,
  FaSpinner,
  FaEye,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaTags,
  FaPaperPlane,
  FaLightbulb,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useAiSearchMutation } from "../../redux/api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../utils/getErrorMessage";

interface AISearchFoundItem {
  id: string;
  img?: string;
  foundItemName: string;
  description?: string;
  location?: string;
  date?: string;
  isClaimed?: boolean;
  category?: { name?: string };
  user?: { username?: string };
}

interface AISearchLostItem {
  id: string;
  img?: string;
  lostItemName: string;
  description?: string;
  location?: string;
  date?: string;
  isFound?: boolean;
  category?: { name?: string };
  user?: { username?: string };
}

interface SearchResult {
  foundItems: AISearchFoundItem[];
  lostItems: AISearchLostItem[];
  reasoning: string;
  totalFound: number;
  totalLost: number;
}

const SEARCH_TIPS = [
  {
    title: "Be Descriptive",
    example:
      '"I lost a black iPhone 13 with a cracked screen and blue case"',
  },
  {
    title: "Include Location",
    example: '"near the library", "in the cafeteria", "at the parking lot"',
  },
  {
    title: "Mention Timing",
    example: '"yesterday afternoon", "last week", "this morning"',
  },
  {
    title: "Add Unique Features",
    example: '"silver keychain attached", "has a sticker", "scratched surface"',
  },
  {
    title: "Use Natural Language",
    example: "Our AI understands context - speak naturally!",
  },
];

const AiSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [aiSearch, { isLoading }] = useAiSearchMutation();
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    try {
      const response = await aiSearch({ query: searchQuery }).unwrap();

      // The response might be wrapped in a data property
      const result = response.data || response;

      setSearchResults(result);
      toast.success("AI search completed successfully!");
    } catch (error) {
      toast.error(getErrorMessage(error, "Search failed. Please try again."));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="page">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero header */}
        <header className="section-head">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-accent/30 bg-accent/10 shadow-glow">
            <FaBrain className="text-2xl text-accent" />
          </div>
          <span className="eyebrow">
            <FaRobot />
            AI search
          </span>
          <h1 className="section-title">
            <span className="text-gradient">AI-Powered</span> Search
          </h1>
          <p className="section-sub">
            Harness the power of artificial intelligence to find lost or found
            items. Simply describe what you're looking for in natural language!
          </p>
        </header>

        {/* Prompt command bar */}
        <div className="mx-auto mb-10 max-w-5xl">
          <form
            onSubmit={handleSearch}
            className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <FaRobot className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., I lost a black iPhone 13 with a cracked screen near the library yesterday..."
                  className="field pl-11"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-brand w-full sm:w-auto"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPaperPlane />
                )}
                <span>{isLoading ? "Searching..." : "Search with AI"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Loading state */}
        {isLoading && !searchResults && (
          <div className="mx-auto max-w-7xl space-y-6" aria-hidden="true">
            <div className="skeleton h-40 w-full rounded-2xl" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="skeleton h-64" />
              <div className="skeleton h-64" />
              <div className="skeleton h-64" />
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults && (
          <div className="mx-auto max-w-7xl space-y-8">
            {/* AI Reasoning */}
            <section className="card p-6 md:p-8">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
                  <FaBrain />
                </span>
                <h2 className="text-xl font-semibold text-ink">AI Analysis</h2>
              </div>
              <p className="rounded-xl border border-line bg-surface-2 p-5 text-[15px] leading-relaxed text-ink-dim">
                {searchResults.reasoning}
              </p>
            </section>

            {/* Results Summary */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="card p-6 text-center">
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-ok/10 text-ok">
                  <FaCheckCircle />
                </span>
                <h3 className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink-mute">
                  Found Items
                </h3>
                <p className="mt-1 text-4xl font-bold text-ink">
                  {searchResults.totalFound}
                </p>
                <p className="mt-2 text-sm text-ink-dim">
                  Items waiting to be claimed
                </p>
              </div>
              <div className="card p-6 text-center">
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-bad/10 text-bad">
                  <FaExclamationTriangle />
                </span>
                <h3 className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink-mute">
                  Lost Items
                </h3>
                <p className="mt-1 text-4xl font-bold text-ink">
                  {searchResults.totalLost}
                </p>
                <p className="mt-2 text-sm text-ink-dim">
                  Items looking for owners
                </p>
              </div>
            </div>

            {/* Found Items Results */}
            {searchResults.foundItems.length > 0 && (
              <section>
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-ok/10 text-ok">
                    <FaCheckCircle />
                  </span>
                  <h2 className="text-xl font-semibold text-ink">
                    Found Items That Match Your Search
                  </h2>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {searchResults.foundItems.map((item) => (
                    <article
                      key={item.id}
                      className="card card-hover flex flex-col p-5"
                    >
                      {item.img && (
                        <div className="relative mb-4">
                          <img
                            src={item.img}
                            alt={item.foundItemName}
                            className="h-40 w-full rounded-xl object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/bgimg.png";
                            }}
                          />
                          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-black/55 via-black/10 to-transparent" />
                          {item.isClaimed ? (
                            <span className="badge badge-ok absolute right-2 top-2">
                              Claimed
                            </span>
                          ) : (
                            <span className="badge badge-accent absolute right-2 top-2">
                              Available
                            </span>
                          )}
                        </div>
                      )}
                      <h3 className="mb-3 truncate text-base font-semibold text-ink">
                        {item.foundItemName}
                      </h3>
                      <p
                        className="mb-4 text-sm text-ink-dim"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          lineHeight: "1.4em",
                          maxHeight: "4.2em",
                          overflow: "hidden",
                        }}
                      >
                        {item.description}
                      </p>
                      <div className="mb-5 space-y-2 text-sm text-ink-dim">
                        <div className="flex items-center gap-2">
                          <FaTags className="text-accent" />
                          <span className="text-accent-soft">
                            {item.category?.name || "No category"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-accent" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-accent" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaUser className="text-accent" />
                          <span>{item.user?.username}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/foundItems/${item.id}`)}
                        className="btn btn-outline mt-auto w-full"
                      >
                        <FaEye />
                        <span>View Details</span>
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Lost Items Results */}
            {searchResults.lostItems.length > 0 && (
              <section>
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-bad/10 text-bad">
                    <FaExclamationTriangle />
                  </span>
                  <h2 className="text-xl font-semibold text-ink">
                    Lost Items That Match Your Search
                  </h2>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {searchResults.lostItems.map((item) => (
                    <article
                      key={item.id}
                      className="card card-hover flex flex-col p-5"
                    >
                      {item.img && (
                        <div className="relative mb-4">
                          <img
                            src={item.img}
                            alt={item.lostItemName}
                            className="h-40 w-full rounded-xl object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/bgimg.png";
                            }}
                          />
                          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-black/55 via-black/10 to-transparent" />
                          <span className="badge badge-danger absolute right-2 top-2">
                            Lost
                          </span>
                        </div>
                      )}
                      <h3 className="mb-3 truncate text-base font-semibold text-ink">
                        {item.lostItemName}
                      </h3>
                      <p
                        className="mb-4 text-sm text-ink-dim"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          lineHeight: "1.4em",
                          maxHeight: "4.2em",
                          overflow: "hidden",
                        }}
                      >
                        {item.description}
                      </p>
                      <div className="mb-5 space-y-2 text-sm text-ink-dim">
                        <div className="flex items-center gap-2">
                          <FaTags className="text-accent" />
                          <span className="text-accent-soft">
                            {item.category?.name || "No category"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-accent" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-accent" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaUser className="text-accent" />
                          <span>{item.user?.username}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/lostItems/${item.id}`)}
                        className="btn btn-outline mt-auto w-full"
                      >
                        <FaEye />
                        <span>View Details</span>
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* No Results */}
            {searchResults.totalFound === 0 && searchResults.totalLost === 0 && (
              <div className="rounded-2xl border border-bad/30 bg-bad/10 p-10 text-center text-rose-300 md:p-14">
                <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-bad/15">
                  <FaSearch className="text-xl" />
                </span>
                <h2 className="text-xl font-semibold">No items found</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-rose-300/80">
                  Try adjusting your search query or check back later for new
                  items. Our AI is constantly learning to provide better
                  results!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Search Tips */}
        <div className="mx-auto mt-14 max-w-5xl">
          <div className="card p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-warn/10 text-warn">
                <FaLightbulb />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  Search Tips for Better Results
                </h2>
                <p className="text-sm text-ink-mute">
                  Small details help the AI match items faster and more
                  accurately.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {SEARCH_TIPS.map((tip, index) => (
                <div
                  key={tip.title}
                  className="rounded-xl border border-line bg-surface-2 p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="badge badge-neutral">{index + 1}</span>
                    <h3 className="text-sm font-semibold text-ink">
                      {tip.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-dim">
                    {tip.example}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-accent/30 bg-accent/10 p-4">
              <div className="mb-2">
                <span className="badge badge-accent">
                  <FaRobot />
                  AI-powered
                </span>
              </div>
              <p className="text-sm leading-relaxed text-ink-dim">
                Powered by advanced AI that learns from every search to provide
                more accurate results
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSearch;
