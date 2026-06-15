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
        <div className="bg-white border rounded-xl p-10 shadow-sm max-w-3xl mx-auto">
            <div onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-xl p-10 text-center transition ${dragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-300 bg-white"
                    }`}
            >
                <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                />

                <label htmlFor="resume-upload" className="cursor-pointer">
                    {file ? (
                        <div>
                            <p className="font-medium text-green-600">&#10003; {file.name}</p>
                            <p className="text-sm text-slate-500">Click or drop different PDF</p>
                        </div>
                    ) : (
                        <div>
                            <p className="font-medium text-slate-600">Drag & Drop Resume Here</p>
                            <p className="text-sm text-slate-500">or click to browse</p>
                        </div>
                    )}
                </label>
            </div>
            <button onClick={onUpload} disabled={!file || loading} hidden={loading} className="mt-4 w-full bg-black text-white py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50">
                {loading ? "Analyzing..." : "Analyze Resume"}
            </button>

            {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
        </div>
    )
} 