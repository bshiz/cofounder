export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1
          className="text-4xl font-bold text-[#1a1a1a] mb-8 leading-tight"
        >
          What is Kindred?
        </h1>
        <p className="text-[#4a4a4a] leading-relaxed text-base">
          You&apos;re building things with AI, HTML presentations, prototypes, small tools like an
          expense tracker or a calculator. Right now, sharing them means sending a file through Slack
          or email. It works once. Then you update it, and you&apos;re sending a new file, and whoever
          had the old one is stuck on a stale version.
        </p>
        <p className="text-[#4a4a4a] leading-relaxed text-base mt-5">
          Kindred gives what you build a permanent home. Upload it once, get a link, and update it
          any time. The link never changes, so everyone you&apos;ve shared it with always sees the
          current version.
        </p>
        <p className="text-[#4a4a4a] leading-relaxed text-base mt-5">
          You don&apos;t need to be a developer. If you can build something with AI, you can share
          it with Kindred.
        </p>
      </main>
    </div>
  )
}
