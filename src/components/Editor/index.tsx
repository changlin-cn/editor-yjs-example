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

interface IProps{
  YDoc: Y.Doc;
  provider: WebsocketProvider;
  onValueChange?: (value: Descendant[]) => void;
}

export function Editor(props:IProps) {
  const [value, setValue] = useState<Descendant[]>([]);
  const [connected, setConnected] = useState(false);

  const { YDoc: doc, provider } = props

  const toggleConnection = useCallback(() => {
    if (connected) {
      return provider.disconnect();
    }

    provider.connect();
  }, [provider, connected]);

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
    provider.on('status', (event: { status: 'connected' | 'disconnected' | 'connecting' }) => {
      setConnected(event.status === 'connected');
    });
    provider.connect();
    return () => provider.disconnect();
  }, [provider]);
  useEffect(() => {
    YjsEditor.connect(editor);
    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  return (
    <React.Fragment>
      <Slate
        editor={editor}
        initialValue={value}
        onChange={(val) => {
          setValue(val);
          props.onValueChange?.(val);
        }}
      >
        <RemoteCursorOverlay className="flex justify-center my-32 mx-10">
          <FormatToolbar />
          <CustomEditable className="max-w-4xl w-full flex-col break-words" />
        </RemoteCursorOverlay>
        <ConnectionToggle connected={connected} onClick={toggleConnection} />
      </Slate>
    </React.Fragment>
  );
}
