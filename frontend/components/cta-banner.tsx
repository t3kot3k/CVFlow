import Link from "next/link"

export function CTABanner() {
  return (
    <section className="bg-[#dda15e] px-6 py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-5xl font-bold text-[#283618] text-balance">
          Your next job starts here.
        </h2>
        <p className="mt-3 text-[#283618]/80">
          Join 28,000+ job seekers who build smarter CVs with CVFlow.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-block rounded-full bg-[#283618] px-10 py-4 text-lg font-bold text-[#fefae0] shadow-xl transition-all hover:bg-[#606c38] hover:scale-105"
        >
          {"Build my free CV \u2192"}
        </Link>
        <p className="mt-3 text-sm text-[#283618]/60">
          No credit card required {"\u00B7"} Cancel anytime
        </p>
      </div>
    </section>
  )
}
