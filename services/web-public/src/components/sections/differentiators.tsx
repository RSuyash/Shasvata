"use client";

import { Link2, CheckSquare, Shield, TrendingUp } from "lucide-react";
import { differentiators } from "@/content/site";
import { motion } from "framer-motion";

const iconMap = { Link2, CheckSquare, Shield, TrendingUp };

export function DifferentiatorsSection() {
  return (
    <section className="section-y relative overflow-hidden bg-white">
      <div className="container-naya relative z-10">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <p className="eyebrow mb-4 text-blue-600">Our Moat</p>
          <h2 className="text-4xl sm:text-5xl mb-6 font-display font-black text-slate-950 tracking-tight">
            Why Naya feels <br className="sm:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">fundamentally different</span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed font-medium">
            Most service providers sit in one box — marketing, dev, automation, or consulting. 
            The real problem is that scaling businesses rarely need just one box.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {differentiators.map((item, idx) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
                className="group relative overflow-hidden rounded-[2.5rem] bg-slate-50 border border-slate-200/60 p-8 sm:p-10 transition-all duration-500 hover:bg-white hover:border-blue-200 hover:shadow-[0_20px_60px_-15px_rgba(37,99,235,0.15)]"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/50 text-[rgb(var(--naya-blue))] group-hover:-translate-y-1 group-hover:bg-[rgb(var(--naya-blue))] group-hover:text-white transition-all duration-500">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-slate-950 tracking-tight">{item.title}</h3>
                  <p className="text-base leading-relaxed text-slate-600 font-medium">{item.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
