import { FEATURES } from "@/constants/landing";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui";
import { FeatureIcon } from "./FeatureIcon";

export function Features() {
  return (
    <section
      id="features"
      className="relative bg-slate-50 py-24 lg:py-32"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-600">
            Features
          </p>
          <h2
            id="features-heading"
            className="font-display mt-4 text-4xl text-slate-900 sm:text-5xl"
          >
            Everything your dokan needs
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            From paper khata to digital records — designed for how Nepali shops
            actually operate.
          </p>
        </FadeIn>

        <StaggerContainer className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <StaggerItem key={feature.title}>
              <article className="group h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:border-red-200 hover:shadow-md hover:shadow-red-100/50">
                <FeatureIcon name={feature.icon} />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {feature.description}
                </p>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
