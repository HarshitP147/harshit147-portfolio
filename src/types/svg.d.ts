declare module "*.svg" {
  import type * as React from "react";

  const ReactComponent: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>
  >;

  export default ReactComponent;
}

declare module "*.svg?url" {
  const url: string;
  export default url;
}

