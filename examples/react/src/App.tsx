import "katex/dist/katex.min.css";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Mathematics from "tiptap-math";

const extensions = [
  StarterKit,
  Placeholder.configure({
    placeholder: "Start typing here...",
  }),
  Mathematics,
];

const Tiptap = () => {
  const editor = useEditor({
    extensions,
    content: `<p>Hello!</p><div class="block-math">c = \\pm\\sqrt{a^2 + b^2}</div>`,
  });

  return (
    <div className="mx-auto w-fit flex flex-col justify-center h-screen">
      <h1 className="text-3xl mb-2">LaTeX Demo</h1>
      <p>
        Click the "toggle math node" button below or type <code>$$text$$</code>{" "}
        to insert a math node
      </p>
      <br />
      <button
        className="bg-neutral-200 text-gray-700 font-semibold text-sm rounded-md w-fit px-3 py-2"
        onClick={() => editor?.chain().focus().toggleMath().run()}
      >
        toggle math node
      </button>
      <br />
      <EditorContent editor={editor} />
    </div>
  );
};

export default Tiptap;
