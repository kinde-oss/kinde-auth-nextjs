import { setupChallenge } from "../utils/setupChallenge";

export const login = (req, res) => {
  setupChallenge();
  res.status(200).json({ function: "Login" });
};
