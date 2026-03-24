import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Package, DollarSign, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

export default function Reports() {
  const [period, setPeriod] = useState('week');

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats');
      return data.data;
    },
  });

  const { data: salesData } = useQuery({
    queryKey: ['sales-chart', period],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/sales', { params: { range: period } });
      return data.data;
    },
  });

  const { data: topProducts } = useQuery({
    queryKey: ['top-products'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/top-products', { params: { limit: 5 } });
      return data.data;
    },
  });

  const chartData = salesData?.map(item => ({
    name: item._id?.day || item._id?.month || item._id?.hour || 'N/A',
    ventas: item.total,
    cantidad: item.count
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-xl font-semibold text-gray-900">Reportes y Estadísticas</h2>
        <div className="flex gap-2">
          {['day', 'week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {p === 'day' ? 'Hoy' : p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-100">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ventas del Mes</p>
              <p className="text-xl font-bold text-gray-900">${(stats?.monthSales || 0).toLocaleString('es-AR')}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ordenes del Mes</p>
              <p className="text-xl font-bold text-gray-900">{stats?.monthOrders || 0}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-100">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Promedio por Venta</p>
              <p className="text-xl font-bold text-gray-900">
                ${stats?.monthOrders ? Math.round(stats.monthSales / stats.monthOrders).toLocaleString('es-AR') : 0}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-orange-100">
              <Package className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Productos</p>
              <p className="text-xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Período</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `$${value.toLocaleString()}`} />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString('es-AR')}`, 'Ventas']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="ventas" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Vendidos</h3>
          <div className="space-y-4">
            {topProducts?.map((product, index) => (
              <div key={product._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.productName}</p>
                  <p className="text-sm text-gray-500">{product.totalSold} unidades</p>
                </div>
                <p className="font-semibold text-gray-900">${product.totalRevenue?.toLocaleString('es-AR')}</p>
              </div>
            ))}
            {(!topProducts || topProducts.length === 0) && (
              <p className="text-center text-gray-500 py-4">Sin datos disponibles</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
