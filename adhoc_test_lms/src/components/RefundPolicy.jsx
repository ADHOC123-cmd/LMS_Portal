function RefundPolicy() {
  return (
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center p-4 sm:p-8 lg:p-12">
      <div className="w-full max-w-4xl bg-surface p-8 sm:p-12 lg:p-16 rounded-[var(--radius-3xl)] shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-outline-variant dark:border-surface-variant transition-all duration-300">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-8">
          Refund Policy
        </h1>

        <div className="space-y-6 font-body text-[var(--text-lg)] leading-relaxed text-on-surface-variant">
          <p>
            At Adhoc Network Tech, we are committed to providing high-quality
            educational content and a seamless learning experience through our
            LMS portal.
          </p>

          <p>
            Because our courses, certifications, and training materials are
            digital products and are made accessible immediately upon purchase,
            all sales are generally final and non-refundable.
          </p>

          <p>
            We understand, however, that exceptional circumstances can occur.
          </p>
        </div>

        <h2 className="font-headline text-[var(--text-3xl)] font-bold mt-14 mb-6 text-on-surface tracking-tight">
          Technical Issues
        </h2>

        <p className="font-body text-[var(--text-lg)] leading-relaxed text-on-surface-variant mb-6">
          Refund requests may be considered if a severe technical issue prevents
          you from accessing the course content and our support team is unable
          to resolve the issue within 3 to 5 business days.
        </p>

        <h2 className="font-headline text-[var(--text-3xl)] font-bold mt-12 mb-6 text-on-surface tracking-tight">
          Duplicate Purchases
        </h2>

        <p className="font-body text-[var(--text-lg)] leading-relaxed text-on-surface-variant mb-6">
          Refunds may also be considered if you accidentally purchased the same
          course twice within a 24-hour window.
        </p>

        <h2 className="font-headline text-[var(--text-3xl)] font-bold mt-12 mb-6 text-on-surface tracking-tight">
          Refund Request Process
        </h2>

        <p className="font-body text-[var(--text-lg)] leading-relaxed text-on-surface-variant mb-6">
          To request a review, please contact our support team with your
          enrollment details and reason for request.
        </p>

        <div className="mt-8 mb-12 p-6 bg-surface-container-high dark:bg-surface-container rounded-[var(--radius-2xl)] border border-outline-variant/30">
          <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
            Support Contact
          </h3>
          <a
            href="mailto:hr@adhocnetwork.tech"
            className="inline-flex items-center font-body font-semibold text-primary text-[var(--text-xl)] hover:text-on-primary-fixed hover:bg-primary-container px-4 py-2 -ml-4 rounded-[var(--radius-lg)] transition-colors duration-300"
          >
            hr@adhocnetwork.tech
          </a>
        </div>

        <h2 className="font-headline text-[var(--text-3xl)] font-bold mt-12 mb-6 text-on-surface tracking-tight">
          Refund Timeline
        </h2>

        <p className="font-body text-[var(--text-lg)] leading-relaxed text-on-surface-variant">
          Approved refunds will be credited back to the original payment method
          within 5-7 business days.
        </p>
      </div>
    </div>
  );
}

export default RefundPolicy;
