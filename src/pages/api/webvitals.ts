import type { APIRoute } from "astro";
import { randomUUID } from "node:crypto";
import { insertVital } from "../../lib/db";

interface WebVitalMetric {
  name?: string;
  value?: number;
  delta?: number;
  rating?: string;
  navigationType?: string;
}

export const POST: APIRoute = async ({ request }) => {
  let metric: WebVitalMetric;
  try {
    metric = JSON.parse(await request.text());
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!metric.name || typeof metric.value !== "number") {
    return new Response("Missing metric name or value", { status: 400 });
  }

  insertVital.run(
    randomUUID(),
    metric.name,
    metric.value,
    metric.delta ?? 0,
    metric.rating ?? null,
    metric.navigationType ?? null,
  );

  return new Response(null, { status: 204 });
};
