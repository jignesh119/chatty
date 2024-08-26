//
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { getOrCreateConversation } from "@/lib/conversations";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

interface MemberIdProps {
  memberId: string;
  serverId: string;
}
export default async function Conversations(props: MemberIdProps) {
  const profile = await currentProfile();
  if (!profile) {
    return auth().redirectToSignIn();
  }

  const currMember = await db.member.findFirst({
    where: { serverId: props.serverId, profileId: profile.id },
    include: { profile: true },
  });
  if (!currMember) {
    return NextResponse.redirect(`/servers/${props?.serverId}`);
  }

  const convos = await getOrCreateConversation(currMember.id, profile.id);
  if (!convos) redirect(`/servers/${props.serverId}`);

  const member1 = convos?.memberOne,
    member2 = convos?.memberTwo;
  const otherMember = member1?.profileId === profile.id ? member2 : member1;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        imageUrl={otherMember?.profile.imageUrl}
        name={otherMember?.profile.name as string}
        serverId={props.serverId}
        type="conversation"
      />
      <>
        <ChatMessages
          member={currMember}
          name={otherMember?.profile.name as string}
          chatId={convos?.id as string}
          type="conversation"
          apiUrl="/api/direct-messages"
          socketUrl="/api/socket/messages/direct-messages"
          socketQuery={{ conversationId: convos?.id as string }}
          paramKey="conversationId"
          paramValue={convos?.id as string}
        />
        <ChatInput
          name={otherMember?.profile.name as string}
          type="conversation"
          apiUrl="/api/socket/direct-messages"
          query={{
            conversationId: convos?.id as string,
          }}
        />
      </>
    </div>
  );
}
