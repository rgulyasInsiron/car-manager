import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ItemStatus } from "@/lib/logic/status";
import { cn } from "@/lib/utils";

import { EVENT_ICONS } from "./event-icon";
import { SEVERITY_LABELS, SEVERITY_STYLES } from "./severity";

// One of the dashboard's three status cards (spec §1): type icon + name,
// severity chip (dot + label, never color alone), and the key figure.
export function StatusCard({ item }: { item: ItemStatus }) {
  const styles = SEVERITY_STYLES[item.severity];
  const Icon = EVENT_ICONS[item.type];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" aria-hidden />
          {item.name}
        </CardTitle>
        <CardAction>
          <Badge variant="secondary" className={cn(styles.softBg, styles.text)}>
            <span
              className={cn("size-1.5 rounded-full", styles.dot)}
              aria-hidden
            />
            {SEVERITY_LABELS[item.severity]}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold tabular-nums">{item.detail}</p>
      </CardContent>
    </Card>
  );
}
