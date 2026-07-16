import { FullPageChat } from "@/components/chat/Chatshells";

export default async function TenantChatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <FullPageChat
      slug={slug}
      accentColor="#2B4EFF"
      businessName="Chat"
      welcomeMessage="Hi! Ask me anything about us."
    />
  );
}