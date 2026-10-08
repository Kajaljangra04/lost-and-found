import { FaChevronDown } from "react-icons/fa";
import { useState } from "react";

interface FaqItem {
  id?: string;
  question: string;
  answer: string;
}

const Faq = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  //   const { data: faqsData, isLoading } = useGetFaqsQuery({});

  const toggleFaq = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const defaultFaqs: FaqItem[] = [
    {
      question: "How do I report a lost item?",
      answer:
        "Simply navigate to the 'Report Lost Item' page, fill out the detailed form with information about your lost item, including description, location, and date. Our system will help track and notify you when a matching item is found.",
    },
    {
      question: "How can I search for my lost item?",
      answer:
        "Use our advanced search feature to look for items by category, location, date, or keywords. You can filter results to find items that match your lost belongings.",
    },
    {
      question: "What happens when I find an item that might be mine?",
      answer:
        "When you spot an item that could be yours, you can submit a claim request with verification details. Our system will help verify ownership before arranging the return.",
    },
    {
      question: "How secure is my personal information?",
      answer:
        "We prioritize the security of your personal information. We use advanced encryption and strict data protection measures to ensure your data is safe and confidential.",
    },
  ];

  const faqs: FaqItem[] = defaultFaqs;

  return (
    <div className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row">
          <div className="flex flex-col text-left lg:basis-1/2">
            <span className="eyebrow mb-4">FAQ</span>
            <h2 className="section-title mb-4">Frequently Asked Questions</h2>
            <p className="text-ink-dim">
              Find answers to common questions about our lost and found
              management system.
            </p>
          </div>

          <ul className="space-y-3 lg:basis-1/2">
            {faqs.map((faq, index) => (
              <li key={index} className="card overflow-hidden">
                <button
                  type="button"
                  className={`flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-semibold transition-colors duration-200 ${
                    expandedIndex === index
                      ? "text-accent"
                      : "text-ink hover:bg-white/[0.03]"
                  }`}
                  onClick={() => toggleFaq(index)}
                  aria-expanded={expandedIndex === index}
                >
                  <span className="flex-1">{faq.question}</span>
                  <FaChevronDown
                    className={`shrink-0 transition-transform duration-300 ${
                      expandedIndex === index
                        ? "rotate-180 text-accent"
                        : "text-ink-mute"
                    }`}
                  />
                </button>
                <div
                  className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${
                    expandedIndex === index ? "max-h-[300px]" : "max-h-0"
                  }`}
                >
                  <div
                    className={`px-5 pb-5 transition-transform duration-500 ${
                      expandedIndex === index
                        ? "translate-y-0"
                        : "-translate-y-4"
                    }`}
                  >
                    <div className="text-sm leading-relaxed text-ink-dim">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Faq;
