import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCategoryQuery, useCreateLostItemMutation } from "../../redux/api/api";
import type { ItemCategory } from "../../types/types";
import { FaArrowLeft, FaCheck, FaCloudUploadAlt, FaLock, FaRobot, FaShieldAlt } from "react-icons/fa";
import toastNotify from "../../components/modal/toastNotify";

const steps = [
  "Validate report details",
  "Upload and store item image",
  "Save your report securely",
  "Compare against found-item records",
];

export default function ReportLostItem() {
  const navigate = useNavigate();
  const { data: categoriesResponse, isLoading: categoriesLoading } = useCategoryQuery({});
  const [createLostItem, { isLoading }] = useCreateLostItemMutation();
  const categories = categoriesResponse?.data || [];
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [stage, setStage] = useState(-1);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  useEffect(() => {
    if (!image) { setPreview(""); return; }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = image;
    if (!file || !categoryId) {
      toastNotify({ message: "Add an image and select a category to continue.", status: false });
      return;
    }
    if (file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toastNotify({ message: "Choose a JPEG, PNG or WebP image up to 5 MB.", status: false });
      return;
    }
    const questions = [form.get("question1"), form.get("question2"), form.get("question3")].map(String);
    const answers = [form.get("answer1"), form.get("answer2"), form.get("answer3")].map(String);
    if (questions.some((v) => !v.trim()) || answers.some((v) => !v.trim())) {
      toastNotify({ message: "Complete all three private ownership questions and answers.", status: false });
      return;
    }

    setStage(0);
    const payload = new FormData();
    payload.append("image", file);
    ["lostItemName", "description", "location", "date", "contactName", "contactPhone"].forEach((key) => {
      payload.append(key, String(form.get(key) || ""));
    });
    payload.append("categoryId", categoryId);
    payload.append("ownershipQuestions", JSON.stringify(questions));
    payload.append("ownershipAnswers", JSON.stringify(answers));

    try {
      setStage(1);
      const response = await createLostItem(payload).unwrap();
      setStage(3);
      setSuccessCount(Number(response?.data?.matching?.candidatesFound || 0));
      toastNotify({ message: "Your lost-item report is live. Matching has been completed.", status: true });
      setTimeout(() => navigate("/dashboard/myLostItems"), 1200);
    } catch (error: any) {
      setStage(-1);
      toastNotify({ message: error?.data?.message || error?.message || "Your report could not be saved.", status: false });
    }
  };

  return (
    <main className="page px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="card overflow-hidden">
          <div className="border-b border-line bg-gradient-to-r from-accent/[0.12] to-indigo-500/[0.08] px-6 py-7 sm:px-9">
            <button type="button" onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm text-ink-dim hover:text-ink"><FaArrowLeft /> Back</button>
            <span className="eyebrow"><FaShieldAlt /> Lost item report</span>
            <h1 className="mt-3 text-3xl font-extrabold text-ink sm:text-4xl">Let's bring it home.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-ink-dim sm:text-base">Share what you remember. Findora will compare your report with items people have found.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-7 p-6 sm:p-9">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="lostItemName">What did you lose?</label>
                <input className="field" id="lostItemName" name="lostItemName" placeholder="e.g. Black leather wallet" required maxLength={120} />
              </div>
              <div>
                <label className="field-label" htmlFor="category">Category</label>
                <select className="field" id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required disabled={categoriesLoading}>
                  <option value="">{categoriesLoading ? "Loading categories…" : "Choose a category"}</option>
                  {categories.map((category: ItemCategory) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="description">Describe the item</label>
                <textarea className="field min-h-28 resize-y" id="description" name="description" placeholder="Color, brand, distinctive marks, stickers, contents or anything else you remember…" required maxLength={3000} />
              </div>
              <div>
                <label className="field-label" htmlFor="location">Where was it last seen?</label>
                <input className="field" id="location" name="location" placeholder="Building, area, city…" required maxLength={300} />
              </div>
              <div>
                <label className="field-label" htmlFor="date">Date lost</label>
                <input className="field" id="date" name="date" type="date" max={new Date().toISOString().slice(0,10)} required defaultValue={new Date().toISOString().slice(0,10)} />
              </div>
              <div>
                <label className="field-label" htmlFor="contactName">Contact name</label>
                <input className="field" id="contactName" name="contactName" placeholder="Your name" required maxLength={100} />
              </div>
              <div>
                <label className="field-label" htmlFor="contactPhone">Contact phone</label>
                <input className="field" id="contactPhone" name="contactPhone" type="tel" placeholder="+91 98XXXXXX10" required pattern="[+0-9 ()-]{7,20}" />
              </div>
            </div>

            <div>
              <label className="field-label">Item photograph</label>
              <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface-2/70 px-5 py-7 text-center transition hover:border-accent/60 hover:bg-accent/[0.04]">
                {preview ? <img src={preview} alt="Selected item preview" className="mb-4 max-h-56 max-w-full rounded-xl object-contain" /> : <FaCloudUploadAlt className="mb-3 text-3xl text-accent" />}
                <span className="text-sm font-semibold text-ink">{image ? image.name : "Choose an item photo"}</span>
                <span className="mt-1 text-xs text-ink-mute">JPEG, PNG or WebP · up to 5 MB</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => setImage(e.target.files?.[0] || null)} />
              </label>
            </div>

            <div className="rounded-2xl border border-accent/20 bg-accent/[0.05] p-5 sm:p-6">
              <div className="mb-2 flex items-center gap-2 text-ink"><FaLock className="text-accent" /><h2 className="font-bold">Private ownership check</h2></div>
              <p className="mb-5 text-sm leading-6 text-ink-dim">Create three questions only someone who genuinely owns the item can answer. Answers are hashed before storage and are never included in public item listings.</p>
              <div className="space-y-4">
                {[1,2,3].map((n) => <div key={n} className="grid gap-3 sm:grid-cols-2">
                  <div><label className="field-label" htmlFor={`question${n}`}>Question {n}</label><input className="field" id={`question${n}`} name={`question${n}`} placeholder={["What is engraved inside?","What is attached to it?","What is the hidden mark?"][n-1]} required /></div>
                  <div><label className="field-label" htmlFor={`answer${n}`}>Private answer {n}</label><input className="field" id={`answer${n}`} name={`answer${n}`} type="password" autoComplete="off" placeholder="Only you should know" required /></div>
                </div>)}
              </div>
            </div>

            {stage >= 0 && (
              <div className="rounded-xl border border-line bg-surface-2 p-4">
                <div className="mb-3 flex items-center gap-2"><FaRobot className="text-accent" /><span className="text-sm font-semibold text-ink">Findora recovery scan</span></div>
                {steps.map((label, index) => <div key={label} className="flex items-center gap-3 py-1.5 text-sm">
                  <span className={`grid h-5 w-5 place-items-center rounded-full ${successCount !== null && index <= 3 ? "bg-emerald-500/15 text-emerald-400" : index === stage ? "bg-accent/15 text-accent" : "bg-white/5 text-ink-mute"}`}>{successCount !== null && index <= 3 ? <FaCheck size={10}/> : index === stage && isLoading ? <span className="h-2 w-2 animate-pulse rounded-full bg-accent"/> : index+1}</span>
                  <span className={successCount !== null && index <= 3 ? "text-ink" : "text-ink-dim"}>{label}</span>
                </div>)}
                {successCount !== null && <p className="mt-2 text-xs text-emerald-400">Report saved. {successCount} potential candidate{successCount === 1 ? "" : "s"} ranked; ownership still requires verification.</p>}
              </div>
            )}

            <button className="btn btn-brand btn-lg w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Uploading & matching…" : "Submit lost-item report"}
            </button>
            <p className="text-center text-xs text-ink-mute">Your private answers and contact details are not shown in public listings.</p>
          </form>
        </section>

        <aside className="space-y-4 lg:pt-2">
          <div className="card p-6">
            <span className="eyebrow">What happens next</span>
            <h2 className="mt-3 text-xl font-bold text-ink">A smarter way back.</h2>
            <ol className="mt-5 space-y-4">
              {["Your report is saved with its image.","Findora ranks similar found-item reports.","A possible match is sent for private verification.","After verification, arrange a secure handover."].map((item, index) => <li key={item} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent/10 text-xs font-bold text-accent">{index+1}</span><span className="pt-1 text-sm leading-5 text-ink-dim">{item}</span></li>)}
            </ol>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-5">
            <div className="flex items-center gap-2 text-emerald-300"><FaShieldAlt /><span className="text-sm font-semibold">Your privacy matters</span></div>
            <p className="mt-2 text-sm leading-6 text-ink-dim">Ownership answers are stored as one-way password hashes. The finder sees the questions only when a potential match is being verified.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
