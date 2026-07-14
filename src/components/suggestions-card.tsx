import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Suggestion } from "@/lib/logic/suggestions";
import { cn } from "@/lib/utils";

import { SEVERITY_STYLES } from "./severity";

// „Következő javasolt szervizek" (spec §3): up to 5 advisory bullets in
// descending urgency, each with its severity dot.
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
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.type}
                className="flex items-start gap-2.5 text-sm"
              >
                <span
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    SEVERITY_STYLES[suggestion.severity].dot,
                  )}
                  aria-hidden
                />
                <span>{suggestion.text}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
