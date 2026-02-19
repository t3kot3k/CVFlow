"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Clock, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const tags = ["All", "CV Tips", "Job Search", "ATS", "Interview", "Career Change", "Africa", "Asia"]

const featuredPost = {
  slug: "10-cv-mistakes-costing-you-interviews",
  tag: "CV Tips",
  title: "10 CV Mistakes That Are Costing You Interviews in 2026",
  excerpt:
    "Most job seekers make the same critical errors on their CVs without realizing it. From formatting issues that confuse ATS systems to vague bullet points that fail to showcase impact, these mistakes could be the reason you are not landing interviews. Here is how to fix them today.",
  author: "Amara Diallo",
  date: "Feb 12, 2026",
  readTime: "8 min read",
  image: "/images/blog/featured-cv-tips.jpg",
}

const posts = [
  {
    slug: "beat-ats-systems-2026",
    tag: "ATS",
    title: "How to Beat ATS Systems and Get Your CV Seen by Humans",
    excerpt: "Understanding how applicant tracking systems filter candidates and how to optimize your CV.",
    author: "Fatima Al-Hassan",
    date: "Feb 8, 2026",
    readTime: "6 min read",
    image: "/images/blog/ats-optimization.jpg",
  },
  {
    slug: "job-search-west-africa-guide",
    tag: "Africa",
    title: "The Complete Job Search Guide for West Africa in 2026",
    excerpt: "Navigate the booming job markets in Senegal, Ghana, Nigeria, and beyond.",
    author: "Kwame Asante",
    date: "Feb 5, 2026",
    readTime: "10 min read",
    image: "/images/blog/job-search-africa.jpg",
  },
  {
    slug: "ace-behavioral-interviews",
    tag: "Interview",
    title: "How to Ace Behavioral Interviews with the STAR Method",
    excerpt: "Master the proven framework that top candidates use to answer tough interview questions.",
    author: "Priya Sharma",
    date: "Jan 30, 2026",
    readTime: "7 min read",
    image: "/images/blog/interview-prep.jpg",
  },
  {
    slug: "career-change-after-30",
    tag: "Career Change",
    title: "Switching Careers After 30: A Step-by-Step Playbook",
    excerpt: "It is never too late to pivot. Here is how to repackage your experience for a new industry.",
    author: "Omar Benali",
    date: "Jan 25, 2026",
    readTime: "9 min read",
    image: "/images/blog/career-change.jpg",
  },
  {
    slug: "linkedin-profile-optimization",
    tag: "Job Search",
    title: "LinkedIn Profile Optimization: The 2026 Checklist",
    excerpt: "Turn your LinkedIn into a recruiter magnet with these proven optimization strategies.",
    author: "Amara Diallo",
    date: "Jan 20, 2026",
    readTime: "5 min read",
    image: "/images/blog/linkedin-profile.jpg",
  },
  {
    slug: "remote-work-global-companies",
    tag: "Asia",
    title: "Landing Remote Roles at Global Companies from Asia",
    excerpt: "How to position yourself for international remote opportunities from India, Philippines, and beyond.",
    author: "Priya Sharma",
    date: "Jan 15, 2026",
    readTime: "8 min read",
    image: "/images/blog/remote-work.jpg",
  },
]

const mostRead = [
  { slug: "beat-ats-systems-2026", title: "How to Beat ATS Systems and Get Your CV Seen by Humans" },
  { slug: "10-cv-mistakes-costing-you-interviews", title: "10 CV Mistakes That Are Costing You Interviews in 2026" },
  { slug: "ace-behavioral-interviews", title: "How to Ace Behavioral Interviews with the STAR Method" },
  { slug: "linkedin-profile-optimization", title: "LinkedIn Profile Optimization: The 2026 Checklist" },
  { slug: "career-change-after-30", title: "Switching Careers After 30: A Step-by-Step Playbook" },
]

export default function BlogPage() {
  const [activeTag, setActiveTag] = useState("All")

  const filteredPosts =
    activeTag === "All" ? posts : posts.filter((p) => p.tag === activeTag)

  return (
    <div className="flex min-h-screen flex-col bg-[#fefae0]">
      <Navbar />
      <main className="flex-1 mx-auto max-w-7xl px-6">
        {/* Header */}
        <section className="pb-8 pt-16 text-center">
          <h1 className="text-4xl font-bold text-[#283618] text-balance md:text-5xl">
            Career Resources
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[#283618]/70">
            Tips, guides, and insights for job seekers worldwide.
          </p>
        </section>

        {/* Tag Filters */}
        <div className="flex flex-wrap justify-center gap-2 pb-12">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeTag === tag
                  ? "bg-[#283618] text-[#fefae0] shadow-md"
                  : "border border-[#606c38]/20 text-[#283618] hover:bg-[#dda15e]/10 hover:border-[#dda15e]/40"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        <Link
          href={`/blog/${featuredPost.slug}`}
          className="group mb-16 flex flex-col overflow-hidden rounded-2xl border border-[#606c38]/10 bg-white shadow-sm transition-all hover:shadow-lg hover:border-[#dda15e]/20 md:flex-row"
        >
          <div className="relative h-64 w-full overflow-hidden md:h-auto md:w-1/2">
            <Image
              src={featuredPost.image}
              alt={featuredPost.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-1 flex-col justify-center p-8 md:p-10">
            <span className="mb-3 inline-flex w-fit rounded-full bg-[#606c38]/10 px-3 py-1 text-xs font-semibold text-[#606c38]">
              {featuredPost.tag}
            </span>
            <h2 className="text-2xl font-bold text-[#283618] text-balance transition-colors group-hover:text-[#606c38] md:text-3xl">
              {featuredPost.title}
            </h2>
            <p className="mt-3 leading-relaxed text-[#283618]/60">
              {featuredPost.excerpt}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#283618] text-xs font-bold text-[#fefae0]">
                {featuredPost.author.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-[#283618]">{featuredPost.author}</p>
                <p className="flex items-center gap-2 text-xs text-[#606c38]">
                  {featuredPost.date}
                  <span className="text-[#283618]/20">|</span>
                  <Clock className="h-3 w-3" />
                  {featuredPost.readTime}
                </p>
              </div>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#dda15e] transition-all group-hover:gap-3">
              Read more <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>

        {/* Posts Grid + Sidebar */}
        <div className="flex gap-12 pb-16 lg:flex-row flex-col">
          {/* 3-column grid */}
          <div className="flex-1">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-[#606c38]/10 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[#dda15e]/30 hover:translate-y-[-2px]"
                >
                  <div className="relative h-44 w-full overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <span className="mb-2 inline-flex w-fit rounded-full bg-[#606c38]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#606c38]">
                      {post.tag}
                    </span>
                    <h3 className="text-sm font-bold text-[#283618] leading-snug transition-colors group-hover:text-[#606c38]">
                      {post.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-1 text-xs text-[#283618]/50">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto flex items-center gap-2 pt-4">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#283618] text-[8px] font-bold text-[#fefae0]">
                        {post.author.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-[#283618]">{post.author}</p>
                        <p className="text-[10px] text-[#606c38]">{post.date}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-lg font-semibold text-[#283618]">No articles found</p>
                <p className="mt-2 text-sm text-[#283618]/50">Try selecting a different tag above.</p>
              </div>
            )}
          </div>

          {/* Sidebar - Most Read */}
          <aside className="w-full shrink-0 lg:w-72">
            <div className="sticky top-24 rounded-2xl border border-[#606c38]/10 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#283618]/40">
                Most Read
              </h3>
              <ol className="space-y-4">
                {mostRead.map((article, i) => (
                  <li key={article.slug}>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="group flex items-start gap-3 transition-colors"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dda15e]/15 text-xs font-bold text-[#bc6c25] transition-colors group-hover:bg-[#dda15e] group-hover:text-[#283618]">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-snug text-[#283618] transition-colors group-hover:text-[#606c38]">
                        {article.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 pb-20">
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[#606c38]/20 text-[#283618]/40 transition-all hover:border-[#dda15e] hover:text-[#283618]">
            <ChevronLeft className="h-4 w-4" />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all ${
                page === 1
                  ? "bg-[#283618] text-[#fefae0] shadow-md"
                  : "border border-[#606c38]/20 text-[#283618] hover:border-[#dda15e] hover:bg-[#dda15e]/10"
              }`}
            >
              {page}
            </button>
          ))}
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[#606c38]/20 text-[#283618] transition-all hover:border-[#dda15e] hover:text-[#283618]">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
