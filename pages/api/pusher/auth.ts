import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { pusherServer } from "@/app/libs/pusher";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    const session = await getServerSession(request, response, authOptions);

    if (!session?.user?.email) {
      return response.status(401).json({ error: "Unauthorized" });
    }

    const { socket_id: socketId, channel_name: channel } = request.body;
    if (!socketId || !channel) {
      return response.status(400).json({ error: "Missing socket_id or channel_name in request body" });
    }

    const data = {
      user_id: session.user.email,
    };

    const authResponse = pusherServer.authorizeChannel(socketId, channel, data);
    return response.status(200).send(authResponse);
  } catch (error) {
    console.error("Error authorizing Pusher channel:", error);
    return response.status(500).json({ error: "Internal Server Error" });
  }
}
