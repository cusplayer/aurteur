declare module '*.module.css' {
  const classes: { [key: string]: string };
  export = classes;
}

declare module "*.svg" {
  import * as React from "react";
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

// declare module '*.scss' {
//   const classes: { [key: string]: string };
//   export = classes;
// }