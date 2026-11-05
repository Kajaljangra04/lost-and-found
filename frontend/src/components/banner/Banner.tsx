import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaExternalLinkAlt, FaBrain, FaSearch, FaShieldAlt, FaMagic } from "react-icons/fa";

const Banner = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/ai-search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section className="relative isolate overflow-hidden px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:pb-28 lg:pt-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-18rem] h-[46rem] w-[68rem] -translate-x-1/2 rounded-full bg-accent/[0.11] blur-[120px]"/>
        <div className="absolute right-[-12rem] top-24 h-80 w-80 rounded-full bg-indigo-500/[0.09] blur-[100px]"/>
        <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"/>
      </div>
      <div className="mx-auto max-w-6xl text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/[0.08] px-4 py-2 text-xs font-semibold tracking-wide text-accent-soft">
          <FaMagic className="text-accent"/> AI-powered item recovery
          <span className="h-1 w-1 rounded-full bg-emerald-400"/>
          Built for real-world reunions
        </div>
        <h1 className="mx-auto max-w-5xl text-5xl font-extrabold leading-[1.02] tracking-[-0.055em] text-ink sm:text-6xl lg:text-7xl">
          Every lost belonging
          <span className="block text-gradient">has a story.</span>
          <span className="block">Let's bring it home.</span>
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-ink-dim sm:text-lg sm:leading-8">
          Findora connects lost and found reports with intelligent matching, private ownership checks and a safer path to handover.
        </p>
        <form onSubmit={submit} className="mx-auto mt-10 flex max-w-3xl flex-col gap-2 rounded-2xl border border-line-strong bg-surface/90 p-2 shadow-[0_24px_90px_rgba(0,0,0,.25)] backdrop-blur-xl sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
            <FaSearch className="shrink-0 text-accent"/>
            <input value={query} onChange={(event)=>setQuery(event.target.value)} className="w-full border-0 bg-transparent py-3 text-sm text-ink outline-none placeholder:text-ink-mute focus:ring-0" placeholder="Describe what you lost or found…" aria-label="Search lost and found items"/>
          </div>
          <button className="btn btn-brand btn-lg shrink-0" type="submit">Search with AI <FaArrowRight/></button>
        </form>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ink-mute">
          <span>Try: “Black wallet near the library”</span><span className="hidden sm:inline">·</span><span>“Blue backpack found yesterday”</span>
        </div>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/reportLostItem" className="btn btn-outline btn-lg group">Report a lost item <FaExternalLinkAlt className="transition-transform group-hover:translate-x-0.5"/></Link>
          <Link to="/reportFoundItem" className="btn btn-ghost btn-lg">I found something <FaArrowRight/></Link>
        </div>
        <div className="mx-auto mt-16 grid max-w-4xl gap-3 text-left sm:grid-cols-3">
          {[
            {icon:<FaBrain/>,title:"Intelligent matching",text:"Ranks reports by the details that matter."},
            {icon:<FaShieldAlt/>,title:"Private verification",text:"Ownership answers stay protected."},
            {icon:<FaArrowRight/>,title:"Safer handover",text:"Confirm receipt only after verification."},
          ].map((item)=><div key={item.title} className="rounded-2xl border border-line bg-surface/55 p-4 backdrop-blur"><div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-accent">{item.icon}</div><h3 className="text-sm font-bold text-ink">{item.title}</h3><p className="mt-1 text-xs leading-5 text-ink-dim">{item.text}</p></div>)}
        </div>
      </div>
    </section>
  );
};

export default Banner;
