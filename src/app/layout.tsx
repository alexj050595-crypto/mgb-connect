import type { Metadata } from "next";
import "./globals.css";

import { ServiceProvider } from "@/context/ServiceContext";
import { RoleProvider } from "@/context/RoleContext";

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
        <RoleProvider>
          <ServiceProvider>
            {children}
          </ServiceProvider>
        </RoleProvider>
      </body>
    </html>
  );
}