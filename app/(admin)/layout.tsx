import "../globals.css";
import { Providers } from "../providers";

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
