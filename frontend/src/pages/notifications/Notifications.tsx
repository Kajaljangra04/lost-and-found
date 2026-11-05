import { useGetNotificationsQuery, useMarkNotificationReadMutation } from "../../redux/api/api";
import { FaBell, FaCheck, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

export default function Notifications() {
  const { data: response, isLoading, refetch } = useGetNotificationsQuery({});
  const [markRead, { isLoading: saving }] = useMarkNotificationReadMutation();
  const notifications = response?.data || [];
  const mark = async (id: string) => {
    try { await markRead(id).unwrap(); await refetch(); }
    catch { toast.error("Could not update notification."); }
  };
  return <main className="page px-4 py-12 sm:px-6"><div className="mx-auto max-w-4xl">
    <header className="mb-8"><span className="eyebrow"><FaBell/> Your updates</span><h1 className="mt-3 text-3xl font-extrabold text-ink">Notifications</h1><p className="mt-2 text-sm text-ink-dim">Potential matches, ownership verification and handover updates for your account.</p></header>
    {isLoading ? <div className="card flex items-center gap-3 p-6 text-sm text-ink-dim"><FaSpinner className="animate-spin"/> Loading notifications…</div> : notifications.length===0 ? <div className="card p-10 text-center"><FaBell className="mx-auto text-3xl text-ink-mute"/><h2 className="mt-3 font-bold text-ink">You're all caught up</h2><p className="mt-1 text-sm text-ink-dim">We'll show updates here when your reports receive activity.</p></div> : <div className="space-y-3">{notifications.map((item:any)=><article key={item.id} className={`card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${!item.readAt?"border-accent/30":""}`}><div className="min-w-0"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${item.readAt?"bg-white/20":"bg-accent"}`}/><h2 className="font-semibold text-ink">{item.title}</h2></div><p className="mt-2 text-sm leading-6 text-ink-dim">{item.message}</p><p className="mt-2 text-xs text-ink-mute">{new Date(item.createdAt).toLocaleString()}</p></div>{!item.readAt&&<button className="btn btn-outline btn-sm shrink-0" disabled={saving} onClick={()=>mark(item.id)}><FaCheck/> Mark read</button>}</article>)}</div>}
  </div></main>;
}
