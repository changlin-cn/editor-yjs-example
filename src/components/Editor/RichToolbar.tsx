import React from 'react';
import { Editor, Element as SlateElement, Transforms, Text } from 'slate';
import { useSlate } from 'slate-react';

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

function isMarkActive(editor: Editor, format: string) {
  const marks = Editor.marks(editor) as Record<string, unknown> | null;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return marks ? (marks as any)[format] === true : false;
}

function toggleMark(editor: Editor, format: string) {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
}

function isBlockActive(editor: Editor, format: string) {
  const [match] = Editor.nodes(editor, {
    match: (n) => !Text.isText(n) && (n as SlateElement).type === format,
  });
  return !!match;
}

function toggleBlock(editor: Editor, format: string) {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) => !Text.isText(n) && LIST_TYPES.includes((n as SlateElement).type as string),
    split: true,
  });

  let newType: string = isActive ? 'paragraph' : isList ? 'list-item' : format;
  Transforms.setNodes(editor, { type: newType } as Partial<SlateElement>);

  if (!isActive && isList) {
    const block = { type: format, children: [] } as unknown as SlateElement;
    Transforms.wrapNodes(editor, block);
  }
}

function ToolbarButton({ active, onMouseDown, children }: { active?: boolean; onMouseDown: (e: React.MouseEvent) => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={`px-2 py-1 text-sm rounded border ${active ? 'bg-gray-200' : 'bg-white hover:bg-gray-50'} border-gray-300`}
      onMouseDown={(e) => {
        e.preventDefault();
        onMouseDown(e);
      }}
    >
      {children}
    </button>
  );
}

export function RichToolbar() {
  const editor = useSlate();

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {/* Marks */}
      <ToolbarButton active={isMarkActive(editor, 'bold')} onMouseDown={() => toggleMark(editor, 'bold')}>Bold</ToolbarButton>
      <ToolbarButton active={isMarkActive(editor, 'italic')} onMouseDown={() => toggleMark(editor, 'italic')}>Italic</ToolbarButton>
      <ToolbarButton active={isMarkActive(editor, 'underline')} onMouseDown={() => toggleMark(editor, 'underline')}>Underline</ToolbarButton>
      <ToolbarButton active={isMarkActive(editor, 'code')} onMouseDown={() => toggleMark(editor, 'code')}>Code</ToolbarButton>

      {/* Blocks */}
      <ToolbarButton active={isBlockActive(editor, 'heading-one')} onMouseDown={() => toggleBlock(editor, 'heading-one')}>H1</ToolbarButton>
      <ToolbarButton active={isBlockActive(editor, 'heading-two')} onMouseDown={() => toggleBlock(editor, 'heading-two')}>H2</ToolbarButton>
      <ToolbarButton active={isBlockActive(editor, 'block-quote')} onMouseDown={() => toggleBlock(editor, 'block-quote')}>Quote</ToolbarButton>
      <ToolbarButton active={isBlockActive(editor, 'bulleted-list')} onMouseDown={() => toggleBlock(editor, 'bulleted-list')}>Bulleted List</ToolbarButton>
      <ToolbarButton active={isBlockActive(editor, 'numbered-list')} onMouseDown={() => toggleBlock(editor, 'numbered-list')}>Numbered List</ToolbarButton>
    </div>
  );
}


