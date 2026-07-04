import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot } from 'lucide-react';
import api from '../../services/api.js';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Namaste! I am the BrahamBaba Temple Assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { text: userText, isBot: false }]);
    setLoading(true);

    try {
      const res = await api.post('/chat/query', { message: userText });
      setMessages(prev => [...prev, { text: res.data.reply, isBot: true }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "Forgive me, I am facing trouble connecting. Please try again.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-spiritual">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-spiritual-gradient text-white p-4 rounded-full shadow-2xl hover:scale-110 transition duration-300 flex items-center justify-center animate-bounce"
          title="Temple Assistant"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-2xl shadow-2xl w-80 md:w-96 h-[480px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-spiritual-gradient p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-amber-300" />
              <div>
                <h4 className="font-bold text-sm">Temple AI Assistant</h4>
                <span className="text-[10px] text-amber-200">Online | Wish Fulfilling Help</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Window */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF8F5] dark:bg-slate-950">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    msg.isBot
                      ? 'bg-amber-100/80 text-amber-900 rounded-tl-none border border-amber-200/40 dark:bg-slate-800 dark:text-amber-100 dark:border-slate-700'
                      : 'bg-saffron-600 text-white rounded-tr-none'
                  }`}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-amber-50 dark:bg-slate-800 text-gray-500 rounded-2xl px-3 py-2 text-xs animate-pulse">
                  Typing a peaceful reply...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about timings, history, donations..."
              className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 focus:outline-none focus:border-saffron-500 dark:text-white"
            />
            <button
              type="submit"
              className="bg-saffron-600 hover:bg-saffron-700 text-white p-2 rounded-xl transition flex items-center justify-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
export { ChatBot };
