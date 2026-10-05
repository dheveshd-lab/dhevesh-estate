import React, { useState, useRef, useEffect } from 'react';
import { BusModel, Booking } from '../../types/bus';
import { FLEET_BUSES, FLEET_TELEMETRY } from '../../data/fleetData';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Compass,
  MapPin,
  Eye,
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface AIOperationsAgentProps {
  isOpen: boolean;
  onClose: () => void;
  onEnter3DInterior: (busId?: string, seatId?: string) => void;
  onOpenFleetMap: (busId?: string) => void;
  onOpenOperatorPanel: (tab?: string) => void;
  onCancelBooking: (bookingId: string) => void;
  allBookings: Booking[];
  metrics: {
    totalBuses: number;
    activeTrips: number;
    revenue: number;
    paidCount: number;
    pendingAmount: number;
    pendingCount: number;
    totalBookingsCount: number;
    totalSeats: number;
    totalBookedSeats: number;
  };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionButtons?: Array<{
    label: string;
    actionType: 'open_3d' | 'open_map' | 'locate_seat' | 'cancel_booking' | 'open_manifest';
    payload?: any;
    variant?: 'primary' | 'danger' | 'secondary';
  }>;
}

const INITIAL_SUGGESTIONS = [
  'Where are my buses?',
  'How many seats are available today?',
  'Show pending payments.',
  'Which bus has the highest occupancy?',
  'Are any buses delayed?',
  'Where is BUS-101 currently?',
  'Show today\'s passenger manifest.',
  'How are operations today?',
];

