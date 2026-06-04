export const metadata = {
  title: "Terms of Service | FireThis",
  description: "Terms of Service for FireThis — AI resume feedback for college students.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-12 text-zinc-300">
      <div>
        <h1 className="text-4xl font-extrabold text-white">Terms of Service</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: May 30, 2026</p>
      </div>

      <p>
        Welcome to FireThis. By accessing or using our website and services at{" "}
        <span className="text-white">resume-roast-ai-phi.vercel.app</span> (the
        &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service
        (&ldquo;Terms&rdquo;). Please read them carefully. If you do not agree, do not use
        the Service.
      </p>

      <Section title="1. About FireThis">
        <p>
          FireThis provides AI-powered resume feedback, resume tailoring, and cover letter
          writing tools. The Service is intended for college students and job seekers.
          FireThis is an independent product and is not affiliated with any employer,
          recruiting platform, or university.
        </p>
      </Section>

      <Section title="2. Account Registration">
        <p>
          To access certain features, you must create an account with a valid email address
          and password. You are responsible for maintaining the confidentiality of your
          account credentials and for all activity under your account. You must be at least
          13 years of age to use the Service.
        </p>
      </Section>

      <Section title="3. Subscriptions and Payments">
        <p>
          FireThis offers a free tier and paid subscription plans (Plus and Pro). Paid
          plans are billed monthly through our payment processor, Lemon Squeezy. By
          subscribing, you authorize us to charge your payment method on a recurring basis
          until you cancel.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <span className="font-semibold text-white">Free:</span> Limited to 1 resume
            roast per month.
          </li>
          <li>
            <span className="font-semibold text-white">Plus ($4.99/mo):</span> Unlimited
            roasts, Resume Worker, Cover Letter Writer, basic ATS optimization.
          </li>
          <li>
            <span className="font-semibold text-white">Pro ($5.99/mo):</span> Everything
            in Plus, full ATS optimization, saved history, F-1/OPT job strategy, priority
            support.
          </li>
        </ul>
        <p className="mt-3">
          All prices are in USD. We reserve the right to change pricing with reasonable
          notice.
        </p>
      </Section>

      <Section title="4. Cancellations and Refunds">
        <p>
          You may cancel your subscription at any time from your billing portal. Cancellation
          takes effect at the end of the current billing period — you retain access to paid
          features until then. We do not offer refunds for partial billing periods except
          where required by applicable law. If you believe you were charged in error, contact
          us within 14 days and we will review your case.
        </p>
      </Section>

      <Section title="5. Acceptable Use">
        <p>You agree not to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Use the Service to generate false, misleading, or fraudulent content.</li>
          <li>Attempt to reverse-engineer, scrape, or automate access to the Service.</li>
          <li>Share your account credentials with others.</li>
          <li>Use the Service for any unlawful purpose.</li>
        </ul>
        <p className="mt-3">
          We reserve the right to suspend or terminate accounts that violate these rules.
        </p>
      </Section>

      <Section title="6. Your Content">
        <p>
          You retain ownership of any resume content, job descriptions, or other materials
          you submit to the Service (&ldquo;Your Content&rdquo;). By submitting content, you grant
          FireThis a limited license to process it solely to provide you with the Service.
          We do not sell, share, or use Your Content to train AI models without your
          explicit consent.
        </p>
      </Section>

      <Section title="7. Intellectual Property">
        <p>
          All software, design, text, graphics, and other content produced by FireThis
          (excluding Your Content) are owned by or licensed to FireThis. You may not copy,
          modify, or distribute any part of the Service without prior written permission.
        </p>
      </Section>

      <Section title="8. Disclaimer of Warranties">
        <p>
          The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any
          kind. FireThis does not guarantee that the Service will be error-free, uninterrupted,
          or that AI-generated feedback will result in job offers or interview callbacks.
          Feedback is informational only — you are responsible for your own career decisions.
        </p>
      </Section>

      <Section title="9. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, FireThis shall not be liable for any
          indirect, incidental, special, or consequential damages arising from your use of
          the Service, including lost opportunities, lost revenue, or loss of data. Our
          total liability to you for any claim shall not exceed the amount you paid us in
          the 3 months preceding the claim.
        </p>
      </Section>

      <Section title="10. Changes to These Terms">
        <p>
          We may update these Terms from time to time. We will notify you of significant
          changes by posting an updated version on this page with a revised date. Continued
          use of the Service after changes constitutes acceptance of the new Terms.
        </p>
      </Section>

      <Section title="11. Governing Law">
        <p>
          These Terms are governed by the laws of the United States. Any disputes shall be
          resolved in the courts of competent jurisdiction in your state of residence or the
          state where FireThis operates, unless otherwise required by applicable law.
        </p>
      </Section>

      <Section title="12. Contact Us">
        <p>
          If you have any questions about these Terms, please contact us at{" "}
          <a
            href="mailto:cookiej180@gmail.com"
            className="text-brand-400 hover:underline"
          >
            cookiej180@gmail.com
          </a>
          .
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <div className="space-y-2 text-zinc-300">{children}</div>
    </section>
  );
}
