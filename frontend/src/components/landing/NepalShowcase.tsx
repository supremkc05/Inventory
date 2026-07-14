import { NEPAL_HIGHLIGHTS } from "@/constants/landing";
import { NepalMap } from "@/components/landing/NepalMap/index";
import { FadeIn } from "@/components/ui";
import { motion } from "framer-motion";

const META = [
  { label: "Provinces", value: "7" },
  { label: "Languages", value: "Nepali" },
  { label: "FY format", value: "2082/83" },
] as const;

export function NepalShowcase() {
  return (
    <section
      id="nepal"
      className="relative overflow-hidden bg-white py-24 lg:py-32"
      aria-labelledby="nepal-heading"
    >
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <FadeIn direction="right">
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
              Nepal-first
            </p>
            <h2
              id="nepal-heading"
              className="font-display mt-4 text-4xl text-slate-900 sm:text-5xl"
            >
              Built on the map of <span className="text-red-600">your</span>{" "}
              market
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Generic inventory tools weren&apos;t made for Nepali VAT rules,
              fiscal years, or the way udhaaro works on the ground. We were.
            </p>

            <div className="mt-10 space-y-8">
              {NEPAL_HIGHLIGHTS.map((item, i) => (
                <motion.div
                  key={item.title}
                  className="flex gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {item.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </FadeIn>

          <FadeIn direction="left" delay={0.2}>
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 p-4 shadow-sm sm:p-8">
              <NepalMap
                className="mx-auto h-[440px] w-full max-w-md"
                showLabel={false}
                showDots
              />

              <motion.div
                className="mt-6 grid grid-cols-3 gap-4 text-center"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                {META.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-200 bg-white py-3 shadow-sm"
                  >
                    <p className="text-lg font-bold text-slate-900">{item.value}</p>
                    <p className="text-xs text-slate-500">{item.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
