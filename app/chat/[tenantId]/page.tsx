// app/chat/[tenantId]/page.tsx
import { FullPageChat } from "@/components/chat/Chatshells";

export default function TenantChatPage({ params }: { params: { tenantId: string } }) {
  return (
    <FullPageChat
      slug={"kiteum"}
      accentColor="#2B4EFF"
      businessName="Chat"
      welcomeMessage="Hi! Ask me anything about us."
    />
  );
}