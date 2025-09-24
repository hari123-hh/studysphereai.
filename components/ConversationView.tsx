
import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';
import { MessageBubble } from './MessageBubble';

interface ConversationViewProps {
  conversation: Message[];
  isLoading: boolean;
}

export const ConversationView: React.FC<ConversationViewProps> = ({ conversation, isLoading }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation, isLoading]);

  return (
    <div className="flex-1 space-y-6">
      {conversation.map((msg, index) => (
        <MessageBubble key={index} message={msg} />
      ))}
      {isLoading && <MessageBubble isLoading={true} />}
      <div ref={endOfMessagesRef} />
    </div>
  );
};
