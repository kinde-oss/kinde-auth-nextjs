import { setupChallenge } from "../utils/setupChallenge";

export const logout = (req, res) => {
  setupChallenge();
  res.status(200).json({ function: "logout" });
};
