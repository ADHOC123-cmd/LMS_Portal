import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Trophy, Target, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AboutUs() {
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="py-16 px-4 sm:px-8 bg-surface text-on-surface overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-4">
            🌐 Discover Our Story
          </span>
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">About Us</h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

          {/* Left Side: Content Section */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="w-full lg:w-7/12 space-y-10"
          >
            {/* Who We Are */}
            <motion.div variants={fadeUp} className="space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-headline font-bold text-primary">Who We Are</h3>
              </div>
              <p className="text-lg text-secondary leading-relaxed">
                Founded by <span className="font-bold text-on-surface">Devika Pakruthi</span>, Adhoc Network Tech is a technology-driven company focused on product development, software solutions, and industry-oriented internship programs.we believe that education should be engaging, inclusive, and aligned with the evolving demands of the digital world .By integrating cutting-edge technology, industry-relevant content, skill development programs, internships, and real-time learning analytics, we create an ecosystem that fosters continuous growth and career success.
              </p>
            </motion.div>

            {/* Our Vision */}
            <motion.div variants={fadeUp} className="space-y-4 bg-primary text-on-primary p-8 rounded-[2rem] shadow-xl ambient-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-2xl font-headline font-bold relative z-10">Our Vision</h3>
              <p className="opacity-90 leading-relaxed text-lg relative z-10">
                To become a global leader in educational technology, creating platforms that not only deliver knowledge but also inspire curiosity, creativity, and lifelong learning.
              </p>
            </motion.div>

            {/* Our Mission */}
            <motion.div variants={fadeUp} className="space-y-4 bg-surface-container-low p-6 rounded-2xl border border-surface-dim/20">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-headline font-bold text-primary">Our Mission</h3>
              </div>
              <p className="text-secondary leading-relaxed">
                We believe education should be seamless, interactive, and tailored to every learner’s journey. Our mission is to empower institutions, educators, and students with tools that simplify teaching, enhance collaboration, and unlock new opportunities for growth.
              </p>
            </motion.div>

            {/* What We Do */}
            <motion.div variants={fadeUp} className="space-y-4">
              <h3 className="text-2xl font-headline font-bold text-primary">What We Do</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xl">🚀</span>
                  </div>
                  <div>
                    <strong className="text-on-surface block text-lg">LMS Portal Development</strong>
                    <span className="text-secondary">A robust platform for online courses, assessments, and certifications.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xl">🔍</span>
                  </div>
                  <div>
                    <strong className="text-on-surface block text-lg">SEO-Optimized Learning Spaces</strong>
                    <span className="text-secondary">Helping institutions reach more learners through smart digital visibility.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xl">💡</span>
                  </div>
                  <div>
                    <strong className="text-on-surface block text-lg">Next-Gen Tech Integration</strong>
                    <span className="text-secondary">Leveraging AI, analytics, and automation to enrich the learning experience.</span>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* Why Choose Us */}
            <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-4">
              <div className="col-span-full">
                <h3 className="text-2xl font-headline font-bold text-primary mb-4">Why Choose Us</h3>
              </div>
              {[
                { title: "Innovation at Core", desc: "We constantly evolve with the latest in edtech and generative AI." },
                { title: "User-Centric Design", desc: "Built for simplicity, speed, and scalability." },
                { title: "Trusted Leadership", desc: "Guided by Devika Parkuthi’s vision of making technology a bridge to better education." }
              ].map((item, idx) => (
                <div key={idx} className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-dim/20 ambient-shadow hover:border-primary/30 transition-all">
                  <ShieldCheck className="w-6 h-6 text-primary mb-3" />
                  <h4 className="font-bold text-on-surface mb-2">{item.title}</h4>
                  <p className="text-sm text-secondary">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side: Founder Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-5/12"
          >
            <div className="sticky top-8 bg-surface-container-lowest rounded-[2rem] p-6 sm:p-8 border border-surface-dim/20 ambient-shadow">

              {/* Founder Image and Info */}
              <div className="text-center mb-8">
                <div className="relative inline-block mb-6 group">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/40 transition-all duration-500" />
                  <img
                    src="https://github.com/saiakhil1629/ascs_bootcamp/blob/main/WhatsApp%20Image%202026-05-17%20at%2011.16.33%20AM.jpeg?raw=true"
                    alt="Devika Pakruthi"
                    className="relative w-40 h-40 object-cover rounded-full border-4 border-surface shadow-2xl mx-auto"
                  />
                  <div className="absolute -bottom-3 -right-3 bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center border-4 border-surface shadow-lg">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                </div>

                <h3 className="text-3xl font-headline font-bold text-primary mb-1">Devika Pakruthi</h3>
                <p className="text-lg font-semibold text-secondary mb-2">Chief Executive Officer</p>
                <p className="text-sm font-bold text-primary/80 uppercase tracking-widest bg-primary/5 inline-block px-3 py-1 rounded-full border border-primary/10">ADHOC NETWORK</p>
              </div>

              {/* Awards and Prices Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  <h4 className="text-xl font-headline font-bold text-on-surface">Awards & Recognition</h4>
                </div>

                <div className="grid gap-4">
                  {/* Award Card 1 */}
                  <div className="group relative bg-surface-container hover:bg-surface-container-high transition-colors p-5 rounded-2xl border border-surface-dim/10 overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
                    <div className="flex gap-4 relative z-10 items-start">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-500 mt-1">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="font-bold text-on-surface text-lg mb-1">National MSME Award 2025–26</h5>
                        <p className="text-sm text-secondary leading-relaxed">Awarded by FICCI FLO for excellence in skill development and creating employment opportunities.</p>
                      </div>
                    </div>
                  </div>

                  {/* Award Card 2 */}
                  <div className="group relative bg-surface-container hover:bg-surface-container-high transition-colors p-5 rounded-2xl border border-surface-dim/10 overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
                    <div className="flex gap-4 relative z-10 items-start">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-500 mt-1">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="font-bold text-on-surface text-lg mb-1">Global Visionary in Skill Development & Internship Innovation</h5>
                        <p className="text-sm text-secondary leading-relaxed">Recognized globally for pioneering innovative learning and internship ecosystems.</p>
                      </div>
                    </div>
                  </div>

                  {/* Award Card 3 */}
                  <div className="group relative bg-surface-container hover:bg-surface-container-high transition-colors p-5 rounded-2xl border border-surface-dim/10 overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
                    <div className="flex gap-4 relative z-10 items-start">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-500 mt-1">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="font-bold text-on-surface text-lg mb-1"> BNI Guntur Young Entrepreneur Award 2025</h5>
                        <p className="text-sm text-secondary leading-relaxed">Celebrated for outstanding entrepreneurial achievements and business leadership.</p>
                      </div>
                    </div>
                  </div>

                  {/* Award Card 4 */}
                  <div className="group relative bg-surface-container hover:bg-surface-container-high transition-colors p-5 rounded-2xl border border-surface-dim/10 overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
                    <div className="flex gap-4 relative z-10 items-start">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-500 mt-1">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="font-bold text-on-surface text-lg mb-1">Youngest CEO of the Year</h5>
                        <p className="text-sm text-secondary leading-relaxed">Honored by Global Pride Awards for remarkable leadership and organizational impact.</p>
                      </div>
                    </div>
                  </div>

                  {/* Award Card 5 */}
                  <div className="group relative bg-surface-container hover:bg-surface-container-high transition-colors p-5 rounded-2xl border border-surface-dim/10 overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                    <div className="flex gap-4 relative z-10 items-start">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-500 mt-1">
                        <Star className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="font-bold text-on-surface text-lg mb-1">Women Rising Star of the Year</h5>
                        <p className="text-sm text-secondary leading-relaxed">Recognized for driving inclusive growth, innovation, and community empowerment.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
