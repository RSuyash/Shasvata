"use client";

import { homepageFaqs } from "@/content/site";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-y relative overflow-hidden bg-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_40%)]" aria-hidden="true" />
      <div className="container-naya relative z-10 max-w-4xl mx-auto">
        <div className="mb-16 text-center">
          <p className="eyebrow mb-4">Common Questions</p>
          <h2 className="text-4xl md:text-5xl mb-6 font-display font-black text-slate-950 tracking-tight">
            Everything you need to know.
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            Practical answers to help you understand our infrastructure before we build together.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {homepageFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className={cn(
                  "rounded-2xl border transition-all duration-300 overflow-hidden",
                  isOpen ? "bg-white border-blue-200 shadow-xl shadow-blue-900/5" : "bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300"
                )}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-6 sm:px-8 flex items-center justify-between gap-6 focus:outline-none"
                >
                  <span className={cn(
                    "text-lg font-bold leading-snug transition-colors",
                    isOpen ? "text-blue-950" : "text-slate-800"
                  )}>
                    {faq.question}
                  </span>
                  <div className={cn(
                    "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300",
                    isOpen ? "bg-blue-600 text-white rotate-45 shadow-md shadow-blue-500/20" : "bg-slate-100 text-slate-500"
                  )}>
                    <Plus className="h-5 w-5" />
                  </div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 sm:px-8 pb-8 pt-2 text-slate-600 leading-relaxed font-medium">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}