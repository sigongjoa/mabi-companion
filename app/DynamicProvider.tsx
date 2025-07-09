"use client";

import dynamic from "next/dynamic";
import React from "react";

const ClientProviders = dynamic(() => import("./ClientProviders"), {
  ssr: false,
});

export default function DynamicProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientProviders>{children}</ClientProviders>;
}
