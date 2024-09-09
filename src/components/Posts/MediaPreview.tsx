import React, { useState, useEffect } from "react";
import { XIcon } from "lucide-react";
import { Button } from "../ui/button";

interface MediaPreviewProps {
  file: File | null;
  onClear?: () => void;
  isRounded?: boolean;
}

function MediaPreview({ file, onClear, isRounded = true }: MediaPreviewProps) {
  const [mediaType, setMediaType] = useState<"image" | "video">();

  useEffect(() => {
    if (file) checkMediaType(file);
  }, [file]);

  // Function to check the type of media
  const checkMediaType = (file: File) => {
    if (file.type.startsWith("image/")) {
      setMediaType("image");
    } else if (file.type.startsWith("video/")) {
      setMediaType("video");
    }
  };

  // Render the appropriate media preview
  const renderMediaPreview = (file: File) => {
    switch (mediaType) {
      case "image":
        return (
          <img
            className="size-full"
            src={URL.createObjectURL(file)}
            alt="Image Preview"
          />
        );
      case "video":
        return (
          <video controls>
            <source src={URL.createObjectURL(file)} type={file.type} />
          </video>
        );
      default:
        return <div>No media selected</div>;
    }
  };

  return (
    file && (
      <div>
        <div
          className={`h-auto max-h-[20rem] md:max-h-[35rem] xl:max-h-[40rem] relative overflow-hidden w-full bg-primary/5 ${
            isRounded ? "rounded-2xl" : ""
          }`}
        >
          {onClear && (
            <div className="h-14 w-full absolute flex items-center justify-end px-2">
              <Button
                variant={"ghost"}
                size="icon"
                title="Remove"
                className="dark:text-white dark:bg-dark dark:hover:bg-accent/40"
                onClick={onClear}
              >
                <XIcon height={18} />
              </Button>
            </div>
          )}

          <div className="h-auto max-h-[20rem] md:max-h-[35rem] xl:max-h-[40rem] overflow-scroll scrollbar-hide w-full">
            {mediaType && renderMediaPreview(file)}
          </div>
        </div>
      </div>
    )
  );
}

export default MediaPreview;
