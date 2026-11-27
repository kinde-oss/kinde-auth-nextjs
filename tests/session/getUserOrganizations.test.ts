import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ID token payload the mocked SDK client reads claims from.
const h = vi.hoisted(() => ({ idToken: {} as Record<string, unknown> }));

vi.mock("../../src/config/index", () => ({
  config: { isDebugMode: false },
}));

vi.mock("../../src/session/sessionManager", () => ({
  sessionManager: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../src/session/kindeServerClient", () => ({
  kindeClient: {
    getUserOrganizations: async () => ({
      orgCodes: (h.idToken.org_codes as string[]) ?? [],
    }),
    getClaimValue: async (_s: unknown, claim: string) =>
      h.idToken[claim] ?? null,
  },
}));

import { getUserOrganizationsFactory } from "../../src/session/getUserOrganizations";

const WARNING =
  "Warning: organizations are not in ID token so names are missing.";

describe("getUserOrganizations", () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it("returns names without warning when organizations are in the ID token", async () => {
    h.idToken = {
      org_codes: ["org_1"],
      organizations: [{ id: "org_1", name: "Acme" }],
    };

    expect(await getUserOrganizationsFactory()()).toEqual({
      orgCodes: ["org_1"],
      orgs: [{ code: "org_1", name: "Acme" }],
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it("does not warn when hasura organizations are in the ID token", async () => {
    h.idToken = {
      "x-hasura-org-codes": ["org_1"],
      "x-hasura-organizations": [{ id: "org_1", name: "Acme" }],
    };

    expect(await getUserOrganizationsFactory()()).toEqual({
      orgCodes: ["org_1"],
      orgs: [{ code: "org_1", name: "Acme" }],
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it("warns when the user has org codes but organizations are not in the ID token", async () => {
    h.idToken = { org_codes: ["org_1"] };

    expect(await getUserOrganizationsFactory()()).toEqual({
      orgCodes: ["org_1"],
      orgs: [],
    });
    expect(warn).toHaveBeenCalledWith(WARNING);
  });

  it("does not warn when the user belongs to no organizations", async () => {
    h.idToken = {};

    expect(await getUserOrganizationsFactory()()).toEqual({
      orgCodes: [],
      orgs: [],
    });
    expect(warn).not.toHaveBeenCalled();
  });
});
