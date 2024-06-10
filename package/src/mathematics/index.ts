import { Node } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";

import MathNodeView from "./nodeView";

const NODE_CLASS = "block-math";
const INPUT_REGEX = /\$\$([^\$]*)\$\$/gi; // matches for text inside $$
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    Mathematics: {
      toggleMath: () => ReturnType;
    };
  }
}

const Mathematics = Node.create({
  name: "math",
  content: "text*",
  group: "block",
  marks: "",
  draggable: true,

  addAttributes() {
    return {
      showRendered: {
        default: true,
        renderHTML() {
          return {};
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: `div.${NODE_CLASS}`, priority: 1000 }];
  },

  renderHTML() {
    return ["div", { class: NODE_CLASS }, 0];
  },
  addNodeView() {
    return (props) => new MathNodeView(props);
  },

  addCommands() {
    return {
      toggleMath:
        () =>
        ({ commands }) => {
          return commands.toggleNode(this.name, "paragraph", {
            showRendered: false,
          });
        },
    };
  },

  addInputRules() {
    // when a user types $$...$$, add a new math node
    return [
      {
        find: INPUT_REGEX,
        type: this.type,
        handler({ range, match, chain, state }) {
          const start = range.from;
          let end = range.to;
          if (match[1]) {
            const text = state.schema.text(match[1]);
            chain()
              .command(({ tr }) => {
                //@ts-ignore
                tr.replaceRangeWith(start, end, this.type.create(null, text));
                return true;
              })
              .run();
          }
        },
      },
    ];
  },

  addKeyboardShortcuts() {
    return {
      // if the user presses the right arrow or enter key and there's no node after, create one
      ArrowDown: ({ editor }) => {
        const { empty, $anchor } = editor.state.selection;
        if (!empty || $anchor.parent.type.name !== this.name) {
          return false;
        }

        const posAfter = $anchor.after();
        const pos = editor.state.tr.doc.resolve(posAfter);
        if (!pos.nodeAfter || pos.nodeAfter.type.name == "footnotes") {
          return editor.commands.command(({ tr }) => {
            const paragraph = editor.state.schema.nodes.paragraph.create();
            tr.insert(posAfter, paragraph);

            const resolvedPos = tr.doc.resolve(posAfter + 1); // Adjust if your node structure differs
            tr.setSelection(TextSelection.near(resolvedPos));
            return true;
          });
        }
        return false;
      },

      Enter: ({ editor }) => {
        const { $anchor } = editor.state.selection;
        if ($anchor.parent.type.name !== this.name) {
          return false;
        }
        const posAfter = $anchor.after();
        const pos = editor.state.tr.doc.resolve(posAfter);
        if (!pos.nodeAfter || pos.nodeAfter.type.name == "footnotes") {
          return editor.commands.command(({ tr }) => {
            const paragraph = editor.state.schema.nodes.paragraph.create();
            tr.insert(posAfter, paragraph);

            const resolvedPos = tr.doc.resolve(posAfter + 1); // Adjust if your node structure differs
            tr.setSelection(TextSelection.near(resolvedPos));
            return true;
          });
        } else {
          // place the text selection at the end of the next node
          return editor.commands.setTextSelection(
            posAfter + pos.nodeAfter.content.size + 1
          );
        }
      },
    };
  },
});

export default Mathematics;
