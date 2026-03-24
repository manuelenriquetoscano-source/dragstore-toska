import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Receipt, Search, Eye, X } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';

export default function Orders() {
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders', { 
        params: { limit: 50 } 
      });
      return data;
    },
  });

  const orders = data?.data?.filter(order => 
    !search || 
    order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    order.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por número de orden o cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Orden</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Cliente</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Items</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Total</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Estado</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders?.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.customer?.name || 'Consumidor Final'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {order.items?.length} productos
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      ${order.total?.toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status === 'completed' ? 'Completada' : order.status === 'cancelled' ? 'Anulada' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders?.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No hay ventas registradas</p>
            </div>
          )}
        </div>
      )}

      <Modal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        title={`Orden #${selectedOrder?.orderNumber}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Fecha</p>
                <p className="font-medium">
                  {new Date(selectedOrder.createdAt).toLocaleString('es-AR')}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Cajero</p>
                <p className="font-medium">{selectedOrder.cashier?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Cliente</p>
                <p className="font-medium">{selectedOrder.customer?.name || 'Consumidor Final'}</p>
              </div>
              <div>
                <p className="text-gray-500">Método de Pago</p>
                <p className="font-medium capitalize">{selectedOrder.paymentMethod}</p>
              </div>
            </div>

            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Producto</th>
                    <th className="px-4 py-2 text-right">Cantidad</th>
                    <th className="px-4 py-2 text-right">Precio</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedOrder.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">{item.productName}</td>
                      <td className="px-4 py-2 text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">${item.unitPrice?.toLocaleString('es-AR')}</td>
                      <td className="px-4 py-2 text-right font-medium">${item.subtotal?.toLocaleString('es-AR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${selectedOrder.subtotal?.toLocaleString('es-AR')}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento</span>
                  <span>-${selectedOrder.discount?.toLocaleString('es-AR')}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary-600">${selectedOrder.total?.toLocaleString('es-AR')}</span>
              </div>
              {selectedOrder.paymentMethod === 'cash' && selectedOrder.change > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Cambio</span>
                  <span>${selectedOrder.change?.toLocaleString('es-AR')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
