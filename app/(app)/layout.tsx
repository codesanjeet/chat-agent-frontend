import { UserProvider } from "@/components/lib/UserContext";
import ChatWidgetLoader from "@/components/ChatWidgetLoader";
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return(<>
        <ChatWidgetLoader />
  
   <UserProvider>{children}</UserProvider>;
  </>)
}