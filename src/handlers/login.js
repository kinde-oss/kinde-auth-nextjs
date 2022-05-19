import { setupChallenge } from "../utils/setupChallenge";

export const login = (req, res) => {
  // setupChallenge();
  console.log("log in");
  console.log("req", req);
  console.log("res", res);

  res.status(200).json({ name: "John Doe" });
};
