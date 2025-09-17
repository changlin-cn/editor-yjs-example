import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { Y_WEBSOCKET_ENDPOINT_URL } from '../../config';
import { Editor } from '../../components/Editor';
import { slateNodesToInsertDelta } from '@slate-yjs/core';

export function RemoteCursorsOverlayPage() {
  const roomName = 'slate-yjs-demo';

  const { doc, provider } = useMemo(() => {
    const doc = new Y.Doc();
    const provider = new WebsocketProvider(
      Y_WEBSOCKET_ENDPOINT_URL,
      roomName,
      doc,
      { connect: true }
    );
    return { doc, provider };
  }, []);

  type SavedVersion = {
    id: string;
    ts: number;
    label?: string;
    dataB64: string; // encoded slate nodes JSON
  };

  const storageKey = `yjs-versions:${roomName}`;
  const [versions, setVersions] = useState<SavedVersion[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const persist = useCallback((next: SavedVersion[]) => {
    setVersions(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }, []);

  const u8ToB64 = (u8: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < u8.length; i += 1) binary += String.fromCharCode(u8[i]);
    return btoa(binary);
  };
  const b64ToU8 = (b64: string) => {
    const binary = atob(b64);
    const u8 = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) u8[i] = binary.charCodeAt(i);
    return u8;
  };
  const encodeNodesToB64 = (nodes: any) => {
    const json = JSON.stringify(nodes);
    const bytes = new TextEncoder().encode(json);
    return u8ToB64(bytes);
  };
  const decodeNodesFromB64 = (b64: string) => {
    const bytes = b64ToU8(b64);
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  };

  const latestValueRef = useRef<any>(null);

  const saveVersion = useCallback((label?: string) => {
    const nodes = latestValueRef.current ?? [];
    const dataB64 = encodeNodesToB64(nodes);
    const ver: SavedVersion = {
      id: `${Date.now()}`,
      ts: Date.now(),
      label,
      dataB64,
    };
    persist([ver, ...versions].slice(0, 50));
  }, [doc, versions, persist]);

  const restoreVersion = useCallback((v: SavedVersion) => {
    const nodes = decodeNodesFromB64(v.dataB64) as any;
    const shared = doc.get('content', Y.XmlText) as Y.XmlText;
    doc.transact(() => {
      shared.delete(0, shared.length);
      const delta = slateNodesToInsertDelta(nodes);
      shared.applyDelta(delta);
    });
  }, [doc]);

  const deleteVersion = useCallback((id: string) => {
    persist(versions.filter(v => v.id !== id));
  }, [versions, persist]);

  return (
    <div className="mx-10 my-6">
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
          onClick={() => saveVersion()}
          title="Save current version to browser localStorage"
        >
          Save Version
        </button>
        <span className="text-sm text-gray-500">(Stored in localStorage, visible only on this device)</span>
      </div>

      <div className="mb-6">
        <div className="font-semibold mb-2">Version History</div>
        <div className="space-y-2">
          {versions.length === 0 && (
            <div className="text-sm text-gray-500">No versions yet</div>
          )}
          {versions.map(v => (
            <div key={v.id} className="flex items-center gap-3 text-sm">
              <div className="min-w-[220px] text-gray-700">
                {new Date(v.ts).toLocaleString()} {v.label ? `· ${v.label}` : ''}
              </div>
              <button
                type="button"
                className="px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200"
                onClick={() => restoreVersion(v)}
              >
                Restore
              </button>
              <button
                type="button"
                className="px-2 py-0.5 rounded bg-red-100 hover:bg-red-200"
                onClick={() => deleteVersion(v.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <Editor
        YDoc={doc}
        provider={provider}
        onValueChange={(v) => { latestValueRef.current = v; }}
      />
    </div>
  );
}
