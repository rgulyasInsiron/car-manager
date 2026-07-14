import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Suggestion } from "@/lib/logic/suggestions";
import { cn } from "@/lib/utils";

import { SEVERITY_LABELS, SEVERITY_STYLES } from "./severity";

// „Következő javasolt szervizek" (spec §3): up to 5 advisory bullets in
// descending urgency, each with a severity chip (dot + label, never color
// alone — same Badge pattern as the status cards).
export function SuggestionsCard({ suggestions }: { suggestions: Suggestion[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Következő javasolt szervizek</CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nincs elérhető javaslat — érdemes a gyártó által ajánlott
            ütemezést követni.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {suggestions.map((suggestion) => {
              const styles = SEVERITY_STYLES[suggestion.severity];
              return (
                <li
                  key={suggestion.type}
                  className="flex items-start gap-2.5 text-sm"
                >
                  <Badge
                    variant="secondary"
                    className={cn("shrink-0", styles.softBg, styles.text)}
                  >
                    <span
                      className={cn("size-1.5 rounded-full", styles.dot)}
                      aria-hidden
                    />
                    {SEVERITY_LABELS[suggestion.severity]}
                  </Badge>
                  <span>{suggestion.text}</span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
