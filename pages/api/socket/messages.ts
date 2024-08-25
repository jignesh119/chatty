//api endpoint for CHANNEL messages
import { NextApiRequest } from "next";

import { NextApiResponseServerIo } from "@/types";
import { currentProfilePages } from "@/lib/current-profile-page";
import { db } from "@/lib/db";

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

    if (!serverId) {
      return res.status(400).json({ message: "Server ID is required" });
    }
    if (!channelId) {
      return res.status(400).json({ message: "Channel ID is required" });
    }
    if (!content && !fileUrl) {
      return res
        .status(400)
        .json({ message: "Content or fileUrl is required" });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: { some: { profileId: profile.id } },
      },
      include: { members: true },
    });
    if (!server) {
      return res
        .status(401)
        .json({ message: "server not found with pasd serverId" });
    }

    const channel = await db.channel.findFirst({
      where: { id: channelId as string, serverId: serverId as string },
    });
    if (!channel) {
      return res.status(401).json({ message: "channel not found" });
    }

    const member = server.members.find((mem) => mem.profileId === profile.id);
    if (!member) {
      return res.status(401).json({ message: "member not found in server" });
    }

    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        channelId: channelId as string,
        memberId: member.id,
      },
      include: { member: { include: { profile: true } } },
    });
    //TODO: emit message to all members in the channel
    //req: key of group
    //NOTE: used in FE when creatin hooks for msgs
    const channelKey = `chat:${channelId}:messages`;

    res?.socket?.server?.io.emit(channelKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.log("[ERROR] pages/api/socket/messages.ts: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
