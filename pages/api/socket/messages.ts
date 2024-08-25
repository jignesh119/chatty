//api endpoint for CHANNEL messages
import { NextApiRequest } from "next";

import { NextApiResponseServerIo } from "@/types";
import { currentProfilePages } from "@/lib/current-profile-page";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const profile = await currentProfilePages(req);
    const { content, fileUrl } = req.body;
    const { serverId, channelId } = req.query;

    if (!profile) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log("[ERROR] pages/api/socket/messages.ts: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
