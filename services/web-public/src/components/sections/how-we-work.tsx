"use client";

import { howWeWork } from "@/content/site";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export function HowWeWorkSection() {
  return (
    <section className="section-y bg-[#040A15] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
      
      <div className="container-naya relative z-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">

          {/* Left: heading */}
          <div className="lg:pr-8">
            <p className="eyebrow mb-4 text-blue-500">Delivery Depth</p>
            <h2 className="text-4xl sm:text-5xl mb-6 font-display font-black text-white tracking-tight">
              Our execution <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">framework</span>
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-slate-400 font-medium">
              We prefer scoped precision over vague promises. Before writing a single line of code or launching any campaign, we architect exactly what done looks like.
            </p>
            
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <p className="mb-6 text-base font-bold text-white relative z-10 tracking-tight">
                Every delivery leaves you with systems that:
              </p>
              <ul className="space-y-4 relative z-10">
                {["Work flawlessly from day one", "Function independently without constant oversight", "Adapt and improve over time", "Compound into massive enterprise value"].map((item) => (
                  <li key={item} className="flex items-start gap-4 text-sm font-semibold text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Steps Progression */}
          <div className="relative mt-8 lg:mt-0">
            <div className="absolute left-[27px] top-4 bottom-6 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/20 to-transparent" />
            
            <div className="space-y-12">
              {howWeWork.map((step, i) => (
                <motion.div 
                  key={step.step} 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
                  className="relative flex gap-8 group"
                >
                  <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#040A15] border border-white/20 text-xl font-black text-white shadow-xl transition-all duration-300 group-hover:border-blue-500 group-hover:text-blue-400 group-hover:scale-110">
                    {step.step}
                  </div>
                  <div className="pt-2 pb-2">
                    <h3 className="mb-3 text-xl font-bold text-white tracking-tight group-hover:text-blue-200 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-base leading-relaxed text-slate-400 font-medium">
                      {step.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
