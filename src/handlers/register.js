import { setupChallenge } from "../utils/setupChallenge";

export const register = (req, res) => {
  setupChallenge();
  res.status(200).json({ function: "Register" });
};
