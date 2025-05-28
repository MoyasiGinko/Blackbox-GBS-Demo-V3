"use client";
import React from "react";
import { usePathname } from "next/navigation";

// Example: You can import your module components here
// import UsersModule from "@/components/adminPanel/UsersModule";
// import ServicesModule from "@/components/adminPanel/ServicesModule";
// ...

export default function AdminModulePage({
  params,
}: {
  params: { modules: string };
}) {
  const pathname = usePathname();

  // Extract the module name from the URL
  const currentModule = params.modules;

  // Simplified map using only module names
  const modulesMap: Record<string, React.ReactNode> = {
    users: <div>Users Module</div>,
    services: <div>Services Module</div>,
    payments: <div>Payments Module</div>,
    settings: <div>Settings Module</div>,
  };

  // Use the extracted module name
  const moduleComponent = modulesMap[currentModule] || (
    <div>Module not found</div>
  );

  return <>{moduleComponent}</>;
}
