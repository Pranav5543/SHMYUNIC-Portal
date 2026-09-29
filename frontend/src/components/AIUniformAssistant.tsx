'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Product } from '@/types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  recommendedProducts?: Product[];
  actionLink?: { text: string; url: string };
}

export default function AIUniformAssistant({ currentProducts = [] }: { currentProducts?: Product[] }) {
  const { user, activeChild, activeSchool, cart, addToCart, showToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Size Calculator State inside AI
  const [showSizeCalculator, setShowSizeCalculator] = useState(false);
  const [calcAge, setCalcAge] = useState<string>('12');
  const [calcHeight, setCalcHeight] = useState<string>('148');
  const [calcWeight, setCalcWeight] = useState<string>('40');
  const [calcFit, setCalcFit] = useState<'SLIM' | 'REGULAR' | 'RELAXED'>('REGULAR');
  const [calculatedSizeResult, setCalculatedSizeResult] = useState<string | null>(null);

  // Initial welcome message configured with current school context
  useEffect(() => {
    if (messages.length === 0) {
      const childGreeting = activeChild
        ? `shopping for **${activeChild.name}** (${activeChild.grade}) at **${activeSchool?.name || activeChild.schoolName || 'your partner school'}**`
        : `exploring official school uniform collections`;

      setMessages([
        {
          id: 'welcome-msg',
          sender: 'ai',
          text: `👋 Hello ${user?.firstName || 'there'}! I am your **ShopMyUniform AI Assistant**. I see you are currently ${childGreeting}.\n\nHow can I help you today? You can ask about required uniforms, check missing items in your cart, find your child's exact size, or track existing orders!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [activeChild, activeSchool, user]);

  const quickPrompts = [
    { label: `Grade Requirements`, query: `What uniform items are required for ${activeChild?.grade || 'Grade 7'}?` },
    { label: `Complete My Uniform`, query: `What items am I missing from my cart for ${activeSchool?.name || 'my school'}?` },
    { label: `PE & Sports Uniforms`, query: `Show me the official PE and athletic sportswear.` },
    { label: `Winter Uniform Checklist`, query: `What are the winter uniform requirements (blazers & sweaters)?` },
    { label: `Find My Child's Size`, query: `Can you calculate my child's uniform size?` },
    { label: `Exchange Policy`, query: `How do I request a size exchange after delivery?` }
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // AI Reasoning engine with contextual catalog awareness
    setTimeout(() => {
      let aiReply = '';
      let recommended: Product[] = [];
      let link: { text: string; url: string } | undefined = undefined;

      const qLower = query.toLowerCase();
      const schoolName = activeSchool?.name || activeChild?.schoolName || 'Green Valley Public School';
      const grade = activeChild?.grade || 'Grade 7';

      if (qLower.includes('size') || qLower.includes('fit') || qLower.includes('measurement')) {
        setShowSizeCalculator(true);
        aiReply = `I have opened the **Interactive AI Size Calculator** below! Please specify your child's age, height, and weight to calculate the recommended size tailored to ${schoolName}'s apparel sizing standards.`;
      } else if (qLower.includes('missing') || qLower.includes('complete') || qLower.includes('cart')) {
        // Complete My Uniform analysis
        const cartProductNames = cart.map(c => c.productName.toLowerCase());
        const hasShirt = cartProductNames.some(n => n.includes('shirt') || n.includes('polo'));
        const hasTrouser = cartProductNames.some(n => n.includes('trouser') || n.includes('skirt') || n.includes('pant'));
        const hasTie = cartProductNames.some(n => n.includes('tie'));
        const hasBelt = cartProductNames.some(n => n.includes('belt'));
        const hasSocks = cartProductNames.some(n => n.includes('sock'));
        const hasShoes = cartProductNames.some(n => n.includes('shoe'));

        const missingTypes: string[] = [];
        if (!hasShirt) missingTypes.push('Formal Uniform Shirt / Blouse');
        if (!hasTrouser) missingTypes.push('Formal Uniform Trousers / Skirt');
        if (!hasTie) missingTypes.push('School Necktie');
        if (!hasBelt) missingTypes.push('Uniform Belt');
        if (!hasSocks) missingTypes.push('Official Socks');
        if (!hasShoes) missingTypes.push('Black Leather School Shoes');

        if (missingTypes.length === 0) {
          aiReply = `🎉 Fantastic! Your cart appears to have all essential daily uniform components for ${grade} at ${schoolName}. You may also want to check PE sportswear and house competition apparel!`;
        } else {
          aiReply = `📋 Based on ${schoolName}'s official uniform guidelines for **${grade}**, here are recommended items currently missing from your cart:\n\n` +
            missingTypes.map(m => `• **${m}**`).join('\n') +
            `\n\nI have gathered the matching products from your school's catalog below for easy 1-click addition:`;

          recommended = currentProducts.filter(p => {
            const pName = p.name.toLowerCase();
            return (
              (!hasTie && pName.includes('tie')) ||
              (!hasBelt && pName.includes('belt')) ||
              (!hasShirt && pName.includes('shirt')) ||
              (!hasTrouser && (pName.includes('trouser') || pName.includes('skirt')))
            );
          }).slice(0, 3);
        }
      } else if (qLower.includes('winter') || qLower.includes('blazer') || qLower.includes('sweater') || qLower.includes('hoodie')) {
        aiReply = `❄️ **Winter Uniform Requirements for ${schoolName} (${grade}):**\n\n1. **Official School Blazer** (Crested with gold/silver embroidery)\n2. **V-Neck Knitted Pullover / Sweater** (Thermal wool blend)\n3. **Full Winter Trousers / Flannel Skirt**\n\nAll winter wear items are pre-shrunk and color-fast certified.`;
        recommended = currentProducts.filter(p => {
          const cat = (typeof p.category === 'object' ? (p.category as any)?.name : p.category || '').toLowerCase();
          return cat.includes('blazer') || cat.includes('sweater') || cat.includes('jacket') || p.name.toLowerCase().includes('blazer') || p.name.toLowerCase().includes('sweater');
        }).slice(0, 3);
      } else if (qLower.includes('pe') || qLower.includes('sport') || qLower.includes('house') || qLower.includes('track')) {
        aiReply = `🏃 **Sports & PE Uniform Guidelines for ${schoolName}:**\n\n• **Physical Education**: Dry-fit honeycomb athletic T-shirt + Flexible Navy/Grey Track Pants.\n• **Inter-House Competitions**: House Polo T-shirt in allotted house color (Agni/Varun/Prithvi/Vayu or Ruby/Sapphire/Emerald/Gold or Phoenix/Hydra/Pegasus/Auriga).\n• **Footwear**: Non-marking multi-court sports trainers.`;
        recommended = currentProducts.filter(p => {
          const cat = (typeof p.category === 'object' ? (p.category as any)?.name : p.category || '').toLowerCase();
          return cat.includes('sport') || cat.includes('house') || p.name.toLowerCase().includes('pe') || p.name.toLowerCase().includes('track') || p.name.toLowerCase().includes('house');
        }).slice(0, 3);
      } else if (qLower.includes('exchange') || qLower.includes('return') || qLower.includes('replace')) {
        aiReply = `🔄 **Doorstep 7-Day Size Exchange Policy:**\n\nIf any uniform item does not fit your child perfectly, you can request a **free doorstep size exchange** within 7 days of delivery:\n\n1. Go to **My Orders**\n2. Click **Request Exchange** on the delivered order\n3. Choose the replacement size\n4. Our courier will deliver the new size and collect the old one simultaneously!`;
        link = { text: 'View My Orders for Exchange', url: '/shop/orders' };
      } else if (qLower.includes('track') || qLower.includes('order') || qLower.includes('delivery')) {
        aiReply = `📦 **Live Order Tracking:**\n\nAll orders placed on ShopMyUniform are shipped via **Delhivery Express** with full SMS and live milestone tracking. You can view your current order progress anytime in the Orders section.`;
        link = { text: 'Open Order Tracking', url: '/shop/orders' };
      } else {
        // General Grade Uniform Requirements
        aiReply = `🏫 **Official Uniform Requirements for ${grade} at ${schoolName}:**\n\n` +
          `• **Daily Formal**: Crisp white or sky blue uniform shirt with school monogram, charcoal/navy trousers or pleated skirts, crest tie, canvas/leather belt, black shoes.\n` +
          `• **Physical Education**: Breathable PE jersey & track pants for sports days.\n` +
          `• **House Days**: Inter-house team athletic tee for sports & intramural competitions.\n` +
          `• **Accessories**: School backpack, thermal bottle, and student ID badge.`;

        recommended = currentProducts.slice(0, 3);
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedProducts: recommended.length > 0 ? recommended : undefined,
        actionLink: link
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleCalculateSize = () => {
    const age = parseInt(calcAge, 10) || 12;
    const height = parseInt(calcHeight, 10) || 148;
    const weight = parseInt(calcWeight, 10) || 40;

    let size = '32';
    if (height < 125 || age <= 6) size = '26';
    else if (height < 135 || age <= 8) size = '28';
    else if (height < 145 || age <= 10) size = '30';
    else if (height < 155 || age <= 12) size = '32';
    else if (height < 165 || age <= 14) size = '34';
    else if (height < 175 || age <= 16) size = '36';
    else size = '38';

    if (calcFit === 'RELAXED' && ['28', '30', '32', '34'].includes(size)) {
      const nextSizes: Record<string, string> = { '28': '30', '30': '32', '32': '34', '34': '36' };
      size = nextSizes[size] || size;
    }

    setCalculatedSizeResult(size);

    const sizeMsg: Message = {
      id: `calc-${Date.now()}`,
      sender: 'ai',
      text: `🎯 **AI Recommended Size: Size ${size}**\n\nBased on your child's measurements (Age: ${age} yrs, Height: ${height} cm, Weight: ${weight} kg, Fit: ${calcFit}), the recommended uniform size is **Size ${size}**.\n\n*Note: If your child is in a growth phase, Size ${size} provides standard room for comfortable daily school movement.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, sizeMsg]);
    setShowSizeCalculator(false);
  };

  return (
    <>
      {/* Floating AI Uniform Assistant Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#FF561F] to-[#E64A1A] text-white px-5 py-3.5 rounded-full shadow-2xl hover:scale-105 hover:shadow-orange-500/40 transition-all duration-300 border-2 border-white/20"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5" />
          <span className="material-symbols-outlined text-xl">auto_awesome</span>
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-wider font-extrabold block text-orange-100 leading-tight">
              Smart Assistant
            </span>
            <span className="text-xs font-black tracking-tight leading-tight">
              Ask Uniform AI
            </span>
          </div>
        </button>
      </div>

      {/* AI Assistant Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full sm:max-w-lg h-[85vh] sm:h-[680px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#102a43] to-[#243b53] text-white p-4.5 px-6 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="material-symbols-outlined text-[#FF561F] text-xl">auto_awesome</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    ShopMyUniform AI Assistant
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#FF561F] text-white">AI</span>
                  </h3>
                  <p className="text-[11px] text-slate-300 truncate max-w-[280px]">
                    Context: {activeChild ? `${activeChild.name} • ${activeChild.schoolName || activeSchool?.name || 'School'}` : 'School Uniform Advisor'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Quick Context Strip */}
            {activeChild && (
              <div className="bg-orange-50 border-b border-orange-100 px-6 py-2 flex items-center justify-between text-xs text-orange-950">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#FF561F]">face</span>
                  Child: {activeChild.name} ({activeChild.grade})
                </span>
                <span className="text-[10px] font-extrabold bg-[#FF561F]/10 text-[#FF561F] px-2 py-0.5 rounded uppercase">
                  {activeSchool?.code || 'CBSE/ICSE'}
                </span>
              </div>
            )}

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8F9FA]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-[#102a43] text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line font-medium">{msg.text}</div>

                    {/* AI Embedded Recommended Products */}
                    {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                      <div className="mt-3.5 space-y-2 border-t border-gray-100 pt-3">
                        <span className="text-[10px] font-extrabold uppercase text-[#FF561F] tracking-wider block">
                          Matching Catalog Essentials:
                        </span>
                        {msg.recommendedProducts.map((p) => (
                          <div
                            key={p.id}
                            className="bg-gray-50 border border-gray-200 rounded-xl p-2 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <img
                                src={p.images?.[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=80&q=80'}
                                alt={p.name}
                                className="w-9 h-11 object-cover rounded-lg border border-gray-200 shrink-0"
                              />
                              <div className="truncate">
                                <div className="font-bold text-[11px] text-[#102a43] truncate">{p.name}</div>
                                <div className="text-[10px] font-extrabold text-[#FF561F]">₹{p.price || 599}</div>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                addToCart(p, 'M', 1);
                                showToast(`Added ${p.name} to cart!`);
                              }}
                              className="px-2.5 py-1.5 bg-[#FF561F] hover:bg-[#E64A1A] text-white font-extrabold rounded-lg text-[10px] shrink-0 transition-colors"
                            >
                              + Add
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Link Button */}
                    {msg.actionLink && (
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <Link
                          href={msg.actionLink.url}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF561F] hover:underline"
                        >
                          <span>{msg.actionLink.text}</span>
                          <span className="material-symbols-outlined text-xs">&rarr;</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-gray-400 bg-white border border-gray-200 px-4 py-2.5 rounded-2xl w-fit text-xs font-bold shadow-sm">
                  <span className="w-1.5 h-1.5 bg-[#FF561F] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#FF561F] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#FF561F] rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[10px]">Analyzing school catalog...</span>
                </div>
              )}

              {/* Interactive AI Size Calculator Drawer Inside Assistant */}
              {showSizeCalculator && (
                <div className="bg-white rounded-2xl border-2 border-[#FF561F]/30 p-4.5 shadow-md animate-fade-in space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#FF561F] text-base">straighten</span>
                      <h4 className="text-xs font-black text-[#102a43]">AI Size Calculator</h4>
                    </div>
                    <button
                      onClick={() => setShowSizeCalculator(false)}
                      className="text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Age (Years)</label>
                      <input
                        type="number"
                        value={calcAge}
                        onChange={e => setCalcAge(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#FF561F]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Height (cm)</label>
                      <input
                        type="number"
                        value={calcHeight}
                        onChange={e => setCalcHeight(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#FF561F]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        value={calcWeight}
                        onChange={e => setCalcWeight(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:border-[#FF561F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Fit Style</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['SLIM', 'REGULAR', 'RELAXED'] as const).map(fit => (
                        <button
                          key={fit}
                          type="button"
                          onClick={() => setCalcFit(fit)}
                          className={`py-1 rounded-lg text-[10px] font-extrabold border transition-all ${
                            calcFit === fit
                              ? 'bg-[#102a43] text-white border-[#102a43]'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          {fit}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleCalculateSize}
                    className="w-full py-2 bg-[#FF561F] hover:bg-[#E64A1A] text-white text-xs font-extrabold rounded-xl shadow-md transition-colors"
                  >
                    Calculate Recommended Size
                  </button>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="bg-white border-t border-gray-100 p-3 overflow-x-auto flex items-center gap-1.5 shrink-0">
              {quickPrompts.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleSendMessage(p.query)}
                  className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-orange-50 hover:text-[#FF561F] hover:border-[#FF561F]/30 border border-gray-200 text-[11px] font-bold text-gray-700 whitespace-nowrap transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs text-[#FF561F]">chat_bubble</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>

            {/* Text Input Footer */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={e => setInputQuery(e.target.value)}
                  placeholder="Ask about uniforms, size calculation, missing items..."
                  className="w-full pl-4 pr-12 py-3 bg-[#F4F5F7] border border-gray-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#FF561F] transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim()}
                  className={`absolute right-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    inputQuery.trim()
                      ? 'bg-[#FF561F] text-white shadow-md'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">arrow_upward</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
