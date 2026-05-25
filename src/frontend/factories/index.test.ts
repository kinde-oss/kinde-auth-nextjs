import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  transformReactAuthStateToNextState,
  constructKindeClientState,
} from "./index";
import type { KindeContextProps } from "@kinde-oss/kinde-auth-react";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@kinde/jwt-decoder", () => ({
  jwtDecoder: vi.fn(),
}));

vi.mock("../../utils/generateUserObject", () => ({
  generateUserObject: vi.fn(() => ({
    id: "user_01",
    email: "jane@example.com",
    given_name: "Jane",
    family_name: "Doe",
    picture: null,
    username: null,
    phone_number: null,
  })),
}));

import { jwtDecoder } from "@kinde/jwt-decoder";
import { generateUserObject } from "../../utils/generateUserObject";

const mockJwtDecoder = vi.mocked(jwtDecoder);
const mockGenerateUserObject = vi.mocked(generateUserObject);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DECODED_ACCESS_TOKEN = {
  permissions: ["read:data"],
  org_code: "org_01",
  org_name: "Acme",
  feature_flags: { dark_mode: { v: true, t: "b" } },
  organization_properties: {},
};

const DECODED_ID_TOKEN = {
  sub: "user_01",
  email: "jane@example.com",
  given_name: "Jane",
  family_name: "Doe",
  picture: null,
  org_codes: ["org_01"],
  organizations: [],
  user_properties: {},
};

/**
 * Builds a minimal KindeContextProps-shaped object for testing.
 * Only the fields consumed by transformReactAuthStateToNextState are needed.
 */
const makeReactAuth = (overrides: {
  isLoading?: boolean;
  isAuthenticated?: boolean;
  accessToken?: string | undefined;
  idToken?: string | undefined;
}): KindeContextProps => {
  const {
    isLoading = false,
    isAuthenticated = false,
    accessToken = undefined,
    idToken = undefined,
  } = overrides;

  return {
    isLoading,
    isAuthenticated,
    getAccessToken: async () => accessToken,
    getIdToken: async () => idToken,
    // remaining KindeContextProps methods — not used by the transform
    user: undefined,
    error: undefined,
    login: async () => {},
    logout: async () => {},
    register: async () => {},
    getToken: async () => undefined,
    getClaims: async () => null,
    getClaim: async () => null,
    getUserProfile: async () => null,
    getPermission: async () => ({ isGranted: false, orgCode: null }),
    getPermissions: async () => ({ permissions: [], orgCode: null }),
    getRoles: async () => [],
    getOrganization: async () => null,
    getCurrentOrganization: async () => null,
    getUserOrganizations: async () => null,
    getFlag: async () => null,
    generatePortalUrl: async () => ({ url: new URL("https://example.com") }),
    refreshToken: async () => ({ success: false, error: "no-op" }),
  } as unknown as KindeContextProps;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("transformReactAuthStateToNextState — isLoading correctness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: jwtDecoder returns null (no tokens decoded)
    mockJwtDecoder.mockReturnValue(null);
  });

  // ── Scenario 1: React SDK still loading ──────────────────────────────────
  it("returns isLoading true when reactAuthState.isLoading is true", async () => {
    const reactAuth = makeReactAuth({
      isLoading: true,
      isAuthenticated: false,
    });

    const result = await transformReactAuthStateToNextState(reactAuth);

    expect(result.isLoading).toBe(true);
    expect(result.user).toBeNull();
    expect(result.isAuthenticated).toBe(false);
  });

  // ── Scenario 2: THE BUG — isAuthenticated true but tokens not decoded yet ─
  // React SDK says "done and authenticated" but storage reads returned nothing.
  // The guard: isLoading || (isAuthenticated && user === null) keeps it true.
  it("returns isLoading true when isAuthenticated is true but tokens are not yet decoded", async () => {
    // getAccessToken / getIdToken return undefined (tokens missing from storage)
    // jwtDecoder returns null (nothing to decode)
    const reactAuth = makeReactAuth({
      isLoading: false,
      isAuthenticated: true,
      accessToken: undefined,
      idToken: undefined,
    });

    const result = await transformReactAuthStateToNextState(reactAuth);

    // Guard fires: isAuthenticated=true but user=null → stay loading
    expect(result.isLoading).toBe(true);
    expect(result.user).toBeNull();
  });

  // ── Scenario 3: Genuinely unauthenticated ────────────────────────────────
  // React SDK done, not authenticated, no tokens → isLoading false immediately.
  it("returns isLoading false when not authenticated and no tokens (logged-out state)", async () => {
    const reactAuth = makeReactAuth({
      isLoading: false,
      isAuthenticated: false,
      accessToken: undefined,
      idToken: undefined,
    });

    const result = await transformReactAuthStateToNextState(reactAuth);

    // Guard does NOT fire: isAuthenticated=false → correctly unauthenticated
    expect(result.isLoading).toBe(false);
    expect(result.user).toBeNull();
    expect(result.isAuthenticated).toBe(false);
  });

  // ── Scenario 4: Fully authenticated and tokens decoded ───────────────────
  it("returns isLoading false with user when authenticated and tokens decoded", async () => {
    mockJwtDecoder
      .mockReturnValueOnce(DECODED_ACCESS_TOKEN) // first call → accessToken
      .mockReturnValueOnce(DECODED_ID_TOKEN); // second call → idToken

    const reactAuth = makeReactAuth({
      isLoading: false,
      isAuthenticated: true,
      accessToken: "encoded.access.token",
      idToken: "encoded.id.token",
    });

    const result = await transformReactAuthStateToNextState(reactAuth);

    // Guard does NOT fire: isAuthenticated=true and user is populated
    expect(result.isLoading).toBe(false);
    expect(result.user).not.toBeNull();
    expect(result.user?.id).toBe("user_01");
    expect(result.isAuthenticated).toBe(false); // always false in transform — constructKindeClientState derives it
  });

  // ── Scenario 5: isLoading true always wins ───────────────────────────────
  it("returns isLoading true when both isLoading and isAuthenticated are true", async () => {
    mockJwtDecoder
      .mockReturnValueOnce(DECODED_ACCESS_TOKEN)
      .mockReturnValueOnce(DECODED_ID_TOKEN);

    const reactAuth = makeReactAuth({
      isLoading: true,
      isAuthenticated: true,
      accessToken: "encoded.access.token",
      idToken: "encoded.id.token",
    });

    const result = await transformReactAuthStateToNextState(reactAuth);

    expect(result.isLoading).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// constructKindeClientState — isAuthenticated derived from !!user
// ---------------------------------------------------------------------------

describe("constructKindeClientState — isAuthenticated derivation", () => {
  it("sets isAuthenticated false when user is null", () => {
    const state = {
      isLoading: false,
      isAuthenticated: false,
      user: null,
      accessToken: null,
      accessTokenEncoded: null,
      idToken: null,
      idTokenRaw: null,
      error: null,
      featureFlags: {},
      organization: null,
      permissions: null,
      userOrganizations: null,
    };

    const result = constructKindeClientState(state as any);
    expect(result.isAuthenticated).toBe(false);
  });

  it("sets isAuthenticated true when user is present", () => {
    const state = {
      isLoading: false,
      isAuthenticated: false, // hardcoded false in transform, overridden here
      user: { id: "user_01", email: "jane@example.com" },
      accessToken: null,
      accessTokenEncoded: null,
      idToken: null,
      idTokenRaw: null,
      error: null,
      featureFlags: {},
      organization: null,
      permissions: null,
      userOrganizations: null,
    };

    const result = constructKindeClientState(state as any);
    expect(result.isAuthenticated).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Provider path vs Providerless path — isLoading sources are independent
// ---------------------------------------------------------------------------

describe("providerless path — constructKindeClientState receives KindeNextClientState directly", () => {
  // useProviderlessKindeAuth calls constructKindeClientState(getFetchedState())
  // where getFetchedState() comes from useSessionSync, not from the React SDK.
  // This path is NOT affected by the transform fix at all.
  it("respects isLoading from KindeNextClientState in providerless mode", () => {
    const loadingState = {
      isLoading: true,
      isAuthenticated: false,
      user: null,
      accessToken: null,
      accessTokenEncoded: null,
      idToken: null,
      idTokenRaw: null,
      error: null,
      featureFlags: {},
      organization: null,
      permissions: null,
      userOrganizations: null,
    };

    const result = constructKindeClientState(loadingState as any);
    expect(result.isLoading).toBe(true);
    expect(result.isAuthenticated).toBe(false);
  });

  it("resolves correctly when providerless state has user", () => {
    const resolvedState = {
      isLoading: false,
      isAuthenticated: true,
      user: { id: "user_01", email: "jane@example.com" },
      accessToken: null,
      accessTokenEncoded: null,
      idToken: null,
      idTokenRaw: null,
      error: null,
      featureFlags: {},
      organization: null,
      permissions: null,
      userOrganizations: null,
    };

    const result = constructKindeClientState(resolvedState as any);
    expect(result.isLoading).toBe(false);
    expect(result.isAuthenticated).toBe(true);
  });
});
