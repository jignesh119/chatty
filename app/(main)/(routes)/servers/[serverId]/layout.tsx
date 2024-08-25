import React from "react";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ServerSidebar } from "@/components/server/serverSidebar";

export default async function ServerIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { serverId: string };
}) {
  const profile = await currentProfile();

  if (!profile) return auth().redirectToSignIn();

  console.log(`server id from params ${params.serverId}`);
  const server = await db.server.findUnique({
    where: {
      id: params.serverId,
      members: {
        some: {
          profileId: profile.id as string,
        },
      },
    },
  });

  if (!server) {
    console.log(`----------------SERVER NOT FOUND----------`);
    return notFound();
  }

  //TODO: add hidden in deployment
  return (
    <div className="h-full">
      <div className=" md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
        <ServerSidebar serverId={params.serverId} />
      </div>
      <main className="h-full md:pl-60">{children}</main>
    </div>
  );
}
