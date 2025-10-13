const DISABLED_MESSAGE =
  "Supabase integration is disabled for the local-only demo build.";

function createDisabledClientProxy() {
  const handler: ProxyHandler<Record<string, unknown>> = {
    get() {
      throw new Error(DISABLED_MESSAGE);
    },
    apply() {
      throw new Error(DISABLED_MESSAGE);
    },
  };

  return new Proxy({}, handler);
}

export const supabaseServerClient = createDisabledClientProxy() as never;
export const supabaseAdminClient = createDisabledClientProxy() as never;

export const DEFAULT_EMAIL_DOMAIN =
  process.env.DEFAULT_EMAIL_DOMAIN || "example.com";
