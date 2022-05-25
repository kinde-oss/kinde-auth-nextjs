import { setupChallenge } from "../utils/setupChallenge";

export const me = async (req, res) => {
  // setupChallenge();
  res.status(200).json({ function: "me" });
};
