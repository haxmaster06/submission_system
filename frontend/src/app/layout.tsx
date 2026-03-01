import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";


export const metadata: Metadata = {
  title: "HBM Staff Budgeting System",
  description: "Internal Staff Budgeting System for CV Hasil Barokah Mandiri",
  icons: {
    icon: "/logo.png",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { NotificationProvider } from "@/context/NotificationContext";
import { NotificationPopupProvider } from "@/context/NotificationPopupContext";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="antialiased font-sans">
        <AuthProvider>
          <NotificationProvider>
            <NotificationPopupProvider>
              {children}
            </NotificationPopupProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
