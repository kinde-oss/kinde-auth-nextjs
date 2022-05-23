import { setupChallenge } from "../utils/setupChallenge";

export const me = (req, res) => {
  setupChallenge();
  res.status(200).json({ function: "me" });
};
