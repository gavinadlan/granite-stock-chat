// Environment is read and validated once per cold start. A missing required
// variable fails the Lambda init instead of surfacing later as a confusing error.
import { z } from 'zod';

// Secrets are injected only into the functions that use them, so they are optional
// here; the code that needs one returns 503 when it is absent.
const optionalSecret = z
  .string()
  .optional()
  .transform((v) => v || undefined);

const EnvSchema = z.object({
  STAGE: z.string().min(1),
  ALLOWED_ORIGINS: z
    .string()
    .min(1)
    .transform((v) => v.split(',').map((o) => o.trim()).filter(Boolean)),
  LLM_MODEL: z.string().min(1).default('ibm-granite/granite-3.3-8b-instruct'),
  REPLICATE_API_KEY: optionalSecret,
  NEWS_API_KEY: optionalSecret,
});

export type Config = z.infer<typeof EnvSchema>;

export function loadConfig(env: NodeJS.ProcessEnv): Config {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    // Name the variables only; never echo their values.
    const keys = parsed.error.issues.map((i) => i.path.join('.')).join(', ');
    throw new Error(`Invalid environment configuration: ${keys}`);
  }
  return parsed.data;
}

export const config = loadConfig(process.env);
