import { setupChallenge } from "../utils/setupChallenge";

export const register = async (req, res) => {
  setupChallenge();
  res.status(200).json({ function: "Register" });
};
