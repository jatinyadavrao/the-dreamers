import { Reveal } from "@/components/ui/reveal";

export const metadata = { title: "Terms of Service · The Dreamers" };

const UPDATED = "September 15, 2026";

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <Reveal>
        <h1 className="font-display text-4xl font-bold">Terms of Service</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Last updated: {UPDATED}</p>
      </Reveal>

      <div className="mt-8 space-y-6 text-[var(--muted)] leading-relaxed">
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
          <p>Questions? Email <a className="text-dream-300 hover:underline" href="mailto:thedreamersbyjatin@gmail.com">thedreamersbyjatin@gmail.com</a>.</p>
        </Section>
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}
