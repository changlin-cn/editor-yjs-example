import { withCursors, withYHistory, withYjs, YjsEditor } from '@slate-yjs/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Descendant } from 'slate';
import { createEditor } from 'slate';
import { Slate, withReact } from 'slate-react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { ConnectionToggle } from '../ConnectionToggle/ConnectionToggle';
import { CustomEditable } from '../CustomEditable/CustomEditable';
import { FormatToolbar } from '../FormatToolbar/FormatToolbar';
import { Y_WEBSOCKET_ENDPOINT_URL } from '../../config';
import { withMarkdown } from '../../plugins/withMarkdown';
import { withNormalize } from '../../plugins/withNormalize';
import { randomCursorData } from '../../utils';
import { RemoteCursorOverlay } from './Overlay';
import { RichToolbar } from './RichToolbar';

interface IProps {
  YDoc: Y.Doc;
  provider: WebsocketProvider;
  onValueChange?: (value: Descendant[]) => void;
}

export function Editor(props: IProps) {
  const [value, setValue] = useState<Descendant[]>([]);

  const { YDoc: doc, provider } = props

  

  const editor = useMemo(() => {
    const sharedType = doc.get('content', Y.XmlText) as Y.XmlText;

    return withMarkdown(
      withNormalize(
        withReact(
          withYHistory(
            withCursors(
              withYjs(createEditor(), sharedType, { autoConnect: false }),
              provider.awareness,
              {
                data: randomCursorData(),
              }
            )
          )
        )
      )
    );
  }, [provider.awareness, doc]);

  // Connect editor and provider in useEffect to comply with concurrent mode
  // requirements.
  

  useEffect(() => {
    YjsEditor.connect(editor);
    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  return (
    <div style={{ border: 'solid 1px blue', padding: 10 }}>
      <Slate
        editor={editor}
        initialValue={value}
        onChange={(val) => {
          setValue(val);
          props.onValueChange?.(val);
        }}
      >
        <div className="max-w-4xl w-full mx-auto">
          <RichToolbar />
        </div>
        <RemoteCursorOverlay >
          <FormatToolbar />
          <CustomEditable />
        </RemoteCursorOverlay>
      </Slate>
    </div>
  );
}
