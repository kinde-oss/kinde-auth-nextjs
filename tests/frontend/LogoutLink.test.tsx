import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";

vi.mock("../../src/config/index", () => ({
  config: {
    apiPath: "/api/auth",
  },
  routes: {
    logout: "logout",
  },
}));

const publishSessionEvent = vi.hoisted(() => vi.fn());
vi.mock("../../src/frontend/sessionChannel", () => ({
  publishSessionEvent,
}));

import { LogoutLink } from "../../src/components/LogoutLink";

describe("LogoutLink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("publishes logged_out before navigation", () => {
    const { getByText } = render(
      React.createElement(LogoutLink, null, "Sign out"),
    );

    fireEvent.click(getByText("Sign out"));

    expect(publishSessionEvent).toHaveBeenCalledWith({ type: "logged_out" });
  });

  it("calls consumer onClick after publishing", () => {
    const onClick = vi.fn();
    const { getByText } = render(
      React.createElement(LogoutLink, { onClick }, "Sign out"),
    );

    fireEvent.click(getByText("Sign out"));

    expect(publishSessionEvent).toHaveBeenCalledWith({ type: "logged_out" });
    expect(onClick).toHaveBeenCalled();
  });

  it("includes postLogoutRedirectURL in href", () => {
    const { getByText } = render(
      React.createElement(
        LogoutLink,
        { postLogoutRedirectURL: "/bye" },
        "Sign out",
      ),
    );

    const anchor = getByText("Sign out").closest("a");
    expect(anchor?.getAttribute("href")).toBe(
      "/api/auth/logout?post_logout_redirect_url=/bye",
    );
  });
});
