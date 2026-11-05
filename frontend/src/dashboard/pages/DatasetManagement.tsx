import { useState, type FormEvent } from "react";
import { useBulkImportCsvMutation } from "../../redux/api/api";
import { FaCloudUploadAlt, FaFileCsv, FaInfoCircle } from "react-icons/fa";
import { toast } from "react-toastify";

const template = "type,userEmail,categoryName,itemName,description,location,date,imageUrl,contactName,contactPhone,claimProcess\nLOST,user@example.com,Electronics,Black headphones,Over-ear headphones with a silver mark,Central library,2026-11-01,https://example.com/item.webp,Alex,+919876543210,\nFOUND,user@example.com,Accessories,Blue backpack,Blue backpack with a red tag,Main gate,2026-11-02,,Sam,+919876543211,Stored at security desk";

export default function DatasetManagement() {
  const [file, setFile] = useState<File | null>(null);
  const [bulkImport, { isLoading }] = useBulkImportCsvMutation();
  const [result, setResult] = useState<any>(null);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) return toast.error("Choose a CSV file first.");
    try {
      const response = await bulkImport(file).unwrap();
      setResult(response?.data);
      toast.success("CSV import finished.");
    } catch (error: any) {
      toast.error(error?.data?.message || "CSV import failed.");
    }
  };
  return <div className="space-y-6">
    <header><span className="eyebrow"><FaFileCsv/> Dataset tools</span><h1 className="mt-2 text-2xl font-extrabold text-ink">Bulk import reports</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-ink-dim">Import existing lost and found records from CSV. Each row is validated, linked to an existing user and category, saved to the current database, and sent through matching.</p></header>
    <section className="card p-6">
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/[0.05] p-4"><FaInfoCircle className="mt-0.5 shrink-0 text-accent"/><div className="text-sm leading-6 text-ink-dim"><strong className="text-ink">Required columns:</strong> type, userEmail, categoryName, itemName, description, location, date. Optional: imageUrl (HTTPS), contactName, contactPhone, claimProcess. Maximum 100 records and 5 MB per file. CSV only; XLSX parsing is not installed.</div></div>
      <a className="link-accent text-sm" href={`data:text/csv;charset=utf-8,${encodeURIComponent(template)}`} download="findora-import-template.csv">Download CSV template</a>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <label className="flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-line-strong bg-surface-2 px-5 py-8 text-center transition hover:border-accent/50"><FaCloudUploadAlt className="mb-3 text-3xl text-accent"/><span className="text-sm font-semibold text-ink">{file?.name || "Choose CSV file"}</span><span className="mt-1 text-xs text-ink-mute">CSV · max 5 MB · up to 100 records</span><input className="sr-only" type="file" accept=".csv,text/csv" onChange={(event)=>{setFile(event.target.files?.[0]||null);setResult(null);}}/></label>
        <button type="submit" className="btn btn-brand" disabled={isLoading||!file}>{isLoading?"Importing and matching…":"Import records"}</button>
      </form>
    </section>
    {result && <section className="card p-6"><h2 className="text-lg font-bold text-ink">Import summary</h2><div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-surface-2 p-4"><p className="text-xs text-ink-mute">Lost reports</p><p className="mt-1 text-2xl font-bold text-ink">{result.importedLost}</p></div><div className="rounded-xl bg-surface-2 p-4"><p className="text-xs text-ink-mute">Found reports</p><p className="mt-1 text-2xl font-bold text-ink">{result.importedFound}</p></div><div className="rounded-xl bg-surface-2 p-4"><p className="text-xs text-ink-mute">Failed rows</p><p className="mt-1 text-2xl font-bold text-ink">{result.failedRows}</p></div></div>{result.errors?.length>0&&<div className="mt-5 space-y-2"><h3 className="font-semibold text-ink">Rows needing attention</h3>{result.errors.map((error:any)=><p key={error.row} className="text-sm text-rose-300">Row {error.row}: {error.message}</p>)}</div>}</section>}
  </div>;
}
