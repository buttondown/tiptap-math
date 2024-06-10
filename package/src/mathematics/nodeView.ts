import { Editor, NodeViewRendererProps } from "@tiptap/core";
import { Node } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";
import { NodeView } from "@tiptap/pm/view";
import katex from "katex";

class MathNodeView implements NodeView {
  renderer!: HTMLElement;
  content!: HTMLElement | null;
  editor!: Editor;
  node!: Node;
  getPos!: () => number | undefined;
  showRendered!: boolean; // indicates whether to show the katex

  constructor(props: NodeViewRendererProps) {
    this.editor = props.editor;
    this.node = props.node;
    this.getPos = props.getPos as any;
    this.showRendered =
      this.node.textContent.trim() && this.node.attrs.showRendered;
    this.mount();
  }

  mount() {
    const parent = document.createElement("div");
    const katexNode = document.createElement("div");

    const span = document.createElement("span"); // the contentDOM node

    span.innerHTML = this.node.textContent;

    span.classList.add("math-content");
    if (!span.innerText.trim()) {
      span.classList.add("math-content-empty");
    }

    //append children
    parent.append(span);
    parent.classList.add("math");

    if (this.showRendered) {
      // render katex
      katexNode.setAttribute("contentEditable", "false");
      katex.render(this.node.textContent, katexNode, {
        displayMode: true,
        throwOnError: false,
      });
      parent.append(katexNode);
      // hide the span
      // we don't want to remove the node because that won't allow it to be navigable in the editor, we just want it to appear invisible.
      span.setAttribute(
        "style",
        "opacity: 0; overflow: hidden; position: absolute; width: 0px; height: 0px;"
      );

      // select the node on click
      parent.addEventListener("click", () => {
        this.selectNode();
      });

      parent.setAttribute("draggable", "true");
    } else {
      katexNode.setAttribute("style", "display:none;");
      parent.classList.add("math-selected");
    }

    this.editor.on("selectionUpdate", this.handleSelectionUpdate.bind(this));

    this.renderer = parent;
    this.content = span;
  }

  get dom() {
    return this.renderer;
  }

  get contentDOM() {
    return this.content;
  }

  handleSelectionUpdate() {
    const pos = this.getPos();
    if (pos == undefined) return;
    const { from, to } = this.editor.state.selection;

    if (from >= pos && to <= pos + this.node.nodeSize) {
      if (this.showRendered) {
        this.selectNode();
      }
    } else if (!this.showRendered) {
      this.deselectNode();
    }
  }

  selectNode() {
    const pos = this.getPos() as number;
    if (pos == undefined) return;
    // check the node at `pos` is a math node
    const nodeAfter = this.editor.state.tr.doc.resolve(pos).nodeAfter;
    if (nodeAfter?.type.name != "math") return;
    this.editor
      .chain()
      .command(({ tr }) => {
        tr.setNodeAttribute(pos, "showRendered", false);
        const newSelection = TextSelection.create(
          tr.doc,
          pos + this.node.content.size + 1
        );
        tr.setSelection(newSelection); //place the text selection at the end
        return true;
      })
      .run();
  }

  deselectNode() {
    const pos = this.getPos();
    if (pos == undefined) return;
    if (!this.node.textContent.trim()) {
      return this.editor.commands.command(({ tr }) => {
        tr.delete(pos, pos + this.node.nodeSize);
        return true;
      });
    }
    this.editor.commands.command(({ tr }) => {
      tr.setNodeAttribute(pos, "showRendered", true);
      return true;
    });
  }

  update() {
    return false;
  }

  destroy() {
    this.editor.off("selectionUpdate", this.handleSelectionUpdate.bind(this));
    this.content = null;
  }
  stopEvent() {
    // when the node is selected, don't allow it to be dragged
    const isDraggable = this.renderer.getAttribute("draggable");
    if (!isDraggable) {
      return true;
    }
    return false;
  }
}
export default MathNodeView;
