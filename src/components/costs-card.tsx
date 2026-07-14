import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CostTotals } from "@/lib/logic/costs";
import { formatHuf } from "@/lib/logic/format";

// „Szervizköltségek" (spec §1; S16): current-year and all-time totals from
// events that have a cost.
export function CostsCard({ totals, year }: { totals: CostTotals; year: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Szervizköltségek</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Idén ({year})</p>
          <p className="text-lg font-semibold tabular-nums">
            {formatHuf(totals.currentYear)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Összesen</p>
          <p className="text-lg font-semibold tabular-nums">
            {formatHuf(totals.allTime)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
