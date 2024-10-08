//NOTE: socket.io doesnt work in app router
import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIo } from "socket.io";

import { NextApiResponseServerIo } from "@/types";

export const config = {
  api: { bodyParser: false },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  //if there isnt any sckt srvr
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer = res.socket.server as any;
    const io = new ServerIo(httpServer, {
      //where is the server running
      path: path,
      addTrailingSlash: false,
    });
    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;
