'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'Do I need to know how to code?',
    a: 'No. If you can describe what you want changed, Claude can make the edit and push it to your existing link.',
  },
  {
    q: 'What happens to my link when I update the project?',
    a: 'The link stays exactly the same. Only the content behind it updates.',
  },
  {
    q: 'Can I use this with Claude Chat, not just Claude Code?',
    a: "Yes. Both work the same way once you've connected Kindred.",
  },
  {
    q: 'Is there a cost?',
    a: 'Kindred is free to use right now.',
  },
]

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="max-w-2xl mx-auto border-t border-gray-200">
      {faqs.map((faq, i) => (
        <div key={i} className="border-b border-gray-200">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between py-5 text-left gap-6"
          >
            <span className="font-semibold text-[#1a1a1a] text-lg">{faq.q}</span>
            <span className="text-[#4a4a4a] shrink-0 text-xl leading-none select-none">
              {open === i ? '−' : '+'}
            </span>
          </button>
          {open === i && (
            <p className="pb-5 text-base text-[#4a4a4a] leading-relaxed">{faq.a}</p>
          )}
        </div>
      ))}
    </div>
  )
}
