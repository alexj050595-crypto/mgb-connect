import type { Metadata, Viewport } from "next";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { ServiceProvider } from "@/context/ServiceContext";
import { RoleProvider } from "@/context/RoleContext";
import { AnnouncementProvider } from "@/context/AnnouncementContext";
import { DemoModeProvider } from "@/context/DemoModeContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "MGB Connect",
  description:
    "MGB Connect – Verwaltung und Organisation der Messdiener.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <AuthProvider>
          <RoleProvider>
            <DemoModeProvider>
              <ServiceProvider>
                <AnnouncementProvider>{children}</AnnouncementProvider>
              </ServiceProvider>
            </DemoModeProvider>
          </RoleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
