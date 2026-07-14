import { HOW_IT_WORKS_STEPS } from "@/constants/landing";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-slate-50 py-24 lg:py-32"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
            How it works
          </p>
          <h2
            id="how-heading"
            className="font-display mt-4 text-4xl text-slate-900 sm:text-5xl"
          >
            Up and running in three steps
          </h2>
        </FadeIn>

        <StaggerContainer className="mt-16 grid gap-8 lg:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((item, i) => (
            <StaggerItem key={item.step}>
              <div className="relative">
                {i < HOW_IT_WORKS_STEPS.length - 1 && (
                  <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-gradient-to-r from-red-300 to-transparent lg:block" />
                )}
                <article className="relative rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <span className="inline-block rounded-full bg-gradient-to-r from-red-600 to-blue-700 px-4 py-1 text-sm font-bold text-white">
                    {item.step}
                  </span>
                  <h3 className="mt-6 text-xl font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </article>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
