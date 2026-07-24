'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageLayout from '@/components/shared/PageLayout';
import SectionHeading from '@/components/shared/SectionHeading';
import GlassCard from '@/components/shared/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquarePlus, Send, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'payment_issue', label: 'Payment issue' },
  { value: 'rank_purchase_issue', label: 'Rank purchase issue' },
  { value: 'bug_report', label: 'Bug report' },
  { value: 'general_support', label: 'General support' },
  { value: 'other', label: 'Other' },
];

const STATUS_CLASS = {
  open: 'bg-primary/20 text-primary',
  pending: 'bg-yellow-500/20 text-yellow-400',
  closed: 'bg-muted text-muted-foreground',
};

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function formatCategory(category) {
  return CATEGORIES.find((item) => item.value === category)?.label || category;
}

export default function Support() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general_support');
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const knownMessageId = useRef(null);
  const knownStatus = useRef(null);

  const ticketsQuery = useQuery({
    queryKey: ['tickets'],
    queryFn: () => request('/api/tickets'),
    refetchInterval: 15000,
  });
  const tickets = ticketsQuery.data?.tickets ?? [];

  const ticketQuery = useQuery({
    queryKey: ['ticket', selectedId],
    queryFn: () => request(`/api/tickets/${selectedId}`),
    enabled: !!selectedId,
    refetchInterval: 15000,
  });
  const selected = ticketQuery.data?.ticket;
  const messages = ticketQuery.data?.messages ?? [];

  useEffect(() => {
    if (!selectedId && tickets.length) setSelectedId(tickets[0].id);
  }, [selectedId, tickets]);

  useEffect(() => {
    if (!selected) return;
    const latest = messages.at(-1);
    if (knownMessageId.current && latest?.id !== knownMessageId.current && latest?.sender_id !== selected.user_id) {
      toast.info('New staff reply');
    }
    if (knownStatus.current && knownStatus.current !== 'closed' && selected.status === 'closed') {
      toast.info('Ticket closed');
    }
    knownMessageId.current = latest?.id ?? null;
    knownStatus.current = selected.status;
  }, [messages, selected]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['tickets'] });
    queryClient.invalidateQueries({ queryKey: ['ticket', selectedId] });
  };

  const createTicket = useMutation({
    mutationFn: (body) => request('/api/tickets', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: ({ ticket }) => {
      toast.success('Ticket created');
      setSubject('');
      setMessage('');
      setSelectedId(ticket.id);
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const sendReply = useMutation({
    mutationFn: () => request(`/api/tickets/${selectedId}/messages`, { method: 'POST', body: JSON.stringify({ message: reply }) }),
    onSuccess: () => {
      setReply('');
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const closeTicket = useMutation({
    mutationFn: () => request(`/api/tickets/${selectedId}`, { method: 'PATCH', body: JSON.stringify({ status: 'closed' }) }),
    onSuccess: () => {
      toast.success('Ticket closed');
      refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  function submitTicket(event) {
    event.preventDefault();
    createTicket.mutate({ subject, category, message });
  }

  return (
    <PageLayout>
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeading title="Support" subtitle="Open a ticket and our staff will help you here." />

          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 mt-8">
            <div className="space-y-4">
              <GlassCard hover={false} className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquarePlus className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">New Ticket</h2>
                </div>
                <form className="space-y-3" onSubmit={submitTicket}>
                  <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Subject" maxLength={120} required className="bg-secondary/50" />
                  <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full h-10 rounded-md border border-input bg-secondary/50 px-3 text-sm">
                    {CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                  <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Describe how we can help..." maxLength={4000} required className="min-h-28 bg-secondary/50" />
                  <Button className="w-full bg-primary hover:bg-primary/90" disabled={createTicket.isPending}>
                    <MessageSquarePlus className="w-4 h-4 mr-2" /> {createTicket.isPending ? 'Creating...' : 'Create Ticket'}
                  </Button>
                </form>
              </GlassCard>

              <GlassCard hover={false} className="p-3">
                <h2 className="font-semibold px-2 py-2">Your Tickets</h2>
                {ticketsQuery.isLoading ? <p className="p-3 text-sm text-muted-foreground">Loading tickets...</p> : null}
                {!ticketsQuery.isLoading && tickets.length === 0 ? <p className="p-3 text-sm text-muted-foreground">No tickets yet.</p> : null}
                <div className="space-y-1">
                  {tickets.map((ticket) => (
                    <button key={ticket.id} type="button" onClick={() => setSelectedId(ticket.id)} className={`w-full text-left rounded-lg p-3 transition-colors ${selectedId === ticket.id ? 'bg-primary/10' : 'hover:bg-secondary/60'}`}>
                      <div className="flex items-center justify-between gap-2"><span className="font-medium text-sm truncate">{ticket.subject}</span><span className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${STATUS_CLASS[ticket.status]}`}>{ticket.status}</span></div>
                      <p className="text-xs text-muted-foreground mt-1">{formatCategory(ticket.category)}</p>
                    </button>
                  ))}
                </div>
              </GlassCard>
            </div>

            <GlassCard hover={false} className="p-5 min-h-[520px]">
              {!selected ? <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Select a ticket to view its conversation.</div> : (
                <div className="h-full flex flex-col">
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-border/30">
                    <div><h2 className="font-semibold">{selected.subject}</h2><p className="text-xs text-muted-foreground mt-1">{formatCategory(selected.category)} {selected.assigned_staff?.display_name ? `• Assigned to ${selected.assigned_staff.display_name}` : ''}</p></div>
                    <div className="flex items-center gap-2"><span className={`text-xs px-2 py-1 rounded-full capitalize ${STATUS_CLASS[selected.status]}`}>{selected.status}</span>{selected.status !== 'closed' ? <Button variant="outline" size="sm" onClick={() => closeTicket.mutate()} disabled={closeTicket.isPending}><XCircle className="w-4 h-4 mr-1" />Close</Button> : null}</div>
                  </div>
                  <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-[420px]">
                    {messages.map((item) => {
                      const mine = item.sender_id === selected.user_id;
                      return <div key={item.id} className={`max-w-[85%] rounded-xl p-3 ${mine ? 'ml-auto bg-primary/15 border border-primary/20' : 'bg-secondary/50'}`}><p className="text-xs text-muted-foreground mb-1">{mine ? 'You' : item.sender?.display_name || item.sender?.email || 'Staff'}</p><p className="text-sm whitespace-pre-wrap">{item.message}</p></div>;
                    })}
                  </div>
                  {selected.status !== 'closed' ? <form className="pt-4 border-t border-border/30 flex gap-2" onSubmit={(event) => { event.preventDefault(); if (reply.trim()) sendReply.mutate(); }}><Textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a reply..." className="min-h-10 bg-secondary/50" maxLength={4000} /><Button disabled={sendReply.isPending}><Send className="w-4 h-4" /></Button></form> : <p className="pt-4 border-t border-border/30 text-sm text-muted-foreground">This ticket is closed.</p>}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
