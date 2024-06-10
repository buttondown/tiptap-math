# tiptap-math

A LaTeX extension for Tiptap

### Demo

See it in action [here](https://codesandbox.io/p/devbox/tiptap-math-example-777xhm).

## Getting Started

### Installation

```shell
$ npm install tiptap-math
```

This extension requires the `katex` library, so you need to install it as well:

```shell
npm install katex
```

### Usage

Make sure to import the KaTeX styles into your document.

```typescript
import "katex/dist/katex.min.css";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mathematics from "tiptap-math";

const extensions = [
  StarterKit,
  Mathematics,
];

const Tiptap = () => {
  const editor = useEditor({
    extensions,
  });

  return <EditorContent editor={editor} />
};

export default Tiptap;
```

### Styling

The following classes are applied to the math node:

```css
/* The container of the math block node */
.math {
    //...
}

/* This class is applied to the parent when the math node is selected (i.e. the cursor is inside the math node) */
.math-selected {
    //...
}

/* The node that contains the LaTeX text */
.math-content {
    //...
}

/* This class is applied to the LaTeX text node when it does not have any content */
.math-content-empty {
    //...
}
```
