import RouterClient from "../routerClients/RouterClient";
import { config } from "../config/index";

/**
 * End session handler for activity timeout
 * Revokes tokens at Kinde and destroys local session
 */
export const endSession = async (routerClient: RouterClient) => {
  try {
    const domain = config.clientOptions.authDomain;
    const clientId = config.clientOptions.clientId;
    const clientSecret = config.clientOptions.clientSecret;

    // Get tokens from session
    const accessToken = (await routerClient.sessionManager.getSessionItem(
      "access_token",
    )) as string;
    const refreshToken = (await routerClient.sessionManager.getSessionItem(
      "refresh_token",
    )) as string;

    // Revoke tokens at Kinde's OAuth endpoint
    const revokeToken = async (token: string, tokenTypeHint: string) => {
      if (!token) return;

      const formParams = new URLSearchParams({
        token,
        client_id: clientId,
        client_secret: clientSecret,
        token_type_hint: tokenTypeHint,
      });

      await fetch(`${domain}/oauth2/revoke`, {
        method: "POST",
        body: formParams,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
    };

    // Revoke both tokens
    await Promise.allSettled([
      revokeToken(accessToken, "access_token"),
      revokeToken(refreshToken, "refresh_token"),
    ]);

    // Destroy local session
    await routerClient.sessionManager.destroySession();

    return routerClient.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Session termination error:", error);
    return routerClient.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
};
