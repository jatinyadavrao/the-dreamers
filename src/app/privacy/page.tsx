import { Reveal } from "@/components/ui/reveal";

export const metadata = { title: "Privacy Policy · The Dreamers" };

const UPDATED = "September 15, 2026";

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <Reveal>
        <h1 className="font-display text-4xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Last updated: {UPDATED}</p>
      </Reveal>

      <div className="prose-invert mt-8 space-y-6 text-[var(--muted)] leading-relaxed">
        <p>
          The Dreamers (&quot;we&quot;, &quot;us&quot;) provides a platform for practicing
          company-wise coding-interview questions. This policy explains what we collect and how we use it.
        </p>

        <Section title="Information we collect">
          <ul className="list-disc space-y-1 pl-5">
            <li><b>Account info:</b> your email address and name.</li>
            <li><b>Password:</b> stored only as a secure one-way hash (we never see your actual password).</li>
            <li><b>Google Sign-In:</b> if you sign in with Google, we receive your email, name, and profile picture from Google.</li>
            <li><b>Usage data:</b> the questions you mark solved, bookmark, or add notes to.</li>
            <li><b>Basic analytics:</b> anonymous page-view and visit statistics.</li>
          </ul>
        </Section>

        <Section title="How we use it">
          <p>To create and secure your account, save your progress across the site, and improve the product. We do not sell your personal data.</p>
        </Section>

        <Section title="Cookies">
          <p>We use a single secure, HTTP-only session cookie to keep you signed in. No third-party advertising cookies are used.</p>
        </Section>

        <Section title="Data storage & security">
          <p>Your data is stored in MongoDB Atlas. Passwords are hashed with bcrypt and sessions are signed. We take reasonable measures to protect your information.</p>
        </Section>

        <Section title="Third-party services">
          <p>We use Google (authentication), MongoDB Atlas (database), Vercel (hosting &amp; analytics), and email delivery for verification codes. Question data is sourced from a public, open dataset.</p>
        </Section>

        <Section title="Your choices">
          <p>You can request deletion of your account and associated data at any time by contacting us.</p>
        </Section>

        <Section title="Contact">
          <p>Questions about this policy? Email <a className="text-dream-300 hover:underline" href="mailto:thedreamersbyjatin@gmail.com">thedreamersbyjatin@gmail.com</a>.</p>
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
