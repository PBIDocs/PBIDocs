interface FaqItem {
  question: string;
  answer: string;
}

export function Faq({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-10 border-t border-fd-border pt-8">
      <h2 className="mb-4 text-xl font-semibold">FAQ</h2>
      <div className="flex flex-col divide-y divide-fd-border">
        {items.map((item) => (
          <details key={item.question} className="group py-3">
            <summary className="cursor-pointer list-none font-medium marker:content-none">
              <span className="inline-flex items-start gap-2">
                <span className="mt-0.5 text-fd-primary transition-transform group-open:rotate-45">+</span>
                {item.question}
              </span>
            </summary>
            <p className="mt-2 pl-5 text-fd-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
