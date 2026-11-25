export const metadata = { title: "Terms of Service" };

const UPDATED = "September 15, 2026";

export default function TermsPage() {
  return (
    <section className="wrap pb-24">
      <div className="mx-auto max-w-[720px]">
      <div className="page-in pt-10 pb-6 lg:pt-16">
        <h1 className="text-[clamp(36px,2.6vw+24px,56px)] leading-[1.04] tracking-[-0.04em]">Terms of Service</h1>
        <p className="mt-3 text-[14px] text-muted">Last updated: {UPDATED}</p>
      </div>

      <div className="mt-6 space-y-8 text-[16px] leading-relaxed text-ink-soft">
        <p>
          By using The Dreamers (the &quot;Service&quot;), you agree to these terms. If you do not
          agree, please do not use the Service.
        </p>

        <Section title="Accounts">
          <p>You are responsible for keeping your login credentials secure and for all activity under your account. Provide accurate information when signing up.</p>
        </Section>

        <Section title="Acceptable use">
          <p>Don&apos;t abuse, disrupt, or attempt to gain unauthorized access to the Service or other users&apos; data. Don&apos;t use automated tools to scrape or overload the site.</p>
        </Section>

        <Section title="Content">
          <p>Coding questions and links are aggregated from a publicly available dataset and point to their original sources (e.g. LeetCode). The Service is provided for educational and practice purposes.</p>
        </Section>

        <Section title="No warranty">
          <p>The Service is provided &quot;as is&quot; without warranties of any kind. We don&apos;t guarantee that content is complete, accurate, or uninterrupted.</p>
        </Section>

        <Section title="Limitation of liability">
          <p>To the maximum extent permitted by law, we are not liable for any indirect or consequential damages arising from your use of the Service.</p>
        </Section>

        <Section title="Changes">
          <p>We may update these terms from time to time. Continued use after changes means you accept the updated terms.</p>
        </Section>

        <Section title="Contact">
          <p>Questions? Email <a className="link" href="mailto:thedreamersbyjatin@gmail.com">thedreamersbyjatin@gmail.com</a>.</p>
        </Section>
      </div>
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-sans text-[18px] font-medium tracking-normal text-ink">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}
