import { withYHistory, withYjs, YjsEditor } from '@slate-yjs/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createEditor, Descendant } from 'slate';
import { Slate, withReact } from 'slate-react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { ConnectionToggle } from '../components/ConnectionToggle/ConnectionToggle';
import { CustomEditable } from '../components/CustomEditable/CustomEditable';
import { FormatToolbar } from '../components/FormatToolbar/FormatToolbar';
import { Y_WEBSOCKET_ENDPOINT_URL } from '../config';
import { withMarkdown } from '../plugins/withMarkdown';
import { withNormalize } from '../plugins/withNormalize';

export function SimplePage() {
  const [value, setValue] = useState<Descendant[]>([{type: 'paragraph', children: [{text: 'Hello, world!'}]}]);
  const [connected, setConnected] = useState(false);

  const { doc, provider } = useMemo(() => {
    const doc = new Y.Doc();
    const provider = new WebsocketProvider(
      Y_WEBSOCKET_ENDPOINT_URL,
      'slate-yjs-demo',
      doc,
      { connect: false }
    );
    return { doc, provider };
  }, []);

  const toggleConnection = useCallback(() => {
    if (connected) {
      provider.disconnect();
    } else {
      provider.connect();
    }
  }, [provider, connected]);

  const editor = useMemo(() => {
    const sharedType = doc.get('content', Y.XmlText) as Y.XmlText;

    return withMarkdown(
      withNormalize(
        withReact(
          withYHistory(
            withYjs(createEditor(), sharedType, { autoConnect: false })
          )
        )
      )
    );
  }, [doc]);

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
    <div className="flex justify-center my-32 mx-10">
      <Slate initialValue={value} onChange={setValue} editor={editor}>
        <FormatToolbar />
        <CustomEditable className="max-w-4xl w-full flex-col break-words" />
      </Slate>
      <ConnectionToggle connected={connected} onClick={toggleConnection} />
    </div>
  );
}
