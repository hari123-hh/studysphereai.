
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ConversationView } from './components/ConversationView';
import { MessageInput } from './components/MessageInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Sidebar } from './components/Sidebar';
import type { Message, ImageFile, Conversation } from './types';
import { Role } from './types';
import { generateResponse } from './services/geminiService';

const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem('studysphere-ai-conversations');
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations));
      }
    } catch (e) {
      console.error("Failed to load conversations from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('studysphere-ai-conversations', JSON.stringify(conversations));
    } catch (e) {
      console.error("Failed to save conversations to localStorage", e);
    }
  }, [conversations]);

  const handleSendMessage = useCallback(async (text: string, images: ImageFile[] | null) => {
    if ((!text && (!images || images.length === 0)) || isLoading) return;

    const userMessage: Message = {
      role: Role.USER,
      text: text,
      images: images ? images.map(img => img.base64) : undefined,
    };
    
    setInputValue(''); // Clear input immediately for better UX
    setIsLoading(true);
    setSidebarOpen(false);

    let currentConversationId = activeConversationId;
    let updatedConversations = [...conversations];
    const newConversationTitle = text.length > 40 ? text.substring(0, 37) + '...' : text || 'Image Query';

    if (!currentConversationId) {
      currentConversationId = `chat_${Date.now()}`;
      const newConversation: Conversation = {
        id: currentConversationId,
        title: newConversationTitle,
        messages: [userMessage],
      };
      updatedConversations = [newConversation, ...conversations];
      setActiveConversationId(currentConversationId);
    } else {
      const convoIndex = updatedConversations.findIndex(c => c.id === currentConversationId);
      if (convoIndex !== -1) {
          const updatedMessages = [...updatedConversations[convoIndex].messages, userMessage];
          updatedConversations[convoIndex] = { ...updatedConversations[convoIndex], messages: updatedMessages };
      }
    }
    
    setConversations(updatedConversations);

    try {
      const aiResponse = await generateResponse(text, images);
      const modelMessage: Message = {
        role: Role.MODEL,
        text: aiResponse,
      };
      const finalConversations = updatedConversations.map(c => 
          c.id === currentConversationId ? { ...c, messages: [...c.messages, modelMessage] } : c
      );
      setConversations(finalConversations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      const errorResponse: Message = {
        role: Role.MODEL,
        text: `Sorry, I couldn't process that request. ${errorMessage}`
      };
      const finalConversations = updatedConversations.map(c => 
          c.id === currentConversationId ? { ...c, messages: [...c.messages, errorResponse] } : c
      );
      setConversations(finalConversations);
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId, conversations, isLoading]);

  const handleSuggestionClick = useCallback((text: string) => {
    setInputValue(text);
    inputRef.current?.focus();
  }, []);
  
  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false);
  }, []);

  const handleNewChat = useCallback(() => {
    setActiveConversationId(null);
    setSidebarOpen(false);
  }, []);
  
  const handleDeleteConversation = useCallback((id: string) => {
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) {
          setActiveConversationId(null);
      }
  }, [activeConversationId]);
  
  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="flex h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 text-white font-sans">
      <Sidebar 
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 h-screen overflow-hidden min-w-0">
        <Header onToggleSidebar={toggleSidebar} />
        <div className="relative z-0 w-full flex justify-center py-1 bg-zinc-900 border-b border-zinc-700">
          <div className="h-[50px] flex items-center justify-center overflow-hidden">
            <div id="container-45a4f6502055d2e7a2007494d1b6110c" className="transform scale-50 origin-center"></div>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6">
            {!activeConversation ? (
              <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
            ) : (
              <ConversationView conversation={activeConversation.messages} isLoading={isLoading} />
            )}
          </div>
        </main>
        <MessageInput
          ref={inputRef}
          text={inputValue}
          onTextChange={setInputValue}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default App;
