import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateFoundItemMutation } from "../../redux/api/api";
import { useCategoryQuery } from "../../redux/api/api";
import type { ItemCategory } from "../../types/types";
import { FaArrowLeft, FaCloudUploadAlt, FaHandHoldingHeart, FaRobot, FaShieldAlt, FaCamera } from "react-icons/fa";
import toastNotify from "../../components/modal/toastNotify";

export default function ReportFoundItem() {
  const navigate = useNavigate();
  const { data: categoriesResponse, isLoading: categoriesLoading } = useCategoryQuery({});
  const [createFoundItem, { isLoading }] = useCreateFoundItemMutation();
  const categories = categoriesResponse?.data || [];
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [savedMatches, setSavedMatches] = useState<number | null>(null);

  useEffect(() => {
    if (!image) { setPreview(""); return; }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!image || !categoryId) {
      toastNotify({ message: "Add an image and select a category to continue.", status: false });
      return;
    }
    if (image.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
      toastNotify({ message: "Choose a JPEG, PNG or WebP image up to 5 MB.", status: false });
      return;
    }
    const payload = new FormData();
    payload.append("image", image);
    payload.append("categoryId", categoryId);
    ["foundItemName", "description", "location", "date", "claimProcess", "contactName", "contactPhone"].forEach((key) => {
      payload.append(key, String(form.get(key) || ""));
    });
    try {
      const response = await createFoundItem(payload).unwrap();
      const count = Number(response?.data?.matching?.candidatesFound || 0);
      setSavedMatches(count);
      toastNotify({ message: "Found item saved and potential matches ranked.", status: true });
      setTimeout(() => navigate("/dashboard/myFoundItems"), 1200);
    } catch (error: any) {
      toastNotify({ message: error?.data?.message || error?.message || "Your report could not be saved.", status: false });
    }
  };

  return (
    <main className="page px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="card overflow-hidden">
          <div className="border-b border-line bg-gradient-to-r from-emerald-500/[0.10] to-accent/[0.08] px-6 py-7 sm:px-9">
            <button type="button" onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm text-ink-dim hover:text-ink"><FaArrowLeft /> Back</button>
            <span className="eyebrow"><FaHandHoldingHeart /> Found item report</span>
            <h1 className="mt-3 text-3xl font-extrabold text-ink sm:text-4xl">You could make someone's day.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-ink-dim sm:text-base">Tell us what you found. We'll compare it with active lost-item reports and help the right person verify it.</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-6 p-6 sm:p-9">
            <div className="grid gap-5 sm:grid-cols-2">
              <div><label className="field-label" htmlFor="foundItemName">What did you find?</label><input className="field" id="foundItemName" name="foundItemName" placeholder="e.g. Blue backpack" required maxLength={120}/></div>
              <div><label className="field-label" htmlFor="category">Category</label><select className="field" id="category" value={categoryId} onChange={(e)=>setCategoryId(e.target.value)} required disabled={categoriesLoading}><option value="">{categoriesLoading ? "Loading categories…" : "Choose a category"}</option>{categories.map((category: ItemCategory)=><option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
              <div className="sm:col-span-2"><label className="field-label" htmlFor="description">Describe the item</label><textarea className="field min-h-28 resize-y" id="description" name="description" placeholder="Color, brand, condition, distinctive details…" required maxLength={3000}/></div>
              <div><label className="field-label" htmlFor="location">Where did you find it?</label><input className="field" id="location" name="location" placeholder="Building, area, city…" required maxLength={300}/></div>
              <div><label className="field-label" htmlFor="date">Date found</label><input className="field" id="date" name="date" type="date" max={new Date().toISOString().slice(0,10)} defaultValue={new Date().toISOString().slice(0,10)} required/></div>
              <div><label className="field-label" htmlFor="contactName">Finder name</label><input className="field" id="contactName" name="contactName" placeholder="Your name" required maxLength={100}/></div>
              <div><label className="field-label" htmlFor="contactPhone">Finder phone</label><input className="field" id="contactPhone" name="contactPhone" type="tel" placeholder="+91 98XXXXXX10" required pattern="[+0-9 ()-]{7,20}"/></div>
              <div className="sm:col-span-2"><label className="field-label" htmlFor="claimProcess">Safe collection instructions</label><textarea className="field min-h-20 resize-y" id="claimProcess" name="claimProcess" placeholder="e.g. Item is secured with campus security at the main reception." required maxLength={1000}/></div>
            </div>
            <div>
  <label className="field-label">Item photograph</label>

  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface-2/70 px-5 py-6 text-center transition hover:border-accent/60 hover:bg-accent/[0.04]">
      <FaCloudUploadAlt className="mb-3 text-3xl text-accent" />
      <span className="text-sm font-semibold text-ink">Choose from gallery</span>
      <span className="mt-1 text-xs text-ink-mute">Select an existing photo</span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />
    </label>

    <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface-2/70 px-5 py-6 text-center transition hover:border-accent/60 hover:bg-accent/[0.04]">
      <FaCamera className="mb-3 text-3xl text-accent" />
      <span className="text-sm font-semibold text-ink">Take a photo</span>
      <span className="mt-1 text-xs text-ink-mute">Open your device camera</span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="sr-only"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />
    </label>
  </div>

  {preview && (
    <div className="mt-4 rounded-2xl border border-line-strong bg-surface-2/70 p-4">
      <img
        src={preview}
        alt="Selected item preview"
        className="mx-auto max-h-56 max-w-full rounded-xl object-contain"
      />
      <p className="mt-2 text-center text-sm font-medium text-ink">
        {image?.name}
      </p>
      <button
        type="button"
        onClick={() => setImage(null)}
        className="mt-2 w-full text-sm font-semibold text-red-500 hover:text-red-600"
      >
        Remove photo
      </button>
    </div>
  )}

  <p className="mt-2 text-xs text-ink-mute">
    JPEG, PNG or WebP · Maximum 5 MB
  </p>
</div>
            {isLoading && <div className="rounded-xl border border-line bg-surface-2 p-4"><div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink"><FaRobot className="text-accent"/> Findora is processing your report</div><div className="flex flex-wrap gap-2 text-xs text-ink-dim"><span className="badge badge-ok">Image validated</span><span className="badge badge-accent">Uploading and saving</span><span className="badge badge-neutral">Ranking potential matches</span></div></div>}
            {savedMatches !== null && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4 text-sm text-emerald-300"><FaRobot className="mr-2 inline"/> Report saved. {savedMatches} potential lost-item candidate{savedMatches===1?"":"s"} ranked. Ownership still requires verification.</div>}
            <button className="btn btn-brand btn-lg w-full" type="submit" disabled={isLoading}>{isLoading ? "Uploading & matching…" : "Submit found-item report"}</button>
            <p className="text-center text-xs text-ink-mute">Your contact information is kept out of public item listings.</p>
          </form>
        </section>
        <aside className="space-y-4 lg:pt-2">
          <div className="card p-6"><span className="eyebrow">Help it get home</span><h2 className="mt-3 text-xl font-bold text-ink">A few details make a big difference.</h2><p className="mt-3 text-sm leading-6 text-ink-dim">A clear photo, accurate location and useful description help our matching engine identify the most relevant lost reports.</p></div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-5"><div className="flex items-center gap-2 text-emerald-300"><FaShieldAlt/><span className="text-sm font-semibold">Safe handover</span></div><p className="mt-2 text-sm leading-6 text-ink-dim">Do not publish private details or hand over an item based only on an AI score. Use the platform's ownership verification and receipt confirmation flow.</p></div>
        </aside>
      </div>
    </main>
  );
}
