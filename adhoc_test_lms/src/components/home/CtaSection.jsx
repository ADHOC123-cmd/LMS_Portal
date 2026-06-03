import * as React from "react";
import { Link } from "react-router-dom";

export default function CtaSection() {
  return (
    <section className="py-12 px-3 sm:px-8 signature-gradient">
      <div className="max-w-4xl mx-auto text-center text-white">
        <h2 className="text-2xl sm:text-4xl font-headline font-bold mb-4">
          Ready to Elevate Your Career?
        </h2>
        <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
          Join an exclusive community of professionals transforming their
          careers with our premium courses.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/catalog"
            className="px-8 py-3 border-2 border-white/30 bg-primary text-on-primary rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
          >
            Browse All Courses
          </Link>
        </div>
        <p className="text-xs opacity-70 mt-6">
          No credit card required • Cancel anytime
        </p>
      </div>
    </section>
  );
}
