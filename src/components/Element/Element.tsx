import { RenderElementProps } from 'slate-react';
import React from 'react';
import './style.css';

export function Element({ element, attributes, children }: RenderElementProps) {
  switch ((element as any).type) {
    case 'heading-one':
      return (
        <h1 {...attributes} className="text-5xl my-5">
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 {...attributes} className="text-3xl my-2">
          {children}
        </h2>
      );
      
    case 'bulleted-list':
      return (
        <ul {...attributes} className="list-disc ml-6 my-2">
          {children}
        </ul>
      );
    case 'numbered-list':
      return (
        <ol {...attributes} className="list-decimal ml-6 my-2">
          {children}
        </ol>
      );
    case 'list-item':
      return (
        <li {...attributes} className="mb-1">
          {children}
        </li>
      );
    case 'inline-code':
      return (
        <code {...attributes} className="border-2 bg-gray-100">
          {children}
        </code>
      );
    case 'block-quote':
      return (
        <blockquote {...attributes} className="mb-2 text-gray-400 flex text-lg">
          <p className="my-1">{children}</p>
        </blockquote>
      );
    default:
      return (
        <p {...attributes} className="mb-2">
          {children}
        </p>
      );
  }
}
