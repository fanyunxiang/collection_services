/**
 * Supabase integration is disabled for the local-only demo build.
 * This placeholder client intentionally throws if accessed so that
 * future database work can be re-enabled without changing import paths.
 */
const DISABLED_MESSAGE =
  "Supabase integration is disabled for the local-only demo build.";

export const supabase = new Proxy(
  {},
  {
    get() {
      throw new Error(DISABLED_MESSAGE);
    },
    apply() {
      throw new Error(DISABLED_MESSAGE);
    },
  },
) as never;
