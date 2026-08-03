import FaqAccordion from '@/app/components/FaqAccordion'

function CodeBlock({ children }: { children: string }) {
  return (
    <code
      className="inline-block bg-gray-100 text-[#1a1a1a] rounded-lg px-3 py-2 text-sm break-all"
      style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
    >
      {children}
    </code>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="text-sm font-bold text-brand shrink-0 mt-0.5">{n}.</span>
      <p className="text-base text-[#4a4a4a] leading-relaxed">{children}</p>
    </div>
  )
}

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">

      <h1 className="text-4xl font-bold text-[#1a1a1a] mb-14 leading-tight">
        How Kindred works
      </h1>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">Workflow</h2>
        <div className="flex flex-col gap-6">
          <Step n={1}>
            <strong className="text-[#1a1a1a]">Upload your project.</strong> Build something with AI, like a prototype, a presentation, or a small tool. Upload the HTML file and Kindred gives you a permanent link.
          </Step>
          <Step n={2}>
            <strong className="text-[#1a1a1a]">Share it.</strong> Send the link anywhere: Slack, email, a text message. Anyone with the link can open it, no account needed on their end.
          </Step>
          <Step n={3}>
            <strong className="text-[#1a1a1a]">Update it anytime.</strong> Made a change? Ask Claude to push the update for you, no re-uploading required. The link stays exactly the same, only what&apos;s behind it changes.
          </Step>
        </div>
      </section>


      {/* Section 3: Connect Claude (MCP) */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">Connect Claude (MCP)</h2>
        <p className="text-base text-[#4a4a4a] leading-relaxed mb-8">
          This is what makes updating effortless. Once connected, you can ask Claude to update your
          Kindred project directly from a conversation, no downloading, no re-uploading, no
          switching tabs.
        </p>

        <div className="flex flex-col gap-5">

          {/* Claude Chat */}
          <div className="rounded-2xl border border-gray-200 p-6">
            <h3 className="text-base font-bold text-[#1a1a1a] mb-5">Connect in Claude Chat</h3>
            <div className="flex flex-col gap-4">
              <Step n={1}>Go to Settings → Connectors.</Step>
              <Step n={2}>Click &ldquo;Add custom connector.&rdquo;</Step>
              <Step n={3}>
                Paste this URL:{' '}
                <span className="block mt-2">
                  <CodeBlock>https://findkindred.co/api/mcp</CodeBlock>
                </span>
              </Step>
              <Step n={4}>Sign in with Google when prompted.</Step>
              <Step n={5}>
                In any chat, ask Claude: &ldquo;Push this to my Kindred project called
                [name].&rdquo;
              </Step>
            </div>
          </div>

          {/* Claude Code */}
          <div className="rounded-2xl border border-gray-200 p-6">
            <h3 className="text-base font-bold text-[#1a1a1a] mb-5">Connect in Terminal</h3>
            <div className="flex flex-col gap-4">
              <Step n={1}>
                In your terminal, run:{' '}
                <span className="block mt-2">
                  <CodeBlock>claude mcp add --transport http kindred https://findkindred.co/api/mcp</CodeBlock>
                </span>
              </Step>
              <Step n={2}>
                Start (or restart) Claude Code, then run <CodeBlock>/mcp</CodeBlock> and select
                &ldquo;kindred&rdquo; to sign in with Google.
              </Step>
              <Step n={3}>
                Once connected, just ask Claude something like: &ldquo;Push this to my Kindred
                project called [name].&rdquo;
              </Step>
            </div>
          </div>

        </div>
      </section>


      {/* Section 5: FAQ */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-8">Good to know</h2>
        <FaqAccordion />
      </section>

    </main>
  )
}
