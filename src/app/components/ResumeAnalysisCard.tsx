import { ResumeProfile } from "@/types/resume";

type Props = {
    profile: ResumeProfile;
    onStart: () => void;
};

export default function ResumeAnalysisCard({ profile, onStart }: Props) {
    const projectCount = profile.projects.length;
    const skillCount = profile.skills.length;
    const techCount = profile.technologies.length;
    const scoreColor = profile.score >= 80 ? "text-green-600" : profile.score >= 60 ? "text-yellow-600" : "text-red-600";

    return (
        <div className="bg-white border rounded-xl p-6 shadow-sm max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-slate-900">
                    Resume Analysis
                </h2>
                <button onClick={onStart} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                    Start Interview &rarr;
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-500">Resume Score</p>
                    <p className={`text-3xl font-bold ${scoreColor}`}>{profile.score}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-500">Skills</p>
                    <p className="text-3xl font-bold text-slate-900">{skillCount}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-500">Technologies</p>
                    <p className="text-3xl font-bold text-slate-900">{techCount}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-500">Projects</p>
                    <p className="text-3xl font-bold text-slate-900">{projectCount}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h3 className="font-semibold text-slate-900">Candidate</h3>
                    <p className="text-slate-800">{profile.candidateName ?? "Candidate"}</p>
                    <p className="text-sm text-slate-500 capitalize">Experience Level: {profile.experienceLevel}</p>
                </div>

                <div>
                    <h3 className="font-semibold mb-2 text-slate-900">Summary</h3>
                    <p className="text-slate-700">{profile.summary}</p>
                </div>
            </div>
            <div className="mb-6">
                <h3 className="font-semibold mb-2 text-slate-900">Skills</h3>

                <div className="flex flex-wrap gap-2">
                    {profile.skills.map(skill => (
                        <span key={skill} className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <h3 className="font-semibold mb-2 text-slate-900">Technologies</h3>

                <div className="flex flex-wrap gap-2">
                    {profile.technologies.slice(0, 15).map(tech => (
                        <span key={tech} className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm">
                            {tech}
                        </span>
                    ))}

                    {profile.technologies.length > 15 && (
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm">
                            +{profile.technologies.length - 15} more
                        </span>
                    )}
                </div>
            </div>
            <div className="mb-6">
                <h3 className="font-semibold mb-3 text-slate-900">Projects</h3>
                <div className="grid md:grid-cols-2 gap-3">
                    {profile.projects.map(project => (
                        <div key={project.name} className="border rounded-lg p-3 bg-slate-50 hover:bg-slate-100 transition">
                            <h4 className="font-semibold text-slate-900">{project.name}</h4>
                            <p className="text-sm text-slate-600 mt-1">{project.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {project.technologies.map(tech => (
                                    <span key={tech} className="px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-700">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {profile.education?.length ? (
                <div className="mb-6">
                    <h3 className="font-semibold mb-2 text-slate-900">Education</h3>
                    <ul className="list-disc ml-5 text-slate-700">
                        {profile.education.map((edu, i) => (
                            <li key={i}>{edu}</li>
                        ))}
                    </ul>
                </div>
            ) : null}

            {(profile.strengths?.length || profile.weaknesses?.length) ? (
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {profile.strengths?.length ? (
                        <div>
                            <h3 className="font-semibold mb-2 text-green-700">Strengths</h3>
                            <ul className="list-disc ml-5 text-slate-700">
                                {profile.strengths.map((strength, i) => (
                                    <li key={i}>{strength}</li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    {profile.weaknesses?.length ? (
                        <div>
                            <h3 className="font-semibold mb-2 text-red-700">Areas To Improve</h3>
                            <ul className="list-disc ml-5 text-slate-700">
                                {profile.weaknesses.map((weakness, i) => (
                                    <li key={i}>{weakness}</li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}