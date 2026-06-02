import * as React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export default function CeoMessageSection() {
  return (
    <section className="py-4 px-3 sm:px-8 bg-surface">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-surface-container-lowest rounded-[2rem] p-6 sm:p-10 flex flex-col lg:flex-row items-center lg:items-start gap-12 border border-surface-dim/20"
        >
          {/* CEO Image */}
          <div className="w-full lg:w-1/3 max-w-[380px]">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-surface-dim/20 bg-surface-container-low">
              <picture>
                <source srcSet="/ceo-mobile.webp" media="(max-width: 640px)" />
                <img
                  src="/ceo-profile.webp"
                  alt="Devika Pakruthi - CEO"
                  width="300"
                  height="280"
                  loading="lazy"
                  className="w-full h-auto max-h-[400px] object-contain"
                />
              </picture>
            </div>
          </div>

          {/* Content */}
          <div className="lg:w-3/4 text-on-surface space-y-4">
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Message from the CEO</h2>
            <div className="space-y-3 text-on-surface leading-relaxed text-base">
              <p>
                <span className="font-bold text-on-surface">ADHOC NETWORK TECH LMS</span> is dedicated to providing a comprehensive educational ecosystem featuring high-demand, trending courses—from intelligent data insights to next-generation AI innovations, shaping smarter learning experiences. We meticulously design each course to bridge the gap between academic theory and real-world, practical experience.
              </p>
              <p>
                It gives us great joy to see our students learn the various components of professional tools to prepare them for the future. We offer a full range of trending technology courses.
              </p>
              <p>
                This empowers students to learn the skills needed to succeed in the global IT domain.
              </p>
            </div>

            <div className="pt-4 border-t border-surface-dim/20 flex justify-between items-center">
              <div>
                <p className="text-xl font-bold text-on-surface">Devika Pakruthi</p>
                <p className="text-secondary font-medium">Chief Executive Officer</p>
                <p className="text-primary text-sm font-bold uppercase tracking-wider">ADHOC NETWORK TECH</p>
              </div>
              <Link
                to="/about-us"
                className="px-6 py-2 bg-primary text-on-primary rounded-xl font-bold text-sm hover:scale-105 transition-transform shadow-lg whitespace-nowrap"
              >
                About Us
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
