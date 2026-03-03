"use client";

import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs";

import { createApolloClient } from "@/lib/apolloClient";

type ApolloWrapperProps = {
  children: React.ReactNode;
};

export default function ApolloWrapper({ children }: ApolloWrapperProps) {
  return (
    <ApolloNextAppProvider makeClient={createApolloClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
