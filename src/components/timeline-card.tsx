import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ServiceEvent } from "@/lib/data/types";
import { formatDateHu, formatHuf, formatKm } from "@/lib/logic/format";

import { EVENT_ICONS } from "./event-icon";

// „Legutóbbi események" (spec §1; S3): all events reverse-chronologically,
// scrollable within the card; honest empty state for a car without history.
export function TimelineCard({ events }: { events: ServiceEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Legutóbbi események</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ehhez az autóhoz még nincs rögzített esemény.
          </p>
        ) : (
          <ul className="-mr-2 flex max-h-96 flex-col overflow-y-auto pr-2">
            {events.map((event) => {
              const Icon = EVENT_ICONS[event.type];
              return (
                <li
                  key={event.id}
                  className="flex items-center gap-3 border-b py-3 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="size-4 text-muted-foreground" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {formatKm(event.odometerKm)} · {formatDateHu(event.date)}
                    </p>
                  </div>
                  {event.costHuf !== undefined && (
                    <p className="shrink-0 text-sm font-medium tabular-nums">
                      {formatHuf(event.costHuf)}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
