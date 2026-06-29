type Props = {
    file: File | null;
    loading: boolean;
    dragging: boolean;
    error: string | null;
    setFile: (file: File | null) => void;
    setDragging: (value: boolean) => void;
    onUpload: () => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
};

export default function ResumeUploader({ file, setFile, dragging, setDragging, loading, onDrop, onUpload, error }: Props) {
    return (
        <div className="max-w-3xl mx-auto rounded-2xl border border-cyan-500/10 bg-slate-950/95 p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,.08)]">
            <div onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`rounded-2xl border-2 border-dashed p-10 text-center transition-all ${dragging ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,.15)]" : "border-slate-700 bg-white/2"}`}
            >
                <input id="resume-upload" type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />

                <label htmlFor="resume-upload" className="cursor-pointer">
                    {file ? (
                        <div>
                            <p className="font-medium text-cyan-400">✓ {file.name}</p>
                            <p className="text-sm text-slate-500">Click or drop another PDF</p>
                        </div>
                    ) : (
                        <div>
                            <p className="font-medium text-slate-200">Drag & Drop Resume Here</p>
                            <p className="text-sm text-slate-500">or click to browse</p>
                        </div>
                    )}
                </label>
            </div>
            <button onClick={onUpload} disabled={!file || loading} hidden={loading} className="mt-4 w-full rounded-xl bg-cyan-500 py-3 font-medium text-black shadow-[0_0_20px_rgba(34,211,238,.25)] transition hover:bg-cyan-400 disabled:opacity-50">
                {loading ? "Analyzing..." : "Analyze Resume"}
            </button>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>
    );
}