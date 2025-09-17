import { RemoteCursorDecoratedRange } from '@slate-yjs/react';
import { BaseRange } from 'slate';
import { CursorData } from './types';

declare module 'slate' {
  interface CustomTypes {
    Range: BaseRange | RemoteCursorDecoratedRange<CursorData>;
    Element: (
      | { type: 'paragraph'; children: any }
      | { type: 'inline-code'; children: any }
      | { type: 'heading-one'; children: any }
      | { type: 'heading-two'; children: any }
      | { type: 'block-quote'; children: any }
      | { type: 'bulleted-list'; children: any }
      | { type: 'numbered-list'; children: any }
      | { type: 'list-item'; children: any }
    );
    Text: {
      text: string;
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      strikethrough?: boolean;
      code?: boolean;
    };
  }
}
