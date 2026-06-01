import * as React from "react"
import { Star } from "lucide-react"

export default function TestimonialsSection({ testimonials }) {
  return (
    <section id="testimonials" className="py-16 px-3 sm:px-8 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-headline font-bold text-primary mb-4">What Our Learners Say</h2>
          <p className="text-secondary">Trusted by professionals from leading companies worldwide.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-dim/20 hover:border-primary/20 transition-all"
            >
              <div className="flex text-amber-400 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-on-surface mb-6 leading-relaxed">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.user?.avatar || `https://i.pravatar.cc/40?u=${testimonial.id || testimonial.user?.name}`}
                  alt={testimonial.user?.name || "User"}
                  width="40"
                  height="40"
                  className="w-10 h-10 rounded-full object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="font-bold text-sm">{testimonial.user?.name || "Unknown User"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
