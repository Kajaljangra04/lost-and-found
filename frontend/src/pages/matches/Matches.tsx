import { useState, type FormEvent } from "react";
import { useGetMyFoundItemQuery, useGetMyLostItemQuery, useLazyGetAiMatchesForFoundQuery, useLazyGetAiMatchesForLostQuery, useLazyGetOwnershipChallengeQuery, useVerifyOwnershipMutation, useStartHandoverMutation, useConfirmHandoverMutation } from "../../redux/api/api";
import type { FoundItem } from "../../types/types";
import { FaCheckCircle, FaLock, FaRobot, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

type LostCandidate = {
  id: string;
  score: number;
  confidence: string;
  explanation: string;
  status: string;
  foundItem: { id: string; foundItemName: string; description: string; img?: string; location: string; date: string; contactName?: string; contactPhone?: string; category?: { name?: string } };
};


type Candidate = {
  id: string;
  score: number;
  confidence: string;
  explanation: string;
  status: string;
  lostItem: { id: string; lostItemName: string; description: string; img?: string; location: string; date: string; category?: { name?: string } };
};

export default function Matches() {
  const { data: foundResponse, isLoading: loadingItems } = useGetMyFoundItemQuery({});
  const items: FoundItem[] = foundResponse?.data || [];
  const { data: lostResponse } = useGetMyLostItemQuery({});
  const lostItems = lostResponse?.data || [];
  const [loadLostMatches, { data: lostMatchResponse, isFetching: loadingLostMatches }] = useLazyGetAiMatchesForLostQuery();
  const [selectedLostId, setSelectedLostId] = useState("");
  const lostCandidates: LostCandidate[] = lostMatchResponse?.data?.candidates || [];
  const [selectedId, setSelectedId] = useState("");
  const [loadMatches, { data: matchResponse, isFetching }] = useLazyGetAiMatchesForFoundQuery();
  const [loadChallenge, { isLoading: challengeLoading }] = useLazyGetOwnershipChallengeQuery();
  const [verifyOwnership, { isLoading: verifying }] = useVerifyOwnershipMutation();
  const [startHandover, { isLoading: startingHandover }] = useStartHandoverMutation();
  const [confirmHandover, { isLoading: confirming }] = useConfirmHandoverMutation();
  const [challenge, setChallenge] = useState<{ matchId: string; questions: string[] } | null>(null);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [otp, setOtp] = useState("");
  const candidates: Candidate[] = matchResponse?.data?.candidates || [];

  const selectLostItem = async (id: string) => {
    setSelectedLostId(id);
    if (!id) return;
    try { await loadLostMatches(id, true).unwrap(); }
    catch (error: any) { toast.error(error?.data?.message || "Could not load your potential matches."); }
  };

  const selectItem = async (id: string) => {
    setSelectedId(id);
    setChallenge(null);
    try { await loadMatches(id, true).unwrap(); }
    catch (error: any) { toast.error(error?.data?.message || "Could not load matches."); }
  };

  const openChallenge = async (candidate: Candidate) => {
    try {
      const response = await loadChallenge(candidate.id).unwrap();
      setChallenge({ matchId: candidate.id, questions: response?.data?.questions || [] });
      setAnswers(["", "", ""]);
    } catch (error: any) {
      toast.error(error?.data?.message || "Could not load verification questions.");
    }
  };

  const submitAnswers = async (event: FormEvent) => {
    event.preventDefault();
    if (!challenge) return;
    try {
      await verifyOwnership({ matchId: challenge.matchId, answers }).unwrap();
      toast.success("Ownership verified. The item is ready for handover.");
      setChallenge(null);
      await loadMatches(selectedId, true);
    } catch (error: any) {
      toast.error(error?.data?.message || "Answers could not be verified.");
    }
  };

  const requestHandover = async (candidate: Candidate) => {
    try {
      await startHandover(candidate.id).unwrap();
      toast.success("A one-time code has been emailed to the lost-item reporter.");
      await loadMatches(selectedId, true);
    } catch (error: any) {
      toast.error(error?.data?.message || "Could not start handover. Check email configuration.");
    }
  };

  const submitOtp = async (event: FormEvent, matchId: string) => {
    event.preventDefault();
    try {
      await confirmHandover({ matchId, otp }).unwrap();
      toast.success("Receipt confirmed. The item is marked as received.");
        setOtp("");
      await loadMatches(selectedId, true);
    } catch (error: any) {
      toast.error(error?.data?.message || "Handover code was not accepted.");
    }
  };

  return (
    <main className="page px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <header className="mb-9 max-w-2xl">
          <span className="eyebrow"><FaRobot/> AI recovery matches</span>
          <h1 className="mt-3 text-3xl font-extrabold text-ink sm:text-4xl">A possible match is a reason to look closer.</h1>
          <p className="mt-3 text-sm leading-6 text-ink-dim">Choose a found item to see ranked lost-item reports. Complete the private ownership check before arranging handover. A similarity score never confirms ownership.</p>
        </header>
        <section className="card mb-8 p-5 sm:p-6">
          <label className="field-label" htmlFor="lostItem">I lost something — check matches for my report</label>
          <select id="lostItem" className="field" value={selectedLostId} disabled={loadingItems} onChange={(e)=>selectLostItem(e.target.value)}>
            <option value="">{loadingItems ? "Loading your reports…" : "Choose one of your lost items"}</option>
            {lostItems.map((item: any)=><option key={item.id} value={item.id}>{item.lostItemName}</option>)}
          </select>
          {selectedLostId && <div className="mt-4 space-y-3">
            {loadingLostMatches ? <p className="text-sm text-ink-dim">Checking found-item reports…</p> :
              lostCandidates.length === 0 ? <p className="text-sm text-ink-dim">No potential matches yet. Findora will compare this report when new found items are submitted.</p> :
              lostCandidates.map((candidate) => <article key={candidate.id} className="rounded-xl border border-line bg-surface-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-ink">{candidate.foundItem.foundItemName}</h3><span className="badge badge-accent">{Math.round(candidate.score)}% similarity</span></div>
                <p className="mt-2 text-sm text-ink-dim">{candidate.foundItem.description}</p>
                <p className="mt-2 text-xs text-ink-mute">{candidate.foundItem.location} · {candidate.confidence} confidence · {candidate.status.replace(/_/g," ")}</p>
                <p className="mt-3 text-xs leading-5 text-ink-mute">{candidate.explanation}</p>
                <p className="mt-3 text-xs text-accent">The finder must complete private ownership verification before a handover can be arranged.</p>
              </article>)
            }
          </div>}
        </section>

        <section className="card mb-8 p-5 sm:p-6">
          <label className="field-label" htmlFor="foundItem">I found something — check lost reports</label>
          <select id="foundItem" className="field" value={selectedId} disabled={loadingItems} onChange={(e)=>selectItem(e.target.value)}>
            <option value="">{loadingItems ? "Loading your reports…" : "Choose a found item"}</option>
            {items.map((item)=><option key={item.id} value={item.id}>{item.foundItemName}</option>)}
          </select>
          {!loadingItems && items.length===0 && <p className="mt-3 text-sm text-ink-mute">You haven't reported a found item yet. <a className="link-accent" href="/reportFoundItem">Report one now.</a></p>}
        </section>
        {isFetching && <div className="card flex items-center gap-3 p-6 text-sm text-ink-dim"><FaSpinner className="animate-spin text-accent"/> Comparing active lost-item reports…</div>}
        {selectedId && !isFetching && <section className="space-y-5">
          <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold text-ink">Top potential matches</h2><span className="badge badge-accent">{candidates.length} candidates</span></div>
          {candidates.length===0 && <div className="card p-8 text-center"><FaRobot className="mx-auto text-3xl text-ink-mute"/><h3 className="mt-3 font-bold text-ink">No close matches yet</h3><p className="mt-1 text-sm text-ink-dim">Your report stays active. New lost reports can create matches later.</p></div>}
          {candidates.map((candidate)=> <article key={candidate.id} className="card overflow-hidden">
            <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="min-h-44 bg-surface-2">{candidate.lostItem.img ? <img src={candidate.lostItem.img} alt={candidate.lostItem.lostItemName} className="h-full min-h-44 w-full object-cover"/> : <div className="grid h-full min-h-44 place-items-center text-4xl text-ink-mute">?</div>}</div>
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3"><span className="badge badge-accent">{candidate.confidence} confidence · {Math.round(candidate.score)}% similarity</span><span className={`badge ${candidate.status==="RECEIVED"?"badge-ok":candidate.status==="MATCHED"||candidate.status==="HANDOVER_PENDING"?"badge-ok":"badge-neutral"}`}>{candidate.status==="MATCHED" ? "READY TO BE RECEIVED" : candidate.status.replace(/_/g," ")}</span></div>
                <h3 className="mt-3 text-xl font-bold text-ink">{candidate.lostItem.lostItemName}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-dim">{candidate.lostItem.description}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-mute"><span>{candidate.lostItem.location}</span><span>{new Date(candidate.lostItem.date).toLocaleDateString()}</span><span>{candidate.lostItem.category?.name || "Uncategorized"}</span></div>
                <p className="mt-4 rounded-xl border border-line bg-surface-2 p-3 text-xs leading-5 text-ink-dim">{candidate.explanation}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {candidate.status==="POTENTIAL_MATCH"||candidate.status==="VERIFICATION_PENDING" ? <button className="btn btn-brand" disabled={challengeLoading} onClick={()=>openChallenge(candidate)}><FaLock/> Verify ownership</button> : null}
                  {candidate.status==="MATCHED" ? <button className="btn btn-brand" disabled={startingHandover} onClick={()=>requestHandover(candidate)}>Send handover code</button> : null}
                  {candidate.status==="HANDOVER_PENDING" ? <button className="btn btn-outline" disabled={startingHandover} onClick={()=>requestHandover(candidate)}>Resend handover code</button> : null}
                  {candidate.status==="RECEIVED" ? <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400"><FaCheckCircle/> Ready and received</span> : null}
                </div>
                {challenge?.matchId===candidate.id && <form onSubmit={submitAnswers} className="mt-5 rounded-2xl border border-accent/25 bg-accent/[0.04] p-4">
                  <h4 className="font-bold text-ink">Private ownership verification</h4><p className="mb-4 mt-1 text-xs leading-5 text-ink-dim">Answer all three questions exactly. Repeated failed attempts temporarily lock verification.</p>
                  {challenge.questions.map((question,index)=><div key={index} className="mb-3"><label className="field-label" htmlFor={`answer-${index}`}>{question}</label><input id={`answer-${index}`} className="field" value={answers[index]} onChange={(e)=>setAnswers((current)=>current.map((value,i)=>i===index?e.target.value:value))} required autoComplete="off"/></div>)}
                  <button className="btn btn-brand" type="submit" disabled={verifying}>{verifying?"Checking answers…":"Submit private answers"}</button>
                </form>}
                {candidate.status==="HANDOVER_PENDING" && <form onSubmit={(event)=>submitOtp(event,candidate.id)} className="mt-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-4"><h4 className="font-bold text-ink">Confirm physical handover</h4><p className="mb-3 mt-1 text-xs leading-5 text-ink-dim">Ask the item reporter for the 6-digit code sent to their email. Confirm only after the item is physically received.</p><div className="flex flex-col gap-2 sm:flex-row"><input className="field max-w-xs text-center tracking-[.3em]" inputMode="numeric" maxLength={6} value={otp} onChange={(e)=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="000000" required/><button className="btn btn-brand" type="submit" disabled={confirming||otp.length!==6}>{confirming?"Confirming…":"Confirm received"}</button></div></form>}
              </div>
            </div>
          </article>)}
        </section>}
      </div>
    </main>
  );
}
