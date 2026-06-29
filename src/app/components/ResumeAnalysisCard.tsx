import { motion, Variants } from "framer-motion";
import CountUp from "react-countup";
import { ResumeProfile } from "@/types/resume";

type Props = {
    profile: ResumeProfile;
    onStart: () => void;
};

const container: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.15
        }
    }
};

const item: Variants = {
    hidden: { opacity: 0, x: -40 },
    show: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.45
        }
    }
};

export default function ResumeAnalysisCard({ profile, onStart }: Props) {
    const projectCount = profile.projects.length;
    const skillCount = profile.skills.length;
    const techCount = profile.technologies.length;
    const scoreColor = profile.score >= 80 ? "text-cyan-400" : profile.score >= 60 ? "text-yellow-400" : "text-red-400";

    return (
        <motion.div layout initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-6xl mx-auto rounded-2xl border border-cyan-500/10 bg-slate-950/95 p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,.08)]">

            <motion.div className="flex items-center justify-between mb-6" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div>
                    <h2 className="text-3xl font-bold bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Resume Analysis</h2>
                    <p className="text-sm text-slate-500 mt-1">AI generated candidate profile</p>
                </div>

                <motion.button onClick={onStart} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-medium shadow-[0_0_20px_rgba(34,211,238,.25)] hover:bg-cyan-400">Start Interview →</motion.button>
            </motion.div>

            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" variants={container} initial="hidden" animate="show">

                <motion.div variants={item} animate={{ boxShadow: ["0 0 0px rgba(34,211,238,0)", "0 0 25px rgba(34,211,238,.25)", "0 0 0px rgba(34,211,238,0)"] }} transition={{ boxShadow: { duration: 3, repeat: Infinity } }} className="rounded-xl border border-cyan-500/20 bg-white/3 p-4">
                    <p className="text-sm text-slate-500">Resume Score</p>
                    <p className={`text-3xl font-bold ${scoreColor}`} style={{ textShadow: profile.score >= 80 ? "0 0 15px rgba(34,211,238,.5)" : undefined }}><CountUp end={profile.score} duration={1.5} /></p>
                </motion.div>

                <motion.div variants={item} className="rounded-xl border border-white/10 bg-white/3 p-4"><p className="text-sm text-slate-500">Skills</p><p className="text-3xl font-bold text-slate-100">{skillCount}</p></motion.div>

                <motion.div variants={item} className="rounded-xl border border-white/10 bg-white/3 p-4"><p className="text-sm text-slate-500">Technologies</p><p className="text-3xl font-bold text-slate-100">{techCount}</p></motion.div>

                <motion.div variants={item} className="rounded-xl border border-white/10 bg-white/3 p-4"><p className="text-sm text-slate-500">Projects</p><p className="text-3xl font-bold text-slate-100">{projectCount}</p></motion.div>

            </motion.div>

            <motion.div className="grid md:grid-cols-2 gap-6 mb-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={container}>

                <motion.div variants={item} className="rounded-xl border border-cyan-500/15 bg-cyan-500/3 p-5">
                    <h3 className="font-semibold text-cyan-400">Candidate</h3>
                    <p className="text-slate-100">{profile.candidateName ?? "Candidate"}</p>
                    <p className="text-sm text-slate-500 capitalize">Experience Level: {profile.experienceLevel}</p>
                </motion.div>

                <motion.div variants={item} className="rounded-xl border border-white/10 bg-white/3 p-5">
                    <h3 className="font-semibold mb-2 text-slate-100">Summary</h3>
                    <p className="text-slate-400">{profile.summary}</p>
                </motion.div>

            </motion.div>

            <div className="mb-6">
                <h3 className="font-semibold mb-2 text-slate-100">Skills</h3>

                <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, i) => (
                        <motion.span key={skill} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.025 }} whileHover={{ y: -2, scale: 1.05 }} className="px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 text-sm">
                            {skill}
                        </motion.span>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <h3 className="font-semibold mb-2 text-slate-100">Technologies</h3>

                <div className="flex flex-wrap gap-2">
                    {profile.technologies.slice(0, 15).map((tech, i) => (
                        <motion.span key={tech} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.02 }} whileHover={{ y: -2, scale: 1.05 }} className="px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 text-sm">
                            {tech}
                        </motion.span>
                    ))}

                    {profile.technologies.length > 15 && <span className="px-3 py-1 rounded-full border border-white/10 bg-white/3 text-slate-400 text-sm">+{profile.technologies.length - 15} more</span>}
                </div>
            </div>            <div className="mb-6">
                <h3 className="font-semibold mb-3 text-slate-100">Projects</h3>

                <div className="grid md:grid-cols-2 gap-3">
                    {profile.projects.map((project, i) => (
                        <motion.div
                            layout
                            key={project.name}
                            initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.45, delay: i * 0.06 }}
                            whileHover={{ y: -6, scale: 1.01 }}
                            className="rounded-xl border border-white/10 bg-white/3 p-4 transition-all hover:border-cyan-500/30 hover:bg-white/5"
                        >
                            <h4 className="font-semibold text-slate-100">{project.name}</h4>

                            <p className="mt-1 text-sm text-slate-400">
                                {project.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-3">
                                {project.technologies.map(tech => (
                                    <span key={tech} className="px-2 py-1 text-xs rounded border border-purple-500/20 bg-purple-500/10 text-purple-300">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
            {profile.education?.length ? (
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }} className="mb-6">
                    <h3 className="font-semibold mb-2 text-slate-100">Education</h3>
                    <div className="rounded-xl border border-white/10 bg-white/3 p-4">
                        <ul className="list-disc ml-5 text-slate-400">
                            {profile.education.map((edu, i) => (
                                <li key={i}>{edu}</li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            ) : null}
            {(profile.strengths?.length || profile.weaknesses?.length) ? (
                <motion.div className="grid md:grid-cols-2 gap-6 mb-6" initial="hidden" whileInView="show" viewport={{ once: true }} variants={container}>

                    {profile.strengths?.length ? (
                        <motion.div variants={item} className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">
                            <h3 className="font-semibold mb-3 text-green-400">Strengths</h3>

                            <ul className="list-disc ml-5 text-slate-400">
                                {profile.strengths.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </motion.div>
                    ) : null}
                    {profile.weaknesses?.length ? (
                        <motion.div variants={item} className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                            <h3 className="font-semibold mb-3 text-red-400">Areas To Improve</h3>
                            <ul className="list-disc ml-5 text-slate-400">
                                {profile.weaknesses.map((w, i) => (
                                    <li key={i}>{w}</li>
                                ))}
                            </ul>
                        </motion.div>
                    ) : null}
                </motion.div>
            ) : null}
        </motion.div>
    );
}