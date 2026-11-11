import { useMemo, useState, type FormEvent } from "react";
import {
  useGetMyMatchesQuery,
  useLazyGetOwnershipChallengeQuery,
  useVerifyOwnershipMutation,
  useStartHandoverMutation,
  useConfirmHandoverMutation,
} from "../../redux/api/api";
import {
  FaRobot,
  FaSearch,
  FaLock,
  FaCheckCircle,
  FaBoxOpen,
  FaClock,
  FaExchangeAlt,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";

type MatchStatus =
  | "POTENTIAL_MATCH"
  | "VERIFICATION_PENDING"
  | "MATCHED"
  | "HANDOVER_PENDING"
  | "RECEIVED"
  | "REJECTED";

type Item = {
  id: string;
  isMine: boolean;
  lostItemName?: string;
  foundItemName?: string;
  description?: string;
  img?: string;
  location?: string;
  date?: string;
  status?: string;
  category?: { name?: string };
};

type Candidate = {
  id: string;
  score: number;
  confidence: string;
  explanation: string;
  status: MatchStatus;
  updatedAt: string;
  lostItem: Item;
  foundItem: Item;
};

const statusLabels: Record<MatchStatus, string> = {
  POTENTIAL_MATCH: "Potential match",
  VERIFICATION_PENDING: "Verification pending",
  MATCHED: "Ownership verified",
  HANDOVER_PENDING: "Handover pending",
  RECEIVED: "Successfully recovered",
  REJECTED: "Rejected",
};

const statusStyle: Record<MatchStatus, string> = {
  POTENTIAL_MATCH: "badge-accent",
  VERIFICATION_PENDING: "badge-accent",
  MATCHED: "badge-ok",
  HANDOVER_PENDING: "badge-accent",
  RECEIVED: "badge-ok",
  REJECTED: "badge-neutral",
};

export default function Matches() {
  const { data, isLoading, isError, refetch } = useGetMyMatchesQuery({});
  const [loadChallenge, { isLoading: challengeLoading }] =
    useLazyGetOwnershipChallengeQuery();
  const [verifyOwnership, { isLoading: verifying }] =
    useVerifyOwnershipMutation();
  const [startHandover, { isLoading: startingHandover }] =
    useStartHandoverMutation();
  const [confirmHandover, { isLoading: confirming }] =
    useConfirmHandoverMutation();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [challenge, setChallenge] = useState<{
    matchId: string;
    questions: string[];
  } | null>(null);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [otp, setOtp] = useState("");

  const candidates: Candidate[] = data?.data?.candidates || [];
  const counts = data?.data?.counts || {
    total: 0,
    pending: 0,
    verified: 0,
    received: 0,
  };

  const filteredCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesFilter =
        filter === "ALL" ||
        (filter === "PENDING" &&
          ["POTENTIAL_MATCH", "VERIFICATION_PENDING"].includes(candidate.status)) ||
        (filter === "VERIFIED" &&
          ["MATCHED", "HANDOVER_PENDING"].includes(candidate.status)) ||
        (filter === "RECEIVED" && candidate.status === "RECEIVED") ||
        (filter === "REJECTED" && candidate.status === "REJECTED");

      const text = [
        candidate.lostItem.lostItemName,
        candidate.foundItem.foundItemName,
        candidate.lostItem.location,
        candidate.foundItem.location,
        candidate.explanation,
      ].join(" ").toLowerCase();

      return matchesFilter && (!query || text.includes(query));
    });
  }, [candidates, filter, search]);

  const openChallenge = async (candidate: Candidate) => {
    try {
      const response = await loadChallenge(candidate.id).unwrap();
      setChallenge({
        matchId: candidate.id,
        questions: response?.data?.questions || [],
      });
      setAnswers(["", "", ""]);
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Could not load ownership questions."
      );
    }
  };

  const submitAnswers = async (event: FormEvent) => {
    event.preventDefault();
    if (!challenge) return;

    try {
      await verifyOwnership({
        matchId: challenge.matchId,
        answers,
      }).unwrap();

      toast.success("Ownership verified successfully.");
      setChallenge(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Verification failed.");
    }
  };

  const requestHandover = async (matchId: string) => {
    try {
      await startHandover(matchId).unwrap();
      toast.success("Handover code sent to the item reporter.");
    } catch (error: any) {
      toast.error(error?.data?.message || "Could not initiate handover.");
    }
  };

  const submitOtp = async (event: FormEvent, matchId: string) => {
    event.preventDefault();

    try {
      await confirmHandover({ matchId, otp }).unwrap();
      toast.success("Receipt confirmed successfully.");
      setOtp("");
    } catch (error: any) {
      toast.error(error?.data?.message || "Invalid handover code.");
    }
  };

  const itemName = (item: Item, type: "lost" | "found") =>
    (type === "lost" ? item.lostItemName : item.foundItemName) ||
    "Unnamed item";

  const renderItem = (item: Item, type: "lost" | "found") => (
    <div className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface-2">
      {item.img ? (
        <img
          src={item.img}
          alt={itemName(item, type)}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="grid h-40 place-items-center text-4xl text-ink-mute">
          <FaBoxOpen />
        </div>
      )}
      <div className="p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
          {type === "lost" ? "Lost report" : "Found report"}
        </span>
        <h3 className="mt-1 break-words font-bold text-ink">
          {itemName(item, type)}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-5 text-ink-dim">
          {item.description || "No description provided."}
        </p>
        <div className="mt-3 space-y-1 text-xs text-ink-mute">
          <p>Location: {item.location || "Not specified"}</p>
          <p>Category: {item.category?.name || "Uncategorized"}</p>
          <p>
            Date:{" "}
            {item.date ? new Date(item.date).toLocaleDateString() : "Unknown"}
          </p>
          {item.isMine && (
            <span className="inline-block pt-1 font-semibold text-accent">
              Your report
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <main className="page px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <span className="eyebrow">
            <FaRobot /> AI-powered recovery
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-ink sm:text-4xl">
            Your potential matches
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-dim">
            Findora automatically compares your lost and found reports.
            Review potential matches, verify ownership privately and arrange
            a secure handover. Similarity scores are not proof of ownership.
          </p>
        </header>

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Total matches", value: counts.total, icon: FaExchangeAlt },
            { label: "Pending review", value: counts.pending, icon: FaClock },
            { label: "Verified / handover", value: counts.verified, icon: FaLock },
            { label: "Items recovered", value: counts.received, icon: FaCheckCircle },
          ].map((stat) => (
            <div key={stat.label} className="card p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-ink-mute sm:text-sm">
                  {stat.label}
                </span>
                <stat.icon className="text-accent" />
              </div>
              <p className="mt-3 text-2xl font-extrabold text-ink">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        <section className="card mb-6 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute" />
              <input
                className="field pl-11"
                placeholder="Search by item name, location or details..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <select
              className="field lg:max-w-56"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="ALL">All matches</option>
              <option value="PENDING">Pending review</option>
              <option value="VERIFIED">Verified / handover</option>
              <option value="RECEIVED">Recovered</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <button className="btn btn-outline" onClick={() => refetch()}>
              Refresh
            </button>
          </div>
        </section>

        {isLoading && (
          <div className="card flex items-center justify-center gap-3 p-12 text-ink-dim">
            <FaSpinner className="animate-spin text-accent" />
            Loading your matches...
          </div>
        )}

        {isError && !isLoading && (
          <div className="card p-8 text-center">
            <h3 className="font-bold text-ink">Unable to load matches</h3>
            <p className="mt-2 text-sm text-ink-dim">
              Please try again.
            </p>
            <button className="btn btn-brand mt-4" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && filteredCandidates.length === 0 && (
          <div className="card p-10 text-center">
            <FaRobot className="mx-auto text-4xl text-ink-mute" />
            <h2 className="mt-4 text-xl font-bold text-ink">
              {candidates.length === 0
                ? "No potential matches yet"
                : "No matches in this view"}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-ink-dim">
              {candidates.length === 0
                ? "When a compatible lost or found report is submitted, Findora will automatically rank potential matches here."
                : "Try changing your search or status filter."}
            </p>
            {candidates.length === 0 && (
              <p className="mt-4 text-xs text-ink-mute">
                Make sure your lost or found report has a useful description,
                accurate location and a clear photograph.
              </p>
            )}
          </div>
        )}

        <section className="space-y-5">
          {filteredCandidates.map((candidate) => {
            const finderOwnsItem = candidate.foundItem.isMine;
            const status = candidate.status;
            const score = Math.round(candidate.score);

            return (
              <article key={candidate.id} className="card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge badge-accent">
                      {candidate.confidence} confidence
                    </span>
                    <span className={`badge ${statusStyle[status]}`}>
                      {statusLabels[status]}
                    </span>
                  </div>
                  <span className="text-xs text-ink-mute">
                    Updated {new Date(candidate.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2">
                  {renderItem(candidate.lostItem, "lost")}
                  {renderItem(candidate.foundItem, "found")}
                </div>

                <div className="mx-4 mb-4 rounded-xl border border-line bg-surface-2 p-4 sm:mx-5 sm:mb-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-ink-mute">
                        AI similarity score
                      </span>
                      <p className="mt-1 text-2xl font-extrabold text-accent">
                        {score}%
                      </p>
                    </div>
                    <span className="text-xs text-ink-mute">
                      Ranking signal only
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-ink-dim">
                    {candidate.explanation}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 px-4 pb-5 sm:px-5">
                  {finderOwnsItem &&
                    ["POTENTIAL_MATCH", "VERIFICATION_PENDING"].includes(status) &&
                    score >= 55 && (
                      <button
                        className="btn btn-brand"
                        disabled={challengeLoading}
                        onClick={() => openChallenge(candidate)}
                      >
                        <FaLock /> Verify ownership
                      </button>
                    )}

                  {finderOwnsItem && status === "MATCHED" && (
                    <button
                      className="btn btn-brand"
                      disabled={startingHandover}
                      onClick={() => requestHandover(candidate.id)}
                    >
                      Send handover code
                    </button>
                  )}

                  {finderOwnsItem && status === "HANDOVER_PENDING" && (
                    <>
                      <button
                        className="btn btn-outline"
                        disabled={startingHandover}
                        onClick={() => requestHandover(candidate.id)}
                      >
                        Resend handover code
                      </button>
                      <form
                        onSubmit={(event) => submitOtp(event, candidate.id)}
                        className="flex w-full flex-col gap-2 rounded-xl border border-line p-4 sm:flex-row"
                      >
                        <input
                          className="field max-w-xs text-center tracking-[.3em]"
                          inputMode="numeric"
                          maxLength={6}
                          value={otp}
                          onChange={(event) =>
                            setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                          }
                          placeholder="000000"
                          required
                        />
                        <button
                          className="btn btn-brand"
                          type="submit"
                          disabled={confirming || otp.length !== 6}
                        >
                          {confirming ? "Confirming..." : "Confirm received"}
                        </button>
                      </form>
                    </>
                  )}

                  {status === "RECEIVED" && (
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-500">
                      <FaCheckCircle /> Item successfully recovered
                    </span>
                  )}

                  {!finderOwnsItem &&
                    ["POTENTIAL_MATCH", "VERIFICATION_PENDING"].includes(status) && (
                      <p className="text-sm text-ink-dim">
                        The finder must complete private ownership verification.
                        You will receive an update when the match progresses.
                      </p>
                    )}

                  {challenge?.matchId === candidate.id && (
                    <form
                      onSubmit={submitAnswers}
                      className="w-full rounded-xl border border-accent/25 bg-accent/[0.04] p-4"
                    >
                      <h4 className="font-bold text-ink">
                        Private ownership verification
                      </h4>
                      <p className="mb-4 mt-1 text-xs text-ink-dim">
                        Answer all three questions. Answers are checked privately.
                      </p>
                      {challenge.questions.map((question, index) => (
                        <div key={index} className="mb-3">
                          <label
                            className="field-label"
                            htmlFor={`answer-${index}`}
                          >
                            {question}
                          </label>
                          <input
                            id={`answer-${index}`}
                            className="field"
                            value={answers[index]}
                            onChange={(event) =>
                              setAnswers((current) =>
                                current.map((value, i) =>
                                  i === index ? event.target.value : value
                                )
                              )
                            }
                            required
                            autoComplete="off"
                          />
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="btn btn-brand"
                          type="submit"
                          disabled={verifying}
                        >
                          {verifying ? "Checking..." : "Submit answers"}
                        </button>
                        <button
                          className="btn btn-outline"
                          type="button"
                          onClick={() => setChallenge(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        <p className="mt-8 text-center text-xs leading-5 text-ink-mute">
          AI similarity is not proof of ownership. Always complete the
          private verification process and confirm the physical handover.
        </p>
      </div>
    </main>
  );
}
