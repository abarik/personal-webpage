// Wraps every <h2> and the content that follows it (up to the next <h2>) in
//   <section class="pw-section" id="…"><h2>…</h2><div class="pw-section-body">…</div></section>
// so Markdown pages get the same two-column section layout as the rest of the site.
const slug = (text) =>
  text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const textOf = (node) =>
  node.type === "text" ? node.value : (node.children || []).map(textOf).join("");

export default function rehypeSections() {
  return (tree) => {
    const out = [];
    let section = null;
    for (const node of tree.children) {
      if (node.type === "element" && node.tagName === "h2") {
        const id = node.properties?.id || slug(textOf(node));
        if (node.properties) delete node.properties.id;
        section = {
          type: "element", tagName: "section",
          properties: { className: ["pw-section"], id },
          children: [node, { type: "element", tagName: "div", properties: { className: ["pw-section-body"] }, children: [] }],
        };
        out.push(section);
      } else if (section) {
        section.children[1].children.push(node);
      } else {
        out.push(node);
      }
    }
    tree.children = out;
  };
}
