import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://gql.hashnode.com",
  documents: ["src/**/*.{ts,tsx}"],
  generates: {
    "src/lib/graphql/generated.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typed-document-node",
      ],
    },
  },
  ignoreNoDocuments: true,
};

export default config;
