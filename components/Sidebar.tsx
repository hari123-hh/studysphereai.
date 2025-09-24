import React from 'react';
import type { Conversation } from '../types';
import { PlusIcon, XIcon } from './icons';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isOpen,
  onClose
}) => {
    
  const sidebarClasses = `
    absolute top-0 left-0 h-full w-64 bg-zinc-800 border-r border-zinc-700
    transform transition-transform ease-in-out duration-300 z-30
    md:static md:transform-none md:w-72
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;
    
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={onClose}></div>}
      <aside className={sidebarClasses}>
        <div className="p-4 flex flex-col h-full">
            <button
                onClick={onNewChat}
                className="flex items-center justify-center w-full p-3 mb-4 rounded-lg bg-amber-600 hover:bg-amber-500 transition-colors text-white font-semibold"
            >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Chat
            </button>
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                <h2 className="text-sm font-semibold text-zinc-400 mb-2 px-2">History</h2>
                <nav className="space-y-1">
                    {conversations.map((convo) => (
                    <div key={convo.id} className="group relative">
                        <button
                            onClick={() => onSelectConversation(convo.id)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md truncate transition-colors ${
                            activeConversationId === convo.id
                                ? 'bg-zinc-700 text-zinc-100'
                                : 'text-zinc-300 hover:bg-zinc-700/50'
                            }`}
                        >
                            {convo.title}
                        </button>
                        <button
                          onClick={(e) => {
                              e.stopPropagation();
                              onDeleteConversation(convo.id);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:bg-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Delete chat: ${convo.title}`}
                        >
                            <XIcon className="h-4 w-4" />
                        </button>
                    </div>
                    ))}
                </nav>
            </div>
        </div>
      </aside>
    </>
  );
});