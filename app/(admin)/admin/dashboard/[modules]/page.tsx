"use client";
import React from "react";
import UsersModule from "@/components/adminPanel/modules/UsersModule";
import ServicesModule from "@/components/adminPanel/modules/ServicesModule";
import PaymentsModule from "@/components/adminPanel/modules/PaymentsModule";
import SettingsModule from "@/components/adminPanel/modules/SettingsModule";
import CookiesModule from "@/components/adminPanel/modules/CookiesModule";
import SubscriptionsModule from "@/components/adminPanel/modules/SubscriptionsModule";
import UserServiceModule from "@/components/adminPanel/modules/UserServiceModule";
import LoginServiceModule from "@/components/adminPanel/modules/LoginServiceModule";

export default function AdminModulePage({
  params,
}: {
  params: { modules: string };
}) {
  // Extract the module name from the URL
  const currentModule = params.modules;

  // Simplified map using only module names
  const modulesMap: Record<string, React.ReactNode> = {
    users: <UsersModule />,
    services: <ServicesModule />,
    payments: <PaymentsModule />,
    settings: <SettingsModule />,
    cookies: <CookiesModule />,
    subscription: <SubscriptionsModule />,
    "user-services": <UserServiceModule />,
    "login-services": <LoginServiceModule />,

    // Add more modules as needed
  };

  // Use the extracted module name
  const moduleComponent = modulesMap[currentModule] || (
    <div>Module not found</div>
  );

  return <>{moduleComponent}</>;
}
