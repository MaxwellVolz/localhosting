import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Text } from 'mdast';

const remarkSubstitutions: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || typeof index !== 'number') return;

      const replacements: { [key: string]: string } = {
        '->': '→',
        '<-': '←',
        '<3': '♥',
      };

      // First do symbol replacements
      let value = node.value;
      for (const [key, symbol] of Object.entries(replacements)) {
        value = value.split(key).join(symbol);
      }

      // Now split into parts on ::combo::
      const parts = value.split(/(::.*?::)/g);
      if (parts.length === 1) {
        node.value = value; // just update original node
        return;
      }

      // Replace with multiple nodes
      const children = parts.map((part) => {
        const match = part.match(/^::(.*?)::$/);
        if (match) {
          return {
            type: 'mdxJsxTextElement',
            name: 'Kbd',
            attributes: [],
            children: [{ type: 'text', value: match[1].trim() }],
          };
        } else {
          return { type: 'text', value: part };
        }
      });

      (parent.children as any[]).splice(index, 1, ...children);
    });
  };
};

export default remarkSubstitutions;
