import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { defaultEditorProps } from "./props";
import { defaultExtensions } from "./extensions";
import { MenuBar } from "./menus/MenuBar";

type Props = {
  onUpdate: (value: string) => void;
  onWordCount: (value: number) => void;
  defaultValue?: string;
  onClear: () => void;
};

const CLEditor: React.FC<Props> = ({
  onUpdate,
  defaultValue,
  onWordCount,
  onClear,
}) => {
  const [hydrated, setHydrated] = useState(false);
  const [wordCount, setWordCount] = useState<number>(0);

  const editor = useEditor({
    content: defaultValue,
    extensions: [...defaultExtensions],
    editorProps: {
      ...defaultEditorProps,
    },
    onUpdate: (event) => {
      onUpdate(event.editor.getHTML());
      const words = countWords(event.editor.getText());
      onWordCount(words);
    },
  });

  useEffect(() => {
    console.log("clear");
  }, [onClear]);

  useEffect(() => {
    if (!editor || hydrated) return;
    if (defaultValue) {
      editor.commands.setContent(defaultValue);
      countWords(editor.getText());
      setHydrated(true);
    }
  }, [editor, defaultValue, hydrated]);

  const countWords = (sentence: string) => {
    const trimmedSentence = sentence.trim();
    const wordsArray = trimmedSentence.split(/\s+/);
    const nonEmptyWordsArray = wordsArray.filter((word) => word !== "");
    const length = trimmedSentence === "" ? 0 : nonEmptyWordsArray.length;
    setWordCount(length);
    return length;
  };

  const clearEditor = () => {
    if (editor) {
      editor.commands.clearContent();
    }
  };

  return (
    <div
      onClick={() => {
        editor?.chain().focus().run();
      }}
      className="flex flex-col cursor-text min-h-[4rem] max-h-[20rem] overflow-hidden"
    >
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {editor && <MenuBar editor={editor} />}
        <div className="flex-1 overflow-y-scroll scrollbar-hide">
          <EditorContent
            onFocus={() => {
              console.log("focused");
            }}
            placeholder="Hello"
            editor={editor}
          />
        </div>
        {/* <div className="py-1 h-6">
          <p className="text-xs font-bold">
            {wordCount < 1
              ? "no words"
              : `${wordCount} ${wordCount === 1 ? "word" : "words"}`}
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default CLEditor;
