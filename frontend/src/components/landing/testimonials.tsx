"use client";

import Image from "next/image";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Marketing Manager",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    quote:
      "After optimizing my CV with Recruit AI, my ATS score went from 45% to 92%. I received 3 interview calls in the first week alone. A huge time saver!",
    metric: "3 interviews in 1 week",
    stars: 5,
  },
  {
    name: "James Chen",
    role: "Software Engineer",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    quote:
      "The AI cover letter generator saved me hours of work. Each letter was perfectly tailored to the job description. I landed my dream role at a top tech company.",
    metric: "Hired within 3 weeks",
    stars: 5,
  },
  {
    name: "Amira Dossou",
    role: "Financial Analyst",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    quote:
      "The real-time tracking feature is a game-changer. I could see when recruiters opened my CV and followed up at the perfect moment. Two interview offers within a month.",
    metric: "2x more recruiter responses",
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section className="px-6 lg:px-40 py-20 bg-primary/5" id="testimonials">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What our users are saying
          </h2>
          <p className="text-[#4d6599] dark:text-gray-400">
            Real results from real job seekers who optimized their applications
            with Recruit AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white dark:bg-[#1c2231] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col hover:shadow-lg transition-shadow duration-300"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: testimonial.stars }).map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-yellow-400 text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-[#4d6599] dark:text-gray-400 text-sm leading-relaxed flex-1 mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Metric highlight */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2 mb-6">
                <p className="text-green-600 dark:text-green-400 text-sm font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    trending_up
                  </span>
                  {testimonial.metric}
                </p>
              </div>

              {/* Author with real photo */}
              <div className="flex items-center gap-3">
                <Image
                  src={testimonial.photo}
                  alt={testimonial.name}
                  width={44}
                  height={44}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-bold">{testimonial.name}</p>
                  <p className="text-xs text-[#4d6599] dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
