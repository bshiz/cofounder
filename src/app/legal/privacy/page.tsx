export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Privacy Policy</h1>
      <p className="text-sm text-[#4a4a4a] mb-10">Last updated: June 2026</p>

      <p className="text-sm text-[#4a4a4a] leading-relaxed mb-10">
        Your privacy matters to us. This policy explains what information Kindred collects, how we use it, and what choices you have.
      </p>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">What we collect</h2>
        <p className="text-sm text-[#4a4a4a] leading-relaxed mb-3">
          When you sign in with Google, we receive your name, email address, and profile photo. We store this to create your Kindred profile.
        </p>
        <p className="text-sm text-[#4a4a4a] leading-relaxed mb-3">
          When you post a concept, we store the content you provide: title, description, collaborator description, category, prototype URL or HTML file, and optional thumbnail image.
        </p>
        <p className="text-sm text-[#4a4a4a] leading-relaxed">
          When you express interest in a concept, we store the reason you provide and notify the concept owner by email.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">How we use it</h2>
        <p className="text-sm text-[#4a4a4a] leading-relaxed mb-3">
          We use your information only to operate Kindred — to show your profile on your concepts, to notify concept owners when someone expresses interest, and to let you manage your own content.
        </p>
        <p className="text-sm text-[#4a4a4a] leading-relaxed">
          We do not sell your data. We do not use it for advertising. We do not share it with third parties except as necessary to operate the service (our infrastructure providers: Supabase, Vercel, and Resend).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">Email</h2>
        <p className="text-sm text-[#4a4a4a] leading-relaxed">
          When someone expresses interest in your concept, we send you a notification email from hello@findkindred.co. We do not send marketing emails.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">Your data</h2>
        <p className="text-sm text-[#4a4a4a] leading-relaxed">
          You can delete any concept you&apos;ve posted at any time. If you&apos;d like your account and associated data removed, email us at{' '}
          <a href="mailto:hello@findkindred.co" className="text-brand hover:underline">hello@findkindred.co</a>{' '}
          and we&apos;ll take care of it.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">Contact</h2>
        <p className="text-sm text-[#4a4a4a] leading-relaxed">
          Questions about this policy? Email{' '}
          <a href="mailto:hello@findkindred.co" className="text-brand hover:underline">hello@findkindred.co</a>.
        </p>
      </section>
    </main>
  )
}
