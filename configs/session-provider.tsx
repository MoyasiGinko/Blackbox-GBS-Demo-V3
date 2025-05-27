"use client";
import React from "react";
import { SessionProvider as NextSessionProvider } from "next-auth/react";

type Props = {
  children: React.ReactNode;
};

const SessionProvider = (props: Props) => {
  return <NextSessionProvider>{props.children}</NextSessionProvider>;
};

export default SessionProvider;
