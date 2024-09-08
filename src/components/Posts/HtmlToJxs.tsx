import React from "react";
import parse, { HTMLReactParserOptions } from "html-react-parser";
import Link from "next/link";
import { routes } from "@/routes";

interface HtmlNode {
  type: string;
  name?: string;
  attribs?: { [key: string]: string };
  data?: string;
  children?: HtmlNode[];
}

const customReplace = (domNode: HtmlNode): JSX.Element | null => {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.stopPropagation();
  };

  if (domNode.type === "text") {
    const textContent = domNode.data;
    if (textContent) {
      const mentionRegex = /@(\w+)/g;
      const hashtagRegex = /#(\w+)/g;
      const dollarRegex = /\$([a-zA-Z]+)/g;

      const parts = textContent.split(/(@\w+|#\w+|\$[a-zA-Z]+)/g);

      const elements = parts.map((part, index) => {
        if (part.match(mentionRegex)) {
          const username = part.slice(1);
          return (
            <Link
              onClick={onClick}
              prefetch={true}
              key={`${username}-${index}`}
              href={routes.app.profile(username)}
            >
              @{username}
            </Link>
          );
        } else if (part.match(hashtagRegex)) {
          const hashtag = part.slice(1);
          return (
            <Link
              onClick={onClick}
              prefetch={true}
              key={`${hashtag}-${index}`}
              href={routes.app.hashtag.hashtag(hashtag)}
            >
              #{hashtag}
            </Link>
          );
        } else if (part.match(dollarRegex)) {
          const tag = part.slice(1);
          return (
            <Link
              onClick={onClick}
              prefetch={true}
              key={`${tag}-${index}`}
              href={routes.app.search(tag)}
            >
              ${tag}
            </Link>
          );
        } else {
          return part;
        }
      });

      return <>{elements}</>;
    }
  }

  // Return null to keep the default behavior for other nodes
  return null;
};

const parseHtmlToJsx = (htmlString: string): JSX.Element => {
  const options: HTMLReactParserOptions = {
    replace: customReplace,
  };

  return <>{parse(htmlString, options)}</>;
};

export default parseHtmlToJsx;
