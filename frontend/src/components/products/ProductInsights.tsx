import { AnimatedNumber } from "@/components/landing/DashboardPreview/AnimatedNumber";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/products";
import { isLowStock } from "@/types/products";
import { motion } from "framer-motion";

type ProductInsightsProps = {
  products: Product[];
  filteredCount: number;
};

export function ProductInsights({
  products,
  filteredCount,
}: ProductInsightsProps) {
  const active = products.filter((p) => p.isActive);
  const low = active.filter(isLowStock).length;
  const out = active.filter((p) => p.stockQty <= 0).length;
  const exempt = active.filter((p) => !p.vatApplicable).length;

  const items = [
    {
      label: "In catalog",
      value: active.length,
      hint: `${filteredCount} showing`,
      tone: "neutral" as const,
    },
    {
      label: "Low stock",
      value: low,
      hint: "At or below reorder",
      tone: low > 0 ? ("warn" as const) : ("neutral" as const),
    },
    {
      label: "Out of stock",
      value: out,
      hint: "Needs restock",
      tone: out > 0 ? ("danger" as const) : ("neutral" as const),
    },
    {
      label: "VAT exempt",
      value: exempt,
      hint: "Nepal-exempt goods",
      tone: "neutral" as const,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, i) => (
        <motion.article
          key={item.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + i * 0.06 }}
        >
          <p className="text-sm text-slate-500">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            <AnimatedNumber value={item.value} />
          </p>
          <p
            className={cn(
              "mt-2 text-sm font-medium",
              item.tone === "warn" && "text-amber-600",
              item.tone === "danger" && "text-red-600",
              item.tone === "neutral" && "text-slate-500",
            )}
          >
            {item.hint}
          </p>
        </motion.article>
      ))}
    </div>
  );
}
