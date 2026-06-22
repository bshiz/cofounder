export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Terms of Service</h1>
      <p className="text-sm text-[#4a4a4a] mb-10">Last updated: June 2026</p>

      <p className="text-sm text-[#4a4a4a] leading-relaxed mb-10">
        By using Kindred, you agree to these terms. If you don&apos;t agree, please don&apos;t use the platform.
      </p>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">What Kindred is</h2>
        <p className="text-sm text-[#4a4a4a] leading-relaxed">
          Kindred is a platform for sharing what you&apos;re building and finding collaborators. We help people discover each other — what happens after that connection is made is between you and them. Kindred is not a party to any agreement, partnership, or collaboration that results from using the platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">Your content</h2>
        <p className="text-sm text-[#4a4a4a] leading-relaxed mb-3">
          You own the concepts and content you post. By posting, you give Kindred permission to display that content to other users on the platform.
        </p>
        <p className="text-sm text-[#4a4a4a] leading-relaxed">
          You&apos;re responsible for what you post. Don&apos;t post content that is illegal, harassing, or deceptive. Don&apos;t post concepts or prototypes that belong to someone else without permission.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">Your account</h2>
        <p className="text-sm text-[#4a4a4a] leading-relaxed">
          You need a Google account to use Kindred. You&apos;re responsible for any activity that happens under your account.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">What we can do</h2>
        <p className="text-sm text-[#4a4a4a] leading-relaxed">
          We reserve the right to remove content or accounts that violate these terms or that we determine, at our discretion, are harmful to the community. We&apos;ll try to be reasonable about it.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">Availability</h2>
        <p className="text-sm text-[#4a4a4a] leading-relaxed">
          We provide Kindred as-is. We don&apos;t guarantee it will always be available or error-free. We&apos;re not liable for any losses resulting from your use of the platform or from connections made through it.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">Changes</h2>
        <p className="text-sm text-[#4a4a4a] leading-relaxed">
          We may update these terms as the product evolves. If we make significant changes, we&apos;ll update the date at the top. Continued use of Kindred means you accept the updated terms.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">Contact</h2>
        <p className="text-sm text-[#4a4a4a] leading-relaxed">
          Questions? Email{' '}
          <a href="mailto:hello@findkindred.co" className="text-brand hover:underline">hello@findkindred.co</a>.
        </p>
      </section>
    </main>
  )
}
