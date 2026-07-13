import { ChatWidget } from "@/components/chat/Chatshells";

export default function TenantChatPage({ params }: { params: { tenantId: string } }) {
  return (
    <ChatWidget
      // tenantId={params.tenantId}
      tenantId="11a06f0e-027e-44ab-85c5-b0536de9bdbc"
      accentColor="#2B4EFF"
      businessName="Chat"
      welcomeMessage="Hi! Ask me anything about us."
    />
  );
}