import { describe, it, expect, vi, beforeEach } from "vitest";
import { getHeaders } from "./getHeaders";
import { NextRequest } from "next/server";
import { NextApiRequest } from "next";

// Default mock for next/headers
const defaultHeadersMock = vi.fn(() => new Headers({ "x-test": "test-value" }));

vi.mock("next/headers", () => ({
  headers: defaultHeadersMock,
}));

describe("getHeaders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock implementation to default before each test
    defaultHeadersMock.mockImplementation(
      () => new Headers({ "x-test": "test-value" }),
    );
  });

  it("should handle Pages Router request (NextApiRequest)", async () => {
    const mockReq = {
      headers: {
        "x-test": "test-value",
      },
    } as unknown as NextApiRequest;

    const result = await getHeaders(mockReq);
    expect(result instanceof Headers).toBe(true);
    expect(result.get("x-test")).toBe("test-value");
  });

  it("should handle App Router request (NextRequest)", async () => {
    const mockReq = new NextRequest("https://example.com", {
      headers: {
        "x-test": "test-value",
      },
    });

    const result = await getHeaders(mockReq);
    expect(result instanceof Headers).toBe(true);
    expect(result.get("x-test")).toBe("test-value");
  });

  it("should handle App Router environment with no request", async () => {
    const result = await getHeaders();
    expect(result instanceof Headers).toBe(true);
    expect(result.get("x-test")).toBe("test-value");
  });

  it("should throw error when headers import fails", async () => {
    // Override the mock implementation for this test only
    defaultHeadersMock.mockImplementation(() => {
      throw new Error("Import failed");
    });

    await expect(getHeaders()).rejects.toThrow(
      "Kinde: Failed to read request headers",
    );
  });
});
