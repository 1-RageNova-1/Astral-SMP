'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Send, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CLASS = {
  open: 'bg-primary/20 text-primary',
  pending: 'bg-yellow-500/20 text-yellow-400',
  closed: 'bg-muted text-muted-foreground',
};

const CATEGORY_LABELS = {
  payment_issue: 'Payment issue',
  rank_purchase_issue: 'Rank purchase issue',
  bug_report: 'Bug report',
  general_support: 'General support',
  other: 'Other',
};

async function request(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export default function TicketPanel() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [reply, setReply] = useState('');
  const knownMessageId = useRef(null);
  const knownTicketIds = useRef(null);

  const listQuery = useQuery({
    queryKey: ['staff-tickets', filter],
    queryFn: () => request(`/api/admin/tickets${filter === 'all' ? '' : `?status=${filter}`}`),
    refetchInterval: 15000,
  });
  const tickets = listQuery.data?.tickets ?? [];

  const ticketQuery = useQuery({
    queryKey: ['staff-ticket', selectedId],
    queryFn: () => request(`/api/admin/tickets/${selectedId}`),
    enabled: !!selectedId,
    refetchInterval: 15000,
  });
  const ticket = ticketQuery.data?.ticket;
  const messages = ticketQuery.data?.messages ?? [];

  useEffect(() => {
    const ids = new Set(tickets.map((item) => item.id));
    if (knownTicketIds.current && tickets.some((item) => !knownTicketIds.current.has(item.id) && item.status === 'open')) {
      toast.info('New ticket created');
    }
    knownTicketIds.current = ids;
  }, [tickets]);

  useEffect(() => {
    if (!selectedId && tickets.length) setSelectedId(tickets[0].id);
  }, [selectedId, tickets]);

  useEffect(() => {
    const latest = messages.at(-1);
    if (knownMessageId.current && latest?.id !== knownMessageId.current && latest?.sender_id === ticket?.user_id) {
      toast.info('New user reply');
    }
    knownMessageId.current = latest?.id ?? null;
  }, [messages, ticket]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['staff-tickets'] });
    queryClient.invalidateQueries({ queryKey: ['staff-ticket', selectedId] });
  };

  const updateTicket = useMutation({
    mutationFn: (body) => request(`/api/admin/tickets/${selectedId}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: () => { toast.success('Ticket updated'); refresh(); },
    onError: (error) => toast.error(error.message),
  });
  const sendReply = useMutation({
    mutationFn: () => request(`/api/admin/tickets/${selectedId}/messages`, { method: 'POST', body: JSON.stringify({ message: reply }) }),
    onSuccess: () => { setReply(''); toast.success('Reply sent'); refresh(); },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div><h1 className="text-2xl font-bold text-foreground">Support Tickets</h1><p className="text-sm text-muted-foreground mt-1">Manage player support conversations.</p></div>
        <select value={filter} onChange={(event) => { setFilter(event.target.value); setSelectedId(null); }} className="h-9 rounded-md border border-input bg-secondary/50 px-3 text-sm">
          <option value="all">All statuses</option><option value="open">Open</option><option value="pending">Pending</option><option value="closed">Closed</option>
        </select>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4">
        <div className="glass rounded-xl p-3 max-h-[700px] overflow-y-auto">
          {listQuery.isLoading ? <p className="p-3 text-sm text-muted-foreground">Loading tickets...</p> : null}
          {!listQuery.isLoading && tickets.length === 0 ? <p className="p-3 text-sm text-muted-foreground">No tickets match this filter.</p> : null}
          {tickets.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`w-full text-left p-3 rounded-lg mb-1 ${selectedId === item.id ? 'bg-primary/10' : 'hover:bg-secondary/60'}`}><div className="flex gap-2 justify-between"><span className="font-medium text-sm truncate">{item.subject}</span><span className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${STATUS_CLASS[item.status]}`}>{item.status}</span></div><p className="text-xs text-muted-foreground mt-1">{item.owner?.display_name || item.owner?.email || 'Unknown user'} • {CATEGORY_LABELS[item.category] || item.category}</p></button>)}
        </div>
        <div className="glass rounded-xl p-5 min-h-[560px]">
          {!ticket ? <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Select a ticket to open the conversation.</div> : <div className="h-full flex flex-col"><div className="pb-4 border-b border-border/30"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold">{ticket.subject}</h2><p className="text-xs text-muted-foreground mt-1">From {ticket.owner?.display_name || ticket.owner?.email || 'Unknown user'} • {CATEGORY_LABELS[ticket.category] || ticket.category}</p></div><span className={`text-xs px-2 py-1 rounded-full capitalize h-fit ${STATUS_CLASS[ticket.status]}`}>{ticket.status}</span></div><div className="flex flex-wrap gap-2 mt-3"><Button variant="outline" size="sm" onClick={() => updateTicket.mutate({ assign_to_self: true })} disabled={updateTicket.isPending}><UserPlus className="w-4 h-4 mr-1" />{ticket.assigned_staff_id ? 'Assigned' : 'Assign to me'}</Button>{['open', 'pending', 'closed'].map((status) => <Button key={status} size="sm" variant={ticket.status === status ? 'default' : 'outline'} onClick={() => updateTicket.mutate({ status })} disabled={ticket.status === status || updateTicket.isPending} className="capitalize">{status}</Button>)}</div></div><div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-[430px]">{messages.map((item) => { const fromUser = item.sender_id === ticket.user_id; return <div key={item.id} className={`max-w-[85%] rounded-xl p-3 ${fromUser ? 'bg-secondary/50' : 'ml-auto bg-primary/15 border border-primary/20'}`}><p className="text-xs text-muted-foreground mb-1">{fromUser ? ticket.owner?.display_name || 'User' : 'You'}</p><p className="text-sm whitespace-pre-wrap">{item.message}</p></div>; })}</div>{ticket.status !== 'closed' ? <form className="flex gap-2 pt-4 border-t border-border/30" onSubmit={(event) => { event.preventDefault(); if (reply.trim()) sendReply.mutate(); }}><Textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a staff reply..." className="min-h-10 bg-secondary/50" maxLength={4000} /><Button disabled={sendReply.isPending}><Send className="w-4 h-4" /></Button></form> : <p className="pt-4 border-t border-border/30 text-sm text-muted-foreground flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />This ticket is closed.</p>}</div>}
        </div>
      </div>
    </div>
  );
}
