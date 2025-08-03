declare module "react-markdown" {
  import * as React from "react";

  export interface ReactMarkdownProps {
    children: string;
    className?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    components?: Record<string, React.ComponentType<any>>;
  }

  const ReactMarkdown: React.FC<ReactMarkdownProps>;
  export default ReactMarkdown;
}
