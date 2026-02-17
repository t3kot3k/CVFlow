"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Mic,
  MicOff,
  Send,
  ChevronDown,
  ChevronRight,
  Star,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Clock,
  X,
  Pencil,
  Volume2,
} from "lucide-react"

/* ──────────── Types ──────────── */
type InterviewType = "behavioral" | "technical" | "case" | "cultural"
type InputMode = "type" | "voice"
type SessionPhase = "setup" | "active" | "ended"

interface ChatMessage {
  id: number
  role: "system" | "ai-question" | "user" | "ai-feedback" | "next-prompt"
  content: string
  questionNumber?: number
  questionType?: string
  scores?: { overall: number; content: number; clarity: number }
  strengths?: string[]
  improvements?: string[]
  modelAnswer?: string
  starTip?: boolean
}

/* ──────────── Mock data ──────────── */
const interviewTypes: { key: InterviewType; label: string; icon: string }[] = [
  { key: "behavioral", label: "Behavioral", icon: "\uD83E\uDDE0" },
  { key: "technical", label: "Technical", icon: "\uD83D\uDCBB" },
  { key: "case", label: "Case study", icon: "\uD83C\uDFAF" },
  { key: "cultural", label: "Cultural fit", icon: "\uD83C\uDF0D" },
]

const sessionLengths = [5, 10, 15]

const previousSessions = [
  { role: "PM Role", date: "Feb 15", score: "7/10" },
  { role: "UX Designer", date: "Feb 12", score: "8/10" },
  { role: "Data Analyst", date: "Feb 8", score: "6/10" },
]

const mockConversation: ChatMessage[] = [
  {
    id: 1,
    role: "system",
    content: "Interview started. Answer in French. Take your time.",
  },
  {
    id: 2,
    role: "ai-question",
    content:
      "Parlez-moi d\u2019une exp\u00e9rience o\u00f9 vous avez d\u00fb collaborer avec une \u00e9quipe pluridisciplinaire pour atteindre un objectif ambitieux.",
    questionNumber: 1,
    questionType: "Behavioral",
    starTip: true,
  },
  {
    id: 3,
    role: "user",
    content:
      "Chez Orange Telecom en 2022, j\u2019ai coordonn\u00e9 une \u00e9quipe de 8 personnes (d\u00e9veloppeurs, designers, marketeurs) pour lancer une application mobile en 3 mois. J\u2019ai mis en place des stand-ups quotidiens et un tableau Kanban partag\u00e9. R\u00e9sultat : livraison \u00e0 temps avec 50 000 t\u00e9l\u00e9chargements le premier mois.",
  },
  {
    id: 4,
    role: "ai-feedback",
    content: "Good answer! Here\u2019s your feedback:",
    scores: { overall: 4, content: 4, clarity: 3 },
    strengths: [
      "Good use of STAR structure",
      "Included specific numbers (8 people, 3 months, 50K downloads)",
    ],
    improvements: [
      "The Result section could be more quantified. Instead of just downloads, mention business impact: revenue, retention rate, or NPS score.",
      "Add a brief mention of a challenge you overcame during collaboration.",
    ],
    modelAnswer:
      "\"Chez Orange Telecom, j\u2019ai pilot\u00e9 une squad de 8 personnes pour livrer une app mobile strat\u00e9gique en 3 mois. Face \u00e0 des d\u00e9lais serr\u00e9s, j\u2019ai instaur\u00e9 des rituels agiles et un Kanban partag\u00e9. Malgr\u00e9 un conflit de priorit\u00e9s entre l\u2019\u00e9quipe marketing et les devs, j\u2019ai facilit\u00e9 un atelier d\u2019alignement. R\u00e9sultat : lancement on time, 50K DL en J+30, NPS de 72, +15% vs objectif.\"",
  },
  {
    id: 5,
    role: "ai-question",
    content:
      "D\u00e9crivez-moi une situation o\u00f9 vous avez d\u00fb g\u00e9rer un projet avec des ressources limit\u00e9es et des d\u00e9lais serr\u00e9s. Comment avez-vous prioris\u00e9 et quel a \u00e9t\u00e9 le r\u00e9sultat ?",
    questionNumber: 2,
    questionType: "Behavioral",
    starTip: true,
  },
  {
    id: 6,
    role: "user",
    content:
      "En 2023, chez Danone, on m\u2019a demand\u00e9 de lancer une campagne nationale avec 40% du budget habituel suite \u00e0 des coupes. J\u2019ai prioris\u00e9 les canaux digitaux \u00e0 fort ROI, n\u00e9goci\u00e9 des partenariats influenceurs en \u00e9change de visibilit\u00e9, et r\u00e9duit le scope cr\u00e9atif \u00e0 3 formats cl\u00e9s. La campagne a atteint 1,8M d\u2019impressions, 23% au-dessus de l\u2019objectif.",
  },
  {
    id: 7,
    role: "ai-feedback",
    content: "Strong answer! Feedback:",
    scores: { overall: 5, content: 5, clarity: 4 },
    strengths: [
      "Excellent quantification (40% cut, 1.8M impressions, +23%)",
      "Clear prioritization logic explained",
      "Creative problem-solving demonstrated",
    ],
    improvements: [
      "Mention what you learned from this experience for future projects.",
    ],
    modelAnswer: undefined,
  },
  {
    id: 8,
    role: "ai-question",
    content:
      "Comment g\u00e9rez-vous les d\u00e9saccords avec un sup\u00e9rieur hi\u00e9rarchique sur la direction strat\u00e9gique d\u2019un projet ?",
    questionNumber: 3,
    questionType: "Behavioral",
    starTip: true,
  },
]

/* ──────────── Radar chart helper ──────────── */
const radarAxes = ["Structure", "Clarity", "Examples", "Keywords", "Confidence"]
const radarScores = [8, 7, 9, 6, 8] // out of 10

function RadarChart() {
  const size = 200
  const cx = size / 2
  const cy = size / 2
  const levels = 5
  const maxR = 80

  const angleSlice = (Math.PI * 2) / radarAxes.length

  const getPoint = (i: number, val: number) => {
    const r = (val / 10) * maxR
    const a = angleSlice * i - Math.PI / 2
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }

  const gridLines = Array.from({ length: levels }, (_, lvl) => {
    const r = ((lvl + 1) / levels) * maxR
    const points = radarAxes
      .map((_, i) => {
        const a = angleSlice * i - Math.PI / 2
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
      })
      .join(" ")
    return points
  })

  const dataPoints = radarScores.map((s, i) => getPoint(i, s))
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ")

  return (
    <svg width={size} height={size} className="mx-auto">
      {gridLines.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="#606c38"
          strokeWidth={0.5}
          opacity={0.2}
        />
      ))}
      {radarAxes.map((_, i) => {
        const end = getPoint(i, 10)
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            stroke="#606c38"
            strokeWidth={0.5}
            opacity={0.2}
          />
        )
      })}
      <polygon
        points={dataPath}
        fill="#dda15e"
        fillOpacity={0.3}
        stroke="#dda15e"
        strokeWidth={2}
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#dda15e" />
      ))}
      {radarAxes.map((label, i) => {
        const pt = getPoint(i, 12)
        return (
          <text
            key={i}
            x={pt.x}
            y={pt.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[#283618] text-[9px] font-medium"
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}

/* ──────────── Star icons ──────────── */
function Stars({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < count
              ? "fill-[#dda15e] text-[#dda15e]"
              : "text-[#606c38]/20"
          }`}
        />
      ))}
    </div>
  )
}

/* ──────────── PAGE ──────────── */
export default function InterviewPage() {
  const [phase, setPhase] = useState<SessionPhase>("setup")
  const [selectedType, setSelectedType] = useState<InterviewType>("behavioral")
  const [difficulty, setDifficulty] = useState(50)
  const [sessionLength, setSessionLength] = useState(10)
  const [inputMode, setInputMode] = useState<InputMode>("type")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [expandedTips, setExpandedTips] = useState<Set<number>>(new Set())
  const [expandedModel, setExpandedModel] = useState<Set<number>>(new Set())
  const [timer, setTimer] = useState(0)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentQuestion = messages.filter((m) => m.role === "ai-question").length
  const totalQuestions = sessionLength

  // Timer
  useEffect(() => {
    if (phase === "active") {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase])

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0)
      recordingRef.current = setInterval(
        () => setRecordingTime((t) => t + 1),
        1000
      )
    } else {
      if (recordingRef.current) clearInterval(recordingRef.current)
    }
    return () => {
      if (recordingRef.current) clearInterval(recordingRef.current)
    }
  }, [isRecording])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  const startSession = () => {
    setPhase("active")
    setTimer(0)
    setMessages(mockConversation)
  }

  const endSession = () => {
    setPhase("ended")
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const submitAnswer = () => {
    if (!userInput.trim()) return
    setUserInput("")
  }

  const toggleTip = (id: number) => {
    setExpandedTips((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleModel = (id: number) => {
    setExpandedModel((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  /* ── SESSION END OVERLAY ── */
  if (phase === "ended") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fefae0] p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="text-5xl mb-4">{"\uD83C\uDF89"}</div>
          <h2 className="text-2xl font-bold text-[#283618]">
            Session complete!
          </h2>
          <p className="mt-1 text-sm text-[#606c38]">
            Great job pushing through all the questions.
          </p>

          <div className="mt-8 rounded-2xl bg-white p-8 shadow-md border border-[#606c38]/10">
            <p className="text-6xl font-bold text-[#283618]">7.2</p>
            <p className="text-sm text-[#606c38]">/10</p>
            <p className="mt-1 text-sm font-medium text-[#dda15e]">
              Good performance -- keep practicing!
            </p>

            <div className="mt-6">
              <RadarChart />
            </div>

            <div className="mt-4 space-y-1 text-xs text-[#606c38]">
              <p>
                {totalQuestions} questions -- {formatTime(timer)} --
                French
              </p>
              <p className="font-semibold text-[#283618]">
                Best answer: Question 2 (9/10)
              </p>
              <p className="text-[#bc6c25]">
                Needs work: Question 3 -- more concrete examples needed
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => {
                setPhase("setup")
                setMessages([])
                setTimer(0)
              }}
              className="rounded-full bg-[#dda15e] px-6 py-3 font-bold text-[#283618] transition-colors hover:bg-[#bc6c25]"
            >
              Practice again
            </button>
            <button
              onClick={() => {
                setPhase("active")
              }}
              className="rounded-full border-2 border-[#283618] px-6 py-3 font-semibold text-[#283618] transition-colors hover:bg-[#283618] hover:text-[#fefae0]"
            >
              View full feedback
            </button>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[#606c38] transition-colors hover:text-[#283618]"
            >
              {"Back to dashboard \u2192"}
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#fefae0]">
      {/* ════════════ LEFT PANEL ════════════ */}
      <aside className="hidden w-[320px] shrink-0 flex-col overflow-y-auto bg-[#283618] p-6 lg:flex">
        {/* Back */}
        <Link
          href="/dashboard"
          className="mb-6 flex items-center gap-2 text-xs text-[#fefae0]/50 transition-colors hover:text-[#fefae0]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>

        {/* Title */}
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#fefae0]">
          <span>{"\uD83C\uDF99\uFE0F"}</span> Interview Prep
        </h2>
        <p className="mt-1 text-sm text-[#fefae0]/60">
          Practice until you{"'"}re ready.
        </p>

        {/* Session setup */}
        <div className="mt-6 space-y-4">
          {/* Job card */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#fefae0]/50">
              For this role:
            </label>
            <div className="mt-2 rounded-xl bg-[#606c38]/40 p-3">
              <p className="text-sm font-semibold text-[#fefae0]">
                Senior PM -- Spotify -- Paris
              </p>
              <button className="mt-1 text-xs text-[#dda15e] transition-colors hover:text-[#bc6c25]">
                {"Change \u2192"}
              </button>
            </div>
          </div>

          {/* CV card */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#fefae0]/50">
              Using CV:
            </label>
            <div className="mt-2 rounded-xl bg-[#606c38]/40 p-3">
              <p className="text-sm text-[#fefae0]">
                Software Engineer CV -- ATS 87
              </p>
            </div>
          </div>

          {/* Interview type */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#fefae0]/50">
              Interview type:
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {interviewTypes.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSelectedType(t.key)}
                  className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                    selectedType === t.key
                      ? "bg-[#dda15e] text-[#283618]"
                      : "bg-[#606c38]/30 text-[#fefae0] hover:bg-[#606c38]/50"
                  }`}
                >
                  <span className="mr-1">{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#fefae0]/50">
              Difficulty:
            </label>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-[10px] text-[#fefae0]/50">Junior</span>
              <input
                type="range"
                min={0}
                max={100}
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-[#606c38]/30 accent-[#dda15e] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#dda15e]"
              />
              <span className="text-[10px] text-[#fefae0]/50">Senior</span>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#fefae0]/50">
              Language:
            </label>
            <button className="mt-2 flex w-full items-center justify-between rounded-xl bg-[#606c38]/30 px-3 py-2.5 text-sm text-[#fefae0] transition-colors hover:bg-[#606c38]/50">
              <span>{"\uD83C\uDDEB\uD83C\uDDF7"} French</span>
              <ChevronDown className="h-4 w-4 text-[#fefae0]/50" />
            </button>
          </div>

          {/* Session length */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#fefae0]/50">
              Session length:
            </label>
            <div className="mt-2 flex gap-2">
              {sessionLengths.map((len) => (
                <button
                  key={len}
                  onClick={() => setSessionLength(len)}
                  className={`flex-1 rounded-full py-2 text-xs font-semibold transition-colors ${
                    sessionLength === len
                      ? "bg-[#dda15e] text-[#283618]"
                      : "bg-[#606c38]/30 text-[#fefae0] hover:bg-[#606c38]/50"
                  }`}
                >
                  {len === 15 ? `Full (${len})` : `${len} questions`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={startSession}
          disabled={phase === "active"}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#dda15e] py-3 font-bold text-[#283618] transition-colors hover:bg-[#bc6c25] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{"\uD83C\uDF99\uFE0F"}</span>{" "}
          {phase === "active" ? "Session in progress..." : "Start Interview"}
        </button>

        {/* Previous sessions */}
        <div className="mt-8 border-t border-white/10 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#fefae0]/40">
            Recent sessions
          </p>
          <div className="mt-3 space-y-2">
            {previousSessions.map((s, i) => (
              <button
                key={i}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-[#fefae0]/70 transition-colors hover:bg-[#606c38]/20 hover:text-[#fefae0]"
              >
                <span>
                  {s.role} -- {s.date} -- Score {s.score}
                </span>
                <ChevronRight className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ════════════ RIGHT PANEL ════════════ */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-[#606c38]/10 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-sm text-[#606c38] transition-colors hover:text-[#283618] lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <p className="text-sm font-semibold text-[#283618]">
                Session 1{phase === "active" ? ` -- ${interviewTypes.find((t) => t.key === selectedType)?.label} -- Question ${currentQuestion}/${totalQuestions}` : ""}
              </p>
              {phase === "active" && (
                <div className="mt-1 flex gap-1">
                  {Array.from({ length: totalQuestions }, (_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full ${
                        i < currentQuestion
                          ? "bg-[#dda15e]"
                          : "bg-[#606c38]/15"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {phase === "active" && (
              <>
                <span className="font-mono text-sm text-[#606c38]">
                  {formatTime(timer)}
                </span>
                <button
                  onClick={endSession}
                  className="text-sm font-medium text-[#bc6c25] transition-colors hover:text-[#283618]"
                >
                  End session
                </button>
              </>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          {phase === "setup" && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#283618]/5">
                  <Mic className="h-8 w-8 text-[#606c38]/40" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#283618]">
                  Ready to practice?
                </h3>
                <p className="mt-1 text-sm text-[#606c38]">
                  Configure your session on the left and hit Start.
                </p>
                <button
                  onClick={startSession}
                  className="mt-6 rounded-full bg-[#dda15e] px-6 py-2.5 font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25] lg:hidden"
                >
                  Start Interview
                </button>
              </div>
            </div>
          )}

          {phase === "active" && (
            <div className="mx-auto max-w-2xl space-y-6">
              {messages.map((msg) => {
                if (msg.role === "system") {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mx-auto max-w-sm rounded-xl bg-[#283618]/10 px-4 py-2 text-center text-sm text-[#283618]"
                    >
                      <span>{"\uD83C\uDF99\uFE0F"}</span> {msg.content}
                    </motion.div>
                  )
                }

                if (msg.role === "ai-question") {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#283618] text-xs font-bold text-[#fefae0]">
                        AI
                      </div>
                      <div className="max-w-lg rounded-2xl rounded-tl-none bg-white p-5 shadow-sm">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#606c38]">
                          Question {msg.questionNumber} -- {msg.questionType}
                        </p>
                        <p className="text-[#283618] leading-relaxed">
                          {msg.content}
                        </p>
                        {msg.starTip && (
                          <div className="mt-3">
                            <button
                              onClick={() => toggleTip(msg.id)}
                              className="flex items-center gap-1 text-xs font-semibold text-[#dda15e] transition-colors hover:text-[#bc6c25]"
                            >
                              <Sparkles className="h-3 w-3" />
                              Tip: Use the STAR method
                              <ChevronDown
                                className={`h-3 w-3 transition-transform ${
                                  expandedTips.has(msg.id) ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            <AnimatePresence>
                              {expandedTips.has(msg.id) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-2 rounded-lg bg-[#dda15e]/10 p-3 text-xs text-[#283618] leading-relaxed space-y-1">
                                    <p>
                                      <strong className="text-[#dda15e]">
                                        S
                                      </strong>{" "}
                                      = Situation: Set the scene
                                    </p>
                                    <p>
                                      <strong className="text-[#dda15e]">
                                        T
                                      </strong>{" "}
                                      = Task: Your responsibility
                                    </p>
                                    <p>
                                      <strong className="text-[#dda15e]">
                                        A
                                      </strong>{" "}
                                      = Action: What you did
                                    </p>
                                    <p>
                                      <strong className="text-[#dda15e]">
                                        R
                                      </strong>{" "}
                                      = Result: Measurable outcome
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                }

                if (msg.role === "user") {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-row-reverse gap-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#606c38]/20">
                        <Image
                          src="/images/avatar-amara.jpg"
                          alt="User"
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="max-w-lg rounded-2xl rounded-tr-none bg-[#283618] p-5 text-[#fefae0]">
                        <p className="leading-relaxed">{msg.content}</p>
                      </div>
                    </motion.div>
                  )
                }

                if (msg.role === "ai-feedback") {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#283618] text-xs font-bold text-[#fefae0]">
                        AI
                      </div>
                      <div className="max-w-lg rounded-2xl border border-[#606c38]/20 bg-[#606c38]/5 p-5">
                        <p className="font-semibold text-[#283618]">
                          <span>{"\uD83C\uDFAF"}</span> {msg.content}
                        </p>

                        {msg.scores && (
                          <div className="mt-3 flex items-center gap-4">
                            <Stars count={msg.scores.overall} />
                            <span className="text-xs text-[#606c38]">
                              Content: {msg.scores.content}/5 -- Clarity:{" "}
                              {msg.scores.clarity}/5
                            </span>
                          </div>
                        )}

                        {msg.strengths && msg.strengths.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {msg.strengths.map((s, i) => (
                              <p
                                key={i}
                                className="flex items-start gap-1.5 text-xs text-[#606c38]"
                              >
                                <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-[#606c38]" />
                                {s}
                              </p>
                            ))}
                          </div>
                        )}

                        {msg.improvements && msg.improvements.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {msg.improvements.map((imp, i) => (
                              <p
                                key={i}
                                className="flex items-start gap-1.5 text-xs text-[#bc6c25]"
                              >
                                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                                {imp}
                              </p>
                            ))}
                          </div>
                        )}

                        {msg.modelAnswer !== undefined && (
                          <div className="mt-3">
                            <button
                              onClick={() => toggleModel(msg.id)}
                              className="flex items-center gap-1 text-xs font-semibold text-[#dda15e] transition-colors hover:text-[#bc6c25]"
                            >
                              <Sparkles className="h-3 w-3" />
                              {expandedModel.has(msg.id)
                                ? "Hide model answer"
                                : "Want a better answer?"}
                            </button>
                            <AnimatePresence>
                              {expandedModel.has(msg.id) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <p className="mt-2 rounded-lg bg-[#dda15e]/10 p-3 text-xs italic text-[#283618] leading-relaxed">
                                    {msg.modelAnswer}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                }

                return null
              })}

              {/* Next question prompt */}
              {messages.length > 0 &&
                messages[messages.length - 1].role === "ai-question" && (
                  <div className="py-4 text-center">
                    <p className="text-sm text-[#606c38]">
                      Take your time to answer below.
                    </p>
                  </div>
                )}

              {messages.length > 0 &&
                messages[messages.length - 1].role === "ai-feedback" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-4 text-center"
                  >
                    <p className="text-sm text-[#606c38]">
                      Ready for the next question?
                    </p>
                    <button className="mt-2 rounded-full bg-[#dda15e] px-6 py-2 text-sm font-semibold text-[#283618] transition-colors hover:bg-[#bc6c25]">
                      {"Next \u2192"}
                    </button>
                  </motion.div>
                )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        {phase === "active" && (
          <div className="border-t border-[#606c38]/10 bg-white px-4 py-4 sm:px-6">
            {/* Mode selector */}
            <div className="mb-3 flex items-center justify-center gap-1 rounded-full bg-[#606c38]/5 p-1 mx-auto w-fit">
              <button
                onClick={() => {
                  setInputMode("type")
                  setIsRecording(false)
                }}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  inputMode === "type"
                    ? "bg-white text-[#283618] shadow-sm"
                    : "text-[#606c38]"
                }`}
              >
                <Pencil className="h-3 w-3" /> Type
              </button>
              <button
                onClick={() => setInputMode("voice")}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  inputMode === "voice"
                    ? "bg-white text-[#283618] shadow-sm"
                    : "text-[#606c38]"
                }`}
              >
                <Volume2 className="h-3 w-3" /> Voice
              </button>
            </div>

            {inputMode === "type" ? (
              <div className="flex gap-3">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={3}
                  className="flex-1 resize-none rounded-xl border border-[#606c38]/15 bg-[#fefae0] px-4 py-3 text-sm text-[#283618] placeholder:text-[#606c38]/40 focus:border-[#dda15e] focus:outline-none focus:ring-2 focus:ring-[#dda15e]/20"
                />
                <button
                  onClick={submitAnswer}
                  disabled={!userInput.trim()}
                  className="self-end rounded-xl bg-[#283618] px-5 py-3 text-sm font-semibold text-[#fefae0] transition-colors hover:bg-[#606c38] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">{"Submit answer \u2192"}</span>
                  <Send className="h-4 w-4 sm:hidden" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-2">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-all ${
                    isRecording
                      ? "bg-[#bc6c25] text-[#fefae0] scale-110"
                      : "bg-[#283618] text-[#fefae0] hover:bg-[#606c38]"
                  }`}
                >
                  {isRecording && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[#bc6c25]"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  {isRecording ? (
                    <MicOff className="h-6 w-6" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </button>

                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    {/* Waveform animation */}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 20 }, (_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 rounded-full bg-[#bc6c25]"
                          animate={{
                            height: [4, Math.random() * 20 + 4, 4],
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.05,
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-[#606c38]">
                      Recording... {formatTime(recordingTime)}
                    </p>
                    <button
                      onClick={() => setIsRecording(false)}
                      className="rounded-full bg-[#283618] px-5 py-2 text-xs font-semibold text-[#fefae0] transition-colors hover:bg-[#606c38]"
                    >
                      {"Stop & Submit"}
                    </button>
                  </motion.div>
                )}

                {!isRecording && (
                  <p className="text-xs text-[#606c38]">
                    Tap the microphone to start recording
                  </p>
                )}
              </div>
            )}

            <p className="mt-2 text-center text-[10px] text-[#606c38]/50">
              Take your time. Real interviews allow thinking pauses.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
