import "../globals.css";
import { Providers } from "../providers";
import AdminSidebar from "@/components/adminPanel/AdminSidebar";

export const metadata = {
  title: "Next.js Latest App",
  description: "Next.js app with TypeScript, Tailwind CSS, and React Query",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex min-h-screen">
            <main className="flex-1 min-h-screen bg-gray-50">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