export const AIOperationsAgent: React.FC<AIOperationsAgentProps> = ({
  isOpen,
  onClose,
  onEnter3DInterior,
  onOpenFleetMap,
  onOpenOperatorPanel,
  onCancelBooking,
  allBookings,
  metrics,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `**AI Operations Agent online.** Connected to live fleet telemetry, bookings database, and seating allocations.\n\nAsk me about live bus locations, passenger manifests, available seats, delays, or pending collections.`,
      timestamp: 'Now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  // Handle Action buttons embedded in assistant replies
  const handleActionClick = (action: any) => {
    switch (action.actionType) {
      case 'open_3d':
        onEnter3DInterior(action.payload?.busId, action.payload?.seatId);
        onClose();
        break;
      case 'open_map':
        onOpenFleetMap(action.payload?.busId);
        onClose();
        break;
      case 'locate_seat':
        onEnter3DInterior(action.payload?.busId, action.payload?.seatId);
        onClose();
        break;
      case 'cancel_booking':
        if (action.payload?.bookingId) {
          onCancelBooking(action.payload.bookingId);
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: `✓ **Booking ${action.payload.bookingId} successfully cancelled.** The seat has returned to AVAILABLE status in the 3D cabin manifest.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
        break;
      case 'open_manifest':
        onOpenOperatorPanel('passengers');
        onClose();
        break;
    }
  };

  // Send query to AI Agent
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Prepare real-time operational context
    const operationalContext = {
      fleet: FLEET_BUSES.map((b) => ({
        id: b.id,
        code: b.code,
        name: b.name,
        regNumber: b.regNumber,
        route: b.route,
        totalSeats: b.seats.length,
        baseFare: b.baseFare,
      })),
      telemetry: FLEET_TELEMETRY,
      bookings: allBookings.map((b) => ({
        id: b.id,
        busId: b.busId,
        seatLabel: b.seatLabel,
        passengerName: b.passenger.name,
        phone: b.passenger.phone ? `${b.passenger.phone.slice(0, 7)}****` : 'N/A', // Mask phone for privacy
        boardingPoint: b.boardingPoint,
        droppingPoint: b.droppingPoint,
        fare: b.fare,
        paymentStatus: b.paymentStatus,
        status: b.status,
      })),
      metrics,
    };

    try {
      const response = await fetch('/api/ai-agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-5).map((m) => ({ role: m.role, content: m.content })),
          operationalContext,
        }),
      });

      const data = await response.json();
      const replyText = data.reply || 'Operational data retrieved.';

      // Determine contextual action buttons based on query content
      const q = query.toLowerCase();
      const actions: ChatMessage['actionButtons'] = [];

      if (q.includes('bus') || q.includes('where') || q.includes('gps') || q.includes('map')) {
        actions.push({
          label: 'View Fleet Radar Map',
          actionType: 'open_map',
          payload: { busId: q.includes('102') ? 'bus-102' : q.includes('103') ? 'bus-103' : 'bus-101' },
          variant: 'primary',
        });
      }

      if (q.includes('interior') || q.includes('3d') || q.includes('seat')) {
        actions.push({
          label: 'Open 3D Bus Cabin',
          actionType: 'open_3d',
          payload: { busId: q.includes('102') ? 'bus-102' : q.includes('103') ? 'bus-103' : 'bus-101' },
          variant: 'secondary',
        });
      }

      if (q.includes('manifest') || q.includes('passenger')) {
        actions.push({
          label: 'View Passenger Manifest',
          actionType: 'open_manifest',
          variant: 'secondary',
        });
      }

      // Check if user is asking to cancel a booking
      if (q.includes('cancel')) {
        const found = allBookings.find((b) => q.toUpperCase().includes(b.id.toUpperCase()));
        if (found) {
          actions.push({
            label: `Confirm Cancel ${found.id} (${found.seatLabel})`,
            actionType: 'cancel_booking',
            payload: { bookingId: found.id },
            variant: 'danger',
          });
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionButtons: actions.length > 0 ? actions : undefined,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Unable to query live operational service. Please check network status.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-neutral-950/98 backdrop-blur-xl border-l border-neutral-800 text-neutral-100 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">AI Operations Agent</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-neutral-400 font-mono">
              Live Fleet Intelligence · Gemini 3.8
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Questions Quick Carousel */}
      <div className="px-4 py-2 bg-neutral-900/60 border-b border-neutral-800/80 overflow-x-auto">
        <div className="flex items-center gap-1.5 whitespace-nowrap text-[11px]">
          <span className="text-neutral-500 font-mono text-[10px] pr-1">Try:</span>
          {INITIAL_SUGGESTIONS.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(suggestion)}
              className="px-2.5 py-1 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-full transition-colors cursor-pointer border border-neutral-700/60 shrink-0"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-neutral-400 font-mono">
              {msg.role === 'assistant' ? (
                <>
                  <Bot className="w-3.5 h-3.5 text-sky-400" />
                  <span>AI Agent</span>
                </>
              ) : (
                <>
                  <span>Operator</span>
                  <User className="w-3.5 h-3.5 text-neutral-300" />
                </>
              )}
              <span>· {msg.timestamp}</span>
            </div>

            <div
              className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white rounded-br-xs font-medium'
                  : 'bg-neutral-900/90 border border-neutral-800 text-neutral-200 rounded-bl-xs shadow-md whitespace-pre-wrap'
              }`}
            >
              {msg.content}

              {/* Contextual Action Buttons */}
              {msg.actionButtons && msg.actionButtons.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex flex-wrap gap-1.5">
                  {msg.actionButtons.map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionClick(btn)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-sm ${
                        btn.variant === 'danger'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900'
                          : btn.variant === 'primary'
                          ? 'bg-sky-600 text-white hover:bg-sky-500'
                          : 'bg-neutral-800 text-neutral-200 border border-neutral-700 hover:bg-neutral-700'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl text-neutral-400 text-xs animate-pulse">
            <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
            <span>Querying live fleet GPS and operational database...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask AI about bus locations, seats, revenue..."
          disabled={isLoading}
          className="flex-1 bg-neutral-950 border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="p-2 bg-sky-600 hover:bg-sky-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-xl transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
