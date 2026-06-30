import { visit } from 'unist-util-visit';
import type { Root, BlockContent, Paragraph, PhrasingContent, Parent } from 'mdast';
import type { Plugin } from 'unified';

const CALLOUT_HEADER = /^\[!([\w-]+)\][ \t]*(.*)$/;
const LEADING_EMOJI = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u;

const DEFAULT_EMOJI: Record<string, string> = {
  note:      '📝',
  tip:       '💡',
  hint:      '💡',
  info:      'ℹ️',
  warning:   '⚠️',
  caution:   '🔥',
  danger:    '🚨',
  important: '❗',
  success:   '✅',
  check:     '✅',
  done:      '✅',
  question:  '❓',
  help:      '❓',
  faq:       '❓',
  bug:       '🐛',
  example:   '📌',
  quote:     '💬',
  cite:      '💬',
  abstract:  '📋',
  summary:   '📋',
  tldr:      '📋',
  todo:      '☑️',
  failure:   '❌',
  fail:      '❌',
  missing:   '❌',
};

type Replacement = {
  index: number;
  parent: Parent;
  nodes: (BlockContent | { type: 'html'; value: string })[];
};

export const remarkCallout: Plugin<[], Root> = () => {
  return (tree) => {
    const replacements: Replacement[] = [];

    visit(tree, 'blockquote', (node, index, parent) => {
      if (!parent || index == null) return;

      const firstChild = node.children[0];
      if (!firstChild || firstChild.type !== 'paragraph') return;

      const firstText = firstChild.children[0];
      if (!firstText || firstText.type !== 'text') return;

      const firstLine = firstText.value.split('\n')[0];
      const m = firstLine.match(CALLOUT_HEADER);
      if (!m) return;

      const calloutType = m[1].toLowerCase();
      let titleRaw = (m[2] ?? '').trim();

      let emoji = DEFAULT_EMOJI[calloutType] ?? '📝';
      const emojiMatch = titleRaw.match(LEADING_EMOJI);
      if (emojiMatch) {
        emoji = emojiMatch[0];
        titleRaw = titleRaw.slice(emoji.length).trim();
      }

      // Content after the [!type] first line within the same paragraph
      const afterFirstLine = firstText.value.slice(firstLine.length).replace(/^\n/, '');
      const trailingSiblings = firstChild.children.slice(1) as PhrasingContent[];

      const contentNodes: BlockContent[] = [];

      const inlineChildren: PhrasingContent[] = [];
      if (afterFirstLine) inlineChildren.push({ type: 'text', value: afterFirstLine });
      inlineChildren.push(...trailingSiblings);

      if (inlineChildren.length > 0) {
        contentNodes.push({ type: 'paragraph', children: inlineChildren } as Paragraph);
      }

      contentNodes.push(...(node.children.slice(1) as BlockContent[]));

      replacements.push({
        index,
        parent: parent as Parent,
        nodes: [
          { type: 'html', value: `<div data-node-type="callout"><div data-node-type="callout-emoji">${emoji}</div><div data-node-type="callout-text">` },
          ...contentNodes,
          { type: 'html', value: `</div></div>` },
        ],
      });
    });

    for (const { index, parent, nodes } of replacements.reverse()) {
      parent.children.splice(index, 1, ...(nodes as BlockContent[]));
    }
  };
};
