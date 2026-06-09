export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1
          className="text-4xl font-bold text-gray-900 mb-8 leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          What is Cofounder?
        </h1>
        <p className="text-gray-600 leading-relaxed text-base">
          Cofounder is a place for anyone who has started building something and wants to find
          someone to build it with. The prototype is the profile — instead of a resume or a skills
          list, you show what you&apos;re actually working on. A working prototype says more about a
          person than anything else. It shows how they think, what problems they find worth solving,
          and whether they&apos;re the kind of person who actually makes things happen.
        </p>
        <p className="text-gray-600 leading-relaxed text-base mt-5">
          This isn&apos;t just for developers or designers. It&apos;s for anyone with a real idea
          and the initiative to start — whether you built your first prototype with Loveable, Claude,
          or any other tool. Building is no longer a barrier.
        </p>
      </main>
    </div>
  )
}
