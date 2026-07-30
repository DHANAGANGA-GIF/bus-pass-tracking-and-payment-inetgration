import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, X, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AiChatWidgetProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export const AiChatWidget: React.FC<AiChatWidgetProps> = ({ isOpen: controlledIsOpen, onToggle }) => {
  const [isOpen, setIsOpen] = useState(controlledIsOpen ?? false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your BusPass Pro assistant. I can help you with booking passes, checking payment status, managing your account, and answering questions about our platform.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleOpen = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response with keyword matching
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200));

    const userInput = userMessage.content.toLowerCase();
    let assistantResponse = '';

    if (userInput.includes('book') || userInput.includes('pass') || userInput.includes('ticket')) {
      assistantResponse = 'To book a bus pass, go to the "Book Pass" page from the navigation menu. Select your route, choose a duration (Monthly, Quarterly, Half-Yearly, or Yearly), pick your passenger type, and proceed to payment. Your digital pass will be activated instantly after payment confirmation!';
    } else if (userInput.includes('pay') || userInput.includes('payment') || userInput.includes('razorpay')) {
      assistantResponse = 'We accept payments via Razorpay (UPI, Credit/Debit Cards, Net Banking, Wallets) and Stripe. After booking, you\'ll be redirected to a secure payment gateway. Once payment is confirmed, your pass is activated immediately and you can download your PDF pass.';
    } else if (userInput.includes('refund') || userInput.includes('cancel')) {
      assistantResponse = 'Pass cancellations are handled by our admin team. You can submit a cancellation request from your dashboard. Refunds are processed within 5-7 business days back to your original payment method. Contact support for urgent cancellation requests.';
    } else if (userInput.includes('route') || userInput.includes('schedule')) {
      assistantResponse = 'You can browse available bus routes on our platform. Each route shows the source, destination, distance, and available pass durations with pricing. Routes are updated regularly to reflect current transit schedules.';
    } else if (userInput.includes('admin') || userInput.includes('manage') || userInput.includes('dashboard')) {
      assistantResponse = 'Admin users can access the Command Center from the navigation menu. There you can manage users, review pass applications, view analytics, and monitor system activity in real-time. Super admins have full access to all features.';
    } else if (userInput.includes('help') || userInput.includes('support') || userInput.includes('contact')) {
      assistantResponse = 'For support, you can reach out through the contact form on our website, email us at support@buspasspro.com, or use the in-app chat. Our support team is available 24/7 to assist you.';
    } else if (userInput.includes('hello') || userInput.includes('hi') || userInput.includes('hey')) {
      assistantResponse = 'Hello! Welcome to BusPass Pro. How can I assist you today? You can ask me about booking passes, making payments, managing your account, or anything else related to our platform.';
    } else if (userInput.includes('qr') || userInput.includes('verify') || userInput.includes('scan')) {
      assistantResponse = 'You can verify digital passes using the QR Scanner in the navigation menu. Simply scan the QR code on a pass or paste the raw QR data string to verify its authenticity and view pass details.';
    } else if (userInput.includes('security') || userInput.includes('safe') || userInput.includes('privacy')) {
      assistantResponse = 'Your security is our top priority. We use JWT authentication with refresh token rotation, Argon2 password hashing, rate limiting, and HMAC-based pass verification. All payment data is processed through secure gateways (Razorpay/Stripe) and we never store your payment credentials.';
    } else {
      assistantResponse = 'I\'m here to help with anything related to BusPass Pro! You can ask me about: booking passes, making payments, managing your account, verifying QR codes, admin features, routes, refunds, or security. What would you like to know?';
    }

    const assistantMessage: Message = { role: 'assistant', content: assistantResponse, timestamp: new Date() };
    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl shadow-blue-500/30 flex items-center justify-center hover:scale-110 transition-transform duration-200"
        aria-label="AI Assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-sm">BusPass AI Assistant</span>
              <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full">LIVE</span>
            </div>
            <button onClick={toggleOpen} className="text-white/70 hover:text-white">
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                  }`}>
                    {msg.role === 'user' ? <User className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-white" />}
                  </div>
                  <div className={`px-3 py-2 rounded-xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-slate-800 px-3 py-2 rounded-xl rounded-bl-none">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-slate-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};