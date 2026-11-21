/**
 * Kinde application parameters that login/register are allowed to copy from
 * the incoming request onto the authorization URL.
 *
 * Protocol parameters (code_challenge, response_mode, prompt, redirect_uri,
 * client_id, …) are owned by the SDK / authorization server and must not be
 * taken from attacker-controlled query strings.
 */
export const ALLOWED_AUTH_URL_PARAMS = [
  "org_code",
  "org_name",
  "is_create_org",
  "login_hint",
  "connection_id",
  "lang",
  "start_page",
  "invitation_code",
  "is_invitation",
  "has_success_page",
  "workflow_deployment_id",
  "supports_reauth",
  "plan_interest",
  "pricing_table_key",
  "pages_mode",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

const allowedAuthUrlParams = new Set<string>(ALLOWED_AUTH_URL_PARAMS);

const isScalarParamValue = (
  value: unknown,
): value is string | number | boolean =>
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean";

/**
 * Return only allowlisted authorization parameters from a query string or
 * parsed object (e.g. decoded reauth_state).
 */
export function filterAuthUrlParams(params: unknown): Record<string, string> {
  if (params == null) {
    return {};
  }

  let entries: [string, unknown][];
  if (params instanceof URLSearchParams) {
    entries = Array.from(params.entries());
  } else if (typeof params === "object" && !Array.isArray(params)) {
    entries = Object.entries(params);
  } else {
    return {};
  }

  const filtered: Record<string, string> = {};
  for (const [key, value] of entries) {
    if (!allowedAuthUrlParams.has(key) || !isScalarParamValue(value)) {
      continue;
    }
    const stringValue = String(value);
    if (stringValue === "") {
      continue;
    }
    filtered[key] = stringValue;
  }
  return filtered;
}
