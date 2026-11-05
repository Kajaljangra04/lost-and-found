import Banner from "../../components/banner/Banner";
import Services from "../services/Services";
import RecentLostItem from "../../components/recentItem/RecentLostItem";
import Reviews from "../reviews/Reviews";
import AboutUs from "../../components/aboutUs/aboutUs";
import RecentFoundItem from "../../components/recentItem/RecentFoundItem";
import Faq from "../../components/faq/Faq";
import SuccessStats from "../../components/successStats/SuccessStats";
import RecoveredItems from "../../components/recoveredItems/RecoveredItems";
import { FaCheckCircle, FaFingerprint, FaSearch, FaShieldAlt } from "react-icons/fa";

const Home = () => {
  return (
    <>
      <Banner />

      <section className="px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="eyebrow">The recovery journey</span>
            <h2 className="section-title mt-3">From missing to back where it belongs.</h2>
            <p className="section-sub mt-4">A clear, accountable process that connects the right reports without skipping the human verification that matters.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              {icon:<FaSearch/>,step:"01",title:"Report",text:"Share the item details, image, date and location."},
              {icon:<FaFingerprint/>,step:"02",title:"Discover",text:"Findora ranks similar reports from the live database."},
              {icon:<FaShieldAlt/>,step:"03",title:"Verify",text:"Private ownership questions help validate the right claimant."},
              {icon:<FaCheckCircle/>,step:"04",title:"Return",text:"Confirm the in-person handover with a one-time code."},
            ].map((item,index)=><div key={item.step} className="card relative p-6">
              <div className="mb-5 flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-accent">{item.icon}</span><span className="text-xs font-bold tracking-[.2em] text-ink-mute">{item.step}</span></div>
              <h3 className="text-lg font-bold text-ink">{item.title}</h3><p className="mt-2 text-sm leading-6 text-ink-dim">{item.text}</p>
              {index<3&&<div className="absolute -right-2 top-1/2 z-10 hidden h-4 w-4 rotate-45 border-r border-t border-line-strong bg-canvas md:block"/>}
            </div>)}
          </div>
        </div>
      </section>

      <Services />
      <SuccessStats />

      <section className="px-4 pb-14 sm:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/[0.10] via-surface to-indigo-500/[0.08] p-7 sm:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div><span className="eyebrow"><FaShieldAlt/> Built around trust</span><h2 className="mt-3 text-2xl font-extrabold text-ink sm:text-3xl">A match is a lead. Verification is the proof.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-ink-dim">Similarity scores never release private contact details or mark an item as returned. Findora keeps ownership answers protected, rate-limits verification attempts and records receipt only after the handover code is confirmed.</p></div>
            <div className="grid h-24 w-24 place-items-center rounded-3xl border border-accent/25 bg-accent/10 text-4xl text-accent"><FaFingerprint/></div>
          </div>
        </div>
      </section>

      <RecentLostItem />
      <RecentFoundItem />
      <RecoveredItems />
      <Reviews />
      <AboutUs />
      <Faq />
    </>
  );
};

export default Home;
