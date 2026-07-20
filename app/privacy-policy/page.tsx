import PrivacyPolicyPage from "@/components/base-pages/PrivacyPolicy";
import ChatWidgetLoader from "@/components/ChatWidgetLoader";
export const metadata = {
  title: "Privacy Policy | Kiteum Agent",
  description:
    "Review the Privacy Policy governing the use of the Kiteum Agent platform, services, and applications.",
};
const page = () => {
  return (<>
  
  <PrivacyPolicyPage/>
  <ChatWidgetLoader/>
  </>
  )
};
export default page;