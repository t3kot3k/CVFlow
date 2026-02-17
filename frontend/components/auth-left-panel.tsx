"use client"

import Image from "next/image"
import Link from "next/link"
import { Leaf } from "lucide-react"

interface AuthLeftPanelProps {
  quote: string
  authorName: string
  authorRole: string
  authorImage: string
}

export function AuthLeftPanel({
  quote,
  authorName,
  authorRole,
  authorImage,
}: AuthLeftPanelProps) {
  return (
    <div className="hidden lg:flex lg:w-[45%] flex-col bg-[#283618] p-10 relative overflow-hidden min-h-screen">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#dda15e]">
          <Leaf className="w-5 h-5 text-[#283618]" />
        </div>
        <span className="text-2xl font-bold text-[#fefae0] tracking-tight">
          CVFlow
        </span>
      </Link>

      {/* Quote block */}
      <div className="flex flex-col justify-center flex-1 max-w-md">
        <span className="text-8xl text-[#dda15e] opacity-30 font-serif leading-none select-none">
          {'"'}
        </span>
        <p className="text-[#fefae0] text-xl italic leading-relaxed -mt-6">
          {quote}
        </p>
        <div className="flex items-center gap-3 mt-6">
          <Image
            src={authorImage}
            alt={authorName}
            width={44}
            height={44}
            className="rounded-full object-cover w-11 h-11"
          />
          <div>
            <p className="text-[#fefae0] font-semibold text-sm">{authorName}</p>
            <p className="text-[#fefae0] opacity-70 text-sm">{authorRole}</p>
          </div>
        </div>
      </div>

      {/* Bottom stat strip */}
      <div className="flex items-center gap-0 text-[#fefae0] text-sm">
        <span className="font-semibold">28K+ users</span>
        <span className="mx-4 w-px h-4 bg-[#fefae0]/30" />
        <span className="font-semibold">87% more interviews</span>
        <span className="mx-4 w-px h-4 bg-[#fefae0]/30" />
        <span className="font-semibold">40 countries</span>
      </div>
    </div>
  )
}
