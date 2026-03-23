import { BullMQOtel } from 'bullmq-otel';

// Singleton — safe to instantiate at module load time because instrumentation.ts
// is the first import in main.ts, so the OTEL SDK is running before this resolves.
export const bullmqTelemetry = new BullMQOtel({
  tracerName: 'bullmq',
  meterName: 'bullmq',
  enableMetrics: true,
});
