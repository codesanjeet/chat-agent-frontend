import DocsPage from "@/components/base-pages/Docs";
import ChatWidgetLoader from "@/components/ChatWidgetLoader";
export const metadata = {
  title: "Widget Installation Docs | Kiteum Agent",
  description:
    "Step-by-step docs to add the Kiteum Agent chat widget to your website, for plain HTML and Next.js.",
};

const page = () => {
  return (<>
    <DocsPage/>
        <ChatWidgetLoader />

  </>
  )
};

export default page;