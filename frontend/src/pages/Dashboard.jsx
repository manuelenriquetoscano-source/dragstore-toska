import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingCart, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import api from '../services/api';

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats');
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error al cargar datos: {error.message}</p>
      </div>
    );
  }

  const todaySales = stats?.todaySales || 0;
  const todayOrders = stats?.todayOrders || 0;
  const monthSales = stats?.monthSales || 0;
  const monthOrders = stats?.monthOrders || 0;
  const lowStockCount = stats?.lowStockCount || 0;
  const totalProducts = stats?.totalProducts || 0;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
  };

  const statsCards = [
    { 
      title: 'Ventas Hoy', 
      value: formatCurrency(todaySales), 
      icon: DollarSign,
      color: 'bg-green-500'
    },
    { 
      title: 'Órdenes Hoy', 
      value: todayOrders, 
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    { 
      title: 'Ventas Mes', 
      value: formatCurrency(monthSales), 
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    { 
      title: 'Stock Bajo', 
      value: lowStockCount, 
      icon: AlertTriangle,
      color: 'bg-orange-500'
    },
  ];

  const avgPerOrder = monthOrders > 0 ? Math.round(monthSales / monthOrders) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-xl`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Mes</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Ventas</span>
              <span className="font-semibold text-gray-900">{formatCurrency(monthSales)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cantidad Órdenes</span>
              <span className="font-semibold text-gray-900">{monthOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Promedio por Orden</span>
              <span className="font-semibold text-gray-900">{formatCurrency(avgPerOrder)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Productos Activos</span>
              <span className="font-semibold text-gray-900">{totalProducts}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/pos" className="btn btn-primary">
              <ShoppingCart size={20} />
              Nueva Venta
            </Link>
            <Link to="/products" className="btn btn-secondary">
              <Package size={20} />
              Ver Inventario
            </Link>
            {lowStockCount > 0 && (
              <div className="col-span-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-orange-500" size={20} />
                  <div>
                    <p className="font-medium text-orange-800">Alerta de Stock</p>
                    <p className="text-sm text-orange-600">{lowStockCount} productos con stock bajo</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
