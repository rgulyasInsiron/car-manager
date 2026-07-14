// Event-type → lucide icon mapping per DESIGN-GUIDELINE.md; used consistently
// everywhere an event type is shown (timeline, cards, forms).

import {
  Cog,
  Disc,
  Droplets,
  Fan,
  FlaskConical,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { EventType } from "@/lib/data/types";

export const EVENT_ICONS: Record<EventType, LucideIcon> = {
  olajcsere: Droplets,
  szurocsere: Fan,
  fekbetet: Disc,
  fekfolyadek: FlaskConical,
  muszaki_vizsga: ShieldCheck,
  vezerles: Cog,
  egyeb: Wrench,
};
