import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { ServiceProvider } from "@/context/ServiceContext";
import { RoleProvider } from "@/context/RoleContext";
import { AnnouncementProvider } from "@/context/AnnouncementContext";

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
            <ServiceProvider>
              <AnnouncementProvider>
                {children}
              </AnnouncementProvider>
            </ServiceProvider>
          </RoleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
