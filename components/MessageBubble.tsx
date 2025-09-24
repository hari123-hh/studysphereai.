import React from 'react';
import type { Message } from '../types';
import { Role } from '../types';
import { UserIcon, BrainCircuitIcon } from './icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  message?: Message;
  isLoading?: boolean;
}

const MarkdownComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-4 mb-2" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
    p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 pl-4 space-y-1" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 pl-4 space-y-1" {...props} />,
    li: ({node, ...props}) => <li className="pl-2" {...props} />,
    // Fix: Updated `code` component to handle deprecated `inline` prop.
    // The `inline` prop is no longer passed by `react-markdown`. The recommended
    // way to distinguish between inline and block code is to check for a `language-*`
    // className, which is present on code blocks but not on inline code.
    code: ({ node, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      return match ? (
        <div className="bg-zinc-800/50 rounded-md my-4">
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-600">
            <span className="text-xs font-sans text-zinc-400">{match ? match[1] : 'code'}</span>
          </div>
          <pre className="p-4 text-sm font-mono text-zinc-200 overflow-x-auto"><code {...props}>{children}</code></pre>
        </div>
      ) : (
        <code className="bg-zinc-600/50 rounded px-1.5 py-1 text-sm font-mono text-amber-300 mx-0.5" {...props}>
          {children}
        </code>
      );
    },
    a: ({node, ...props}) => <a className="text-amber-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
    strong: ({node, ...props}) => <strong className="font-bold text-zinc-100" {...props} />,
    table: ({node, ...props}) => <div className="overflow-x-auto"><table className="table-auto w-full my-4 border border-zinc-600 border-collapse" {...props} /></div>,
    thead: ({node, ...props}) => <thead className="bg-zinc-800" {...props} />,
    th: ({node, ...props}) => <th className="border border-zinc-600 px-4 py-2 text-left" {...props} />,
    td: ({node, ...props}) => <td className="border border-zinc-600 px-4 py-2" {...props} />,
  };

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center">
            <BrainCircuitIcon className="h-6 w-6 text-amber-400" />
        </div>
        <div className="flex items-center space-x-2 animate-pulse pt-2">
            <div className="h-3 w-3 bg-amber-400 rounded-full"></div>
            <div className="h-3 w-3 bg-amber-400 rounded-full animation-delay-200"></div>
            <div className="h-3 w-3 bg-amber-400 rounded-full animation-delay-400"></div>
        </div>
      </div>
    );
  }

  if (!message) return null;

  const isUser = message.role === Role.USER;

  const bubbleClasses = isUser
    ? 'bg-amber-600 text-white'
    : 'bg-zinc-700 text-zinc-200';
  
  const containerClasses = isUser
    ? 'flex items-start gap-4 flex-row-reverse'
    : 'flex items-start gap-4';

  const Icon = isUser 
    ? <div className="flex-shrink-0 h-10 w-10 rounded-full bg-zinc-600 flex items-center justify-center"><UserIcon className="h-6 w-6 text-zinc-300" /></div>
    : <div className="flex-shrink-0 h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center"><BrainCircuitIcon className="h-6 w-6 text-amber-400" /></div>;

  return (
    <div className={containerClasses}>
        {Icon}
      <div className={`w-full max-w-xl p-4 rounded-2xl ${bubbleClasses}`}>
        {message.images && message.images.length > 0 && (
          <div className={`grid ${message.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-3`}>
            {message.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`User upload ${idx + 1}`}
                className="rounded-lg w-full h-auto object-cover aspect-square"
              />
            ))}
          </div>
        )}
        {isUser ? (
            <p className="whitespace-pre-wrap">{message.text}</p>
        ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                {message.text}
            </ReactMarkdown>
        )}
      </div>
    </div>
  );
};