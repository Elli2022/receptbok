import type { NextApiRequest, NextApiResponse } from "next";
import packageJson from "../../../package.json";

type HealthResponse = {
  status: "ok";
  version: string;
  timestamp: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<HealthResponse | { message: string }>) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    status: "ok",
    version: packageJson.version,
    timestamp: new Date().toISOString(),
  });
}
