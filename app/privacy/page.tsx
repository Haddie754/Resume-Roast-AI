export const metadata = {
  title: "Privacy Policy | FireThis",
  description: "How FireThis collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-12 text-zinc-300">
      <div>
        <h1 className="text-4xl font-extrabold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: August 2026</p>
      </div>

      <p>
        This Privacy Policy explains how FireThis (&ldquo;we,&rdquo; &ldquo;us&rdquo;) collects, uses, and
        protects your information when you use our website and services at{" "}
        <span className="text-white">firethis.app</span> (the &ldquo;Service&rdquo;). By using the
        Service, you agree to this policy.
      </p>

      <Section title="1. Information We Collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-semibold text-white">Account information:</span> your email
            address and a password (stored in hashed form by our authentication provider).
          </li>
          <li>
            <span className="font-semibold text-white">Content you submit:</span> resume text,
            uploaded resume files, job descriptions, company names, and similar materials you
            provide to use the tools (&ldquo;Your Content&rdquo;).
          </li>
          <li>
            <span className="font-semibold text-white">Usage data:</span> the tools you use and
            counts of your activity (e.g., how many roasts you&rsquo;ve run this month).
          </li>
          <li>
            <span className="font-semibold text-white">Payment information:</span> handled
            entirely by our payment processor, Lemon Squeezy. We never see or store your full
            card details.
          </li>
          <li>
            <span className="font-semibold text-white">Device &amp; analytics data:</span> basic,
            largely aggregate information such as pages visited and referral source, plus
            cookies (see below).
          </li>
        </ul>
      </Section>

      <Section title="2. How We Use Your Information">
        <ul className="list-disc space-y-2 pl-5">
          <li>To provide and operate the Service and generate your feedback.</li>
          <li>To manage your account, subscription, and free-tier usage limits.</li>
          <li>To improve, secure, and troubleshoot the Service.</li>
          <li>To communicate with you about your account or support requests.</li>
        </ul>
      </Section>

      <Section title="3. AI Processing of Your Content">
        <p>
          To generate feedback, Your Content is sent to our third-party AI provider for
          processing. We do <span className="font-semibold text-white">not</span> sell Your
          Content, and we do not use it to train AI models without your explicit consent.
        </p>
      </Section>

      <Section title="4. Sharing and Service Providers">
        <p>
          We do not sell your personal information. We share it only with the service providers
          we rely on to run FireThis:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li><span className="font-semibold text-white">Supabase</span> — authentication and database storage.</li>
          <li><span className="font-semibold text-white">Lemon Squeezy</span> — payment processing and subscription billing.</li>
          <li><span className="font-semibold text-white">Vercel</span> — hosting and privacy-friendly, aggregate web analytics.</li>
          <li><span className="font-semibold text-white">Our AI provider</span> — processing Your Content to generate feedback.</li>
        </ul>
        <p className="mt-3">
          We may also disclose information if required by law or to protect our rights and users.
        </p>
      </Section>

      <Section title="5. Cookies and Analytics">
        <p>
          We use a small number of cookies: essential cookies to keep you signed in and to
          enforce the free-preview limit, a first-party cookie to remember which channel
          referred you (so we can measure our marketing), and Vercel Web Analytics for aggregate
          traffic stats. We do not use third-party advertising cookies. You can clear or block
          cookies in your browser settings, though some features may not work without them.
        </p>
      </Section>

      <Section title="6. Data Retention">
        <p>
          We keep your account information and Your Content while your account is active. You can
          request deletion of your account and associated data at any time by contacting us.
        </p>
      </Section>

      <Section title="7. Your Rights">
        <p>
          Depending on where you live, you may have the right to access, correct, delete, or
          export your personal information, and to object to certain processing. Residents of
          California (CCPA) and the EU/UK (GDPR) may have additional rights. To exercise any of
          these, email us at the address below and we will respond as required by applicable law.
        </p>
      </Section>

      <Section title="8. Data Security">
        <p>
          We use reasonable technical and organizational measures to protect your information.
          However, no method of transmission or storage is completely secure, and we cannot
          guarantee absolute security.
        </p>
      </Section>

      <Section title="9. Children">
        <p>
          The Service is not directed to children under 13, and we do not knowingly collect
          personal information from them.
        </p>
      </Section>

      <Section title="10. International Users">
        <p>
          FireThis is operated from the United States, and your information may be processed
          there. By using the Service, you consent to this processing.
        </p>
      </Section>

      <Section title="11. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will post the updated version
          here with a revised date. Continued use of the Service after changes constitutes
          acceptance.
        </p>
      </Section>

      <Section title="12. Contact Us">
        <p>
          Questions about your privacy? Contact us at{" "}
          <a href="mailto:cookiej180@gmail.com" className="text-brand-400 hover:underline">
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
