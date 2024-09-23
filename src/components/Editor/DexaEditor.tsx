import React, {
  useEffect,
  useState,
  useImperativeHandle,
  ForwardedRef,
} from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { defaultEditorProps } from './props';
import { defaultExtensions } from './extensions';
import { MenuBar } from './menus/MenuBar';
import { countWords } from '@/utils/helpers';
import Placeholder from '@tiptap/extension-placeholder';

export interface DexaEditorHandle {
  clearEditor: () => void;
  focus: () => void;
  setValue: (value?: string) => void;
}

type Props = {
  onUpdate: (value: string) => void;
  onWordCount: (value: number) => void;
  defaultValue?: string;
  value?: string;
  placeholder?: string;
};

const DexaEditor = React.forwardRef(
  (
    {
      onUpdate,
      defaultValue,
      onWordCount,
      value,
      placeholder = "What's on your mind?",
    }: Props,
    ref: ForwardedRef<DexaEditorHandle>
  ) => {
    const [hydrated, setHydrated] = useState(false);

    const editor = useEditor({
      content: defaultValue,
      extensions: [
        ...defaultExtensions,
        Placeholder.configure({
          placeholder: ({ node }) => {
            if (node.type.name === 'heading') {
              return `Heading ${node.attrs.level}`;
            }
            return placeholder;
          },
          includeChildren: true,
        }),
      ],
      editable: true,
      editorProps: {
        ...defaultEditorProps,
      },
      onUpdate: (event) => {
        onUpdate(event.editor.getHTML());
        const words = countWords(event.editor.getText());
        onWordCount(words);
      },
    });

    useImperativeHandle(ref, () => ({
      clearEditor: () => {
        if (editor) {
          editor.commands.clearContent();
        }
      },
      focus: () => {
        if (editor) {
          editor.chain().focus().run();
        }
      },
      setValue: (value?: string) => {
        if (editor && value) {
          editor.commands.setContent(value);
          const words = countWords(value);
          onWordCount(words);
        }
      },
    }));

    useEffect(() => {
      if (!editor || hydrated) return;
      if (defaultValue) {
        editor.commands.setContent(defaultValue);
        countWords(editor.getText());
        setHydrated(true);
      }
    }, [editor, defaultValue, hydrated]);

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
              editor={editor}
              // onFocus={onFocus}
              // value={value}
            />
          </div>
        </div>
      </div>
    );
  }
);
DexaEditor.displayName = 'DexaEditor';
export default DexaEditor;
