'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import GlassCard from '@/components/shared/GlassCard';
import { ShoppingCart, Newspaper, HeadphonesIcon, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { data = {} } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: api.admin.dashboard,
  });

  const purchases = data.purchases ?? [];
  const tickets = data.tickets ?? [];
  const products = data.products ?? [];
  const posts = data.news ?? [];

  const totalRevenue = purchases.filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-400' },
    { label: 'Total Purchases', value: purchases.length, icon: ShoppingCart, color: 'text-primary' },
    { label: 'Open Tickets', value: openTickets, icon: HeadphonesIcon, color: 'text-yellow-400' },
    { label: 'Products', value: products.length, icon: TrendingUp, color: 'text-accent' },
    { label: 'News Posts', value: posts.length, icon: Newspaper, color: 'text-blue-400' },
  ];

  const statusData = [
    { name: 'Completed', value: purchases.filter(p => p.status === 'completed').length, color: '#22c55e' },
    { name: 'Pending', value: purchases.filter(p => p.status === 'pending').length, color: '#f59e0b' },
    { name: 'Refunded', value: purchases.filter(p => p.status === 'refunded').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const categoryData = ['ranks', 'crates', 'keys', 'cosmetics', 'bundles'].map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    count: purchases.filter(p => products.find(pr => pr.id === p.product_id)?.category === cat).length,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={stat.label} delay={i * 0.05} hover={false} className="p-4">
              <Icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <GlassCard hover={false} className="p-4">
          <h3 className="text-sm font-semibold mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(250 15% 18%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(220 10% 55%)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(220 10% 55%)' }} />
              <Tooltip contentStyle={{ background: 'hsl(250 18% 10%)', border: '1px solid hsl(250 15% 22%)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="hsl(265 80% 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard hover={false} className="p-4">
          <h3 className="text-sm font-semibold mb-4">Purchase Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(250 18% 10%)', border: '1px solid hsl(250 15% 22%)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              No purchase data yet
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard hover={false}>
        <h3 className="text-sm font-semibold mb-4">Recent Purchases</h3>
        {purchases.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No purchases yet</p>
        ) : (
          <div className="space-y-2">
            {purchases.slice(0, 10).map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 text-sm">
                <div>
                  <span className="font-medium text-foreground">{p.product_title}</span>
                  <span className="text-muted-foreground ml-2">by {p.minecraft_username || p.buyer_email || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-primary font-semibold">${Number(p.amount).toFixed(2)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    p.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    p.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
