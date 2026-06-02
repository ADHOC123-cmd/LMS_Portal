import * as React from "react";
import { motion } from "framer-motion";
import { Award, Brain, History, Globe } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function BentoFeaturesSection() {
  return (
    <section className="py-16 px-3 sm:px-8 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-headline font-bold text-primary mb-4">
            The Editorial Experience
          </h2>
          <p className="text-secondary">
            Designed for professionals who demand high-end interfaces and
            unparalleled curriculum depth.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
        >
          <motion.div
            variants={fadeUp}
            className="flex flex-col h-full p-6 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container-high transition-colors group"
          >
            <Award className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-headline font-bold mb-2">
              Industry Accreditation
            </h3>
            <p className="text-secondary flex-grow">
              Our certs are designed directly with enterprise CTOs, providing
              immediate professional legitimacy.
            </p>
            <div className="mt-6 flex items-center gap-2 text-primary text-sm font-medium">
              Recognized by 500+ companies
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-col h-full p-6 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container-high transition-colors group"
          >
            <Brain className="w-12 h-12 text-primary mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-headline font-bold mb-2">
              Expert Focus
            </h3>
            <p className="text-secondary flex-grow">
              Mentors leading deep technical pathways from FAANG and Fortune
              500.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-col h-full p-6 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container-high transition-colors group"
          >
            <History className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-headline font-bold mb-2">
              Limited time Access
            </h3>
            <p className="text-secondary flex-grow">
              Purchase once, review forever. All future updates included.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-col h-full p-6 rounded-xl border border-outline-variant bg-surface-container-low dark:bg-surface-container-high transition-colors group"
          >
            <Globe className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-headline font-bold mb-2">
              Global Network
            </h3>
            <p className="text-secondary flex-grow">
              Join 45k+ alumni worldwide across 80+ countries.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
