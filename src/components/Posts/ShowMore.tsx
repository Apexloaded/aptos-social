import React, { useState } from 'react';
import parseHtmlToJsx from './HtmlToJxs';

interface Props {
  data: string;
  more?: string;
  less?: string;
  truncatedEndingComponent?: string;
  endLength?: number;
  isShowMore?: boolean;
  onClick?: () => void;
}

function ShowMore({
  data,
  truncatedEndingComponent = '...',
  less = 'Show less',
  more = 'Show more',
  endLength = 250,
  isShowMore = false,
  onClick,
}: Props) {
  const [showMore] = useState<boolean>(isShowMore);

  const truncateString = (str: string, length: number) => {
    if (str.length <= length) return str;

    // Find the last complete sentence within the limit
    const sentenceRegex = /[^.!?]*[.!?]/g;
    let match;
    let lastMatchIndex = 0;

    while ((match = sentenceRegex.exec(str)) !== null) {
      if (match.index + match[0].length <= length) {
        lastMatchIndex = match.index + match[0].length;
      } else {
        break;
      }
    }

    if (lastMatchIndex === 0) {
      // If no full sentence is found within the limit, truncate at the nearest word boundary
      const words = str.substring(0, length).split(' ');
      words.pop();
      return words.join(' ') + '...';
    }

    return str.substring(0, lastMatchIndex) + '...';
  };

  const contentToDisplay = showMore
    ? parseHtmlToJsx(truncateString(data, endLength))
    : parseHtmlToJsx(data);

  return (
    <>
      <div className="html-data text-dark dark:text-white">
        {contentToDisplay}
      </div>
      {showMore && data.length > endLength && (
        <button
          className={`text-primary font-semibold text-sm gap-1 items-center ${
            showMore ? 'flex ml-0 mt-2' : 'inline-flex'
          } `}
          onClick={onClick}
        >
          {showMore ? more : less}
        </button>
      )}
    </>
  );
}

export default ShowMore;
