import React, { useEffect, useState } from "react";
import { AlertCircle, Download, FileText, Lock, RefreshCw, ShieldCheck, Trash2, UploadCloud } from "lucide-react";
import { supabase } from "../lib/supabase";

type StoredFile = {
  name: string;
  id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: { size?: number; mimetype?: string } | null;
};

const BUCKET = "student-documents";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const formatBytes = (bytes?: number) => {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const safeName = (name: string) => name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-120) || "document";

export function SecureDocumentVault() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData.user;
    if (authError || !user) {
      setUserId(null);
      setFiles([]);
      setError("Your authenticated student session could not be verified.");
      setLoading(false);
      return;
    }
    setUserId(user.id);

    const result = await supabase.storage.from(BUCKET).list(user.id, {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (result.error) {
      setFiles([]);
      setError("Private document storage is not available yet. JEL staff must finish the Supabase storage migration before uploads can be accepted.");
    } else {
      setFiles((result.data || []).filter((item) => item.name !== ".emptyFolderPlaceholder") as StoredFile[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadFiles();
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    setNotice(null);

    if (!userId) {
      setError("Sign in again before uploading a document.");
      return;
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Allowed formats: PDF, JPG, PNG and DOCX.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Maximum document size is 10 MB.");
      return;
    }

    setUploading(true);
    const path = `${userId}/${crypto.randomUUID()}-${safeName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

    if (uploadError) {
      setError("Upload failed. The private bucket or its access policy may not be ready yet.");
    } else {
      setNotice("Document uploaded to your private student folder.");
      await loadFiles();
    }
    setUploading(false);
  };

  const openSigned = async (file: StoredFile) => {
    if (!userId) return;
    setError(null);
    const { data, error: signedError } = await supabase.storage.from(BUCKET).createSignedUrl(`${userId}/${file.name}`, 900);
    if (signedError || !data?.signedUrl) {
      setError("A temporary download link could not be created.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const removeFile = async (file: StoredFile) => {
    if (!userId) return;
    setError(null);
    const { error: removeError } = await supabase.storage.from(BUCKET).remove([`${userId}/${file.name}`]);
    if (removeError) {
      setError("Document deletion failed.");
      return;
    }
    setNotice("Document deleted.");
    await loadFiles();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-[#0B5D3B]"><Lock className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-[0.16em]">Private Supabase Storage</span></div>
          <h3 className="text-xl font-black text-slate-900 mt-2">Student Documents</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">Files are accepted only after authentication and are stored in your user-specific private folder. Download links expire after 15 minutes.</p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-600"><ShieldCheck className="h-4 w-4 text-[#0B5D3B] inline mr-2" />PDF/JPG/PNG/DOCX · max 10 MB</div>
      </div>

      {error && <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs font-semibold text-amber-900 flex gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      {notice && <div className="mt-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-xs font-semibold text-green-700">{notice}</div>}

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <label className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-black text-white bg-[#0B5D3B] cursor-pointer ${uploading || !userId ? "opacity-60 pointer-events-none" : "hover:bg-[#08472e]"}`}>
          {uploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          {uploading ? "Uploading…" : "Upload document"}
          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx,application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleUpload} disabled={uploading || !userId} />
        </label>
        <button type="button" onClick={() => void loadFiles()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-slate-600 hover:bg-slate-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</button>
      </div>

      <div className="mt-6 space-y-3">
        {!loading && !files.length && !error && <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">No private documents uploaded yet.</div>}
        {files.map((file) => (
          <div key={file.id || file.name} className="rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0"><div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0"><FileText className="h-5 w-5 text-[#0B5D3B]" /></div><div className="min-w-0"><div className="font-bold text-sm text-slate-900 truncate">{file.name.replace(/^[0-9a-f-]{36}-/, "")}</div><div className="text-[11px] text-slate-400 mt-1">{formatBytes(file.metadata?.size)} · {file.created_at ? new Date(file.created_at).toLocaleString() : "Private file"}</div></div></div>
            <div className="flex gap-2"><button type="button" onClick={() => void openSigned(file)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /> Open</button><button type="button" onClick={() => void removeFile(file)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-600 flex items-center gap-1.5"><Trash2 className="h-3.5 w-3.5" /> Delete</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}
