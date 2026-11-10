import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSettings } from "@/lib/db";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <Header officeName={settings.office_name} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
