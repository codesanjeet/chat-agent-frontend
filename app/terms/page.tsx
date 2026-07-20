import TermsOfServicePage from "@/components/base-pages/TermsOfServices";
import ChatWidgetLoader from "@/components/ChatWidgetLoader";
export const metadata = {
  title: "Terms of Service | Kiteum Agent",
  description:
    "Review the Terms of Service governing the use of the Kiteum Agent platform, services, and applications.",
};
const page = () => {
  return (
    <>
    <TermsOfServicePage/>
        <ChatWidgetLoader />

    </>
  )
};
export default page;