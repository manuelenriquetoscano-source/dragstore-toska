import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Minus, Trash2, ShoppingCart, Banknote, CreditCard, Package } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { useCartStore } from '../stores/cartStore';
import { useDebounce } from '../hooks/useDebounce';
import { formatCurrency } from '../utils/format';
import Modal from '../components/common/Modal';

export default function POS() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [discount, setDiscount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const queryClient = useQueryClient();
  
  const { items, addItem, updateQuantity, removeItem, clearCart, getSubtotal, getTotalItems } = useCartStore();

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data;
    },
  });

  const { data: productsData } = useQuery({
    queryKey: ['products', debouncedSearch],
    queryFn: async () => {
      const { data } = await api.get('/products', { 
        params: { search, limit: 50, active: true } 
      });
      return data.data;
    },
    enabled: !!debouncedSearch,
  });

  const { data: categoryProducts } = useQuery({
    queryKey: ['products', 'category', selectedCategory?._id],
    queryFn: async () => {
      const { data } = await api.get('/products', {
        params: { category: selectedCategory._id, limit: 100, active: true }
      });
      return data.data;
    },
    enabled: !!selectedCategory,
  });

  const createOrderMutation = useMutation({
    mutationFn: (order) => api.post('/orders', order),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['dashboard-stats']);
      toast.success('Venta registrada exitosamente!');
      clearCart();
      setAmountPaid('');
      setDiscount(0);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al registrar venta');
    }
  });

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      toast.error('Producto sin stock');
      return;
    }
    addItem(product);
  };

  const subtotal = getSubtotal();
  const total = Math.max(0, subtotal - discount);
  const amountPaidNum = Number(amountPaid) || 0;
  const change = paymentMethod === 'cash' && amountPaidNum > 0 ? Math.max(0, amountPaidNum - total) : 0;
  const needsChange = paymentMethod === 'cash' && amountPaidNum > 0 && amountPaidNum >= total;

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  const handleQuickAmount = (amount) => {
    setAmountPaid(amount.toString());
  };

  const handleCompleteSale = () => {
    if (items.length === 0) {
      toast.error('Agrega productos al carrito');
      return;
    }

    if (paymentMethod === 'cash' && amountPaidNum < total) {
      toast.error(`Monto insuficiente. Total: $${total.toLocaleString('es-AR')}`);
      return;
    }

    const order = {
      items: items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        unitPrice: item.product.salePrice,
        subtotal: item.product.salePrice * item.quantity
      })),
      discount,
      paymentMethod,
      amountPaid: amountPaidNum || total,
      notes: ''
    };

    createOrderMutation.mutate(order);
  };

  const handleQuickAdd = (product) => {
    const existingItem = items.find(i => i.product._id === product._id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.warning('Stock máximo alcanzado');
        return;
      }
    } else if (product.stock <= 0) {
      toast.error('Sin stock');
      return;
    }
    handleAddToCart(product);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
      <div className="lg:col-span-2 card flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar producto por nombre o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {debouncedSearch ? (
            <div>
              <p className="text-sm text-gray-500 mb-3">
                Resultados para "{debouncedSearch}" ({productsData?.length || 0})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {productsData?.map((product) => {
                  const inCart = items.find(i => i.product._id === product._id);
                  return (
                    <button
                      key={product._id}
                      onClick={() => handleQuickAdd(product)}
                      disabled={product.stock <= 0}
                      className={`p-3 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                        product.stock <= 0 
                          ? 'border-gray-100 bg-gray-50 opacity-60' 
                          : inCart 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-100 hover:border-primary-200'
                      }`}
                    >
                      <div 
                        className="w-full h-16 rounded-lg mb-2 flex items-center justify-center text-2xl"
                        style={{ backgroundColor: (product.category?.color || '#6366f1') + '20' }}
                      >
                        🛒
                      </div>
                      <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                      <p className="text-primary-600 font-bold">${formatCurrency(product.salePrice || 0)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Stock: <span className={product.stock <= product.minStock ? 'text-orange-600 font-medium' : ''}>{product.stock}</span>
                        {inCart && <span className="text-primary-600 ml-1">({inCart.quantity})</span>}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {categoriesData?.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category)}
                  className="p-5 rounded-2xl border-2 border-gray-100 text-left transition-all hover:shadow-lg hover:border-primary-300 hover:-translate-y-1 group"
                >
                  <div 
                    className="w-full h-20 rounded-xl mb-3 flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ backgroundColor: (category.color || '#6366f1') + '25' }}
                  >
                    <Package size={32} style={{ color: category.color || '#6366f1' }} />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm truncate">{category.name}</p>
                  {category.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{category.description}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedCategory && (
          <Modal
            isOpen={!!selectedCategory}
            onClose={() => setSelectedCategory(null)}
            title={selectedCategory.name}
            size="xl"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto">
              {categoryProducts?.length === 0 ? (
                <p className="col-span-full text-center text-gray-500 py-8">
                  No hay productos en esta categoría
                </p>
              ) : (
                categoryProducts?.map((product) => {
                  const inCart = items.find(i => i.product._id === product._id);
                  return (
                    <button
                      key={product._id}
                      onClick={() => handleQuickAdd(product)}
                      disabled={product.stock <= 0}
                      className={`p-3 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                        product.stock <= 0 
                          ? 'border-gray-100 bg-gray-50 opacity-60' 
                          : inCart 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-100 hover:border-primary-200'
                      }`}
                    >
                      <div 
                        className="w-full h-16 rounded-lg mb-2 flex items-center justify-center text-2xl"
                        style={{ backgroundColor: (selectedCategory.color || '#6366f1') + '20' }}
                      >
                        🛒
                      </div>
                      <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                      <p className="text-primary-600 font-bold">${formatCurrency(product.salePrice || 0)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Stock: <span className={product.stock <= product.minStock ? 'text-orange-600 font-medium' : ''}>{product.stock}</span>
                        {inCart && <span className="text-primary-600 ml-1">({inCart.quantity})</span>}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </Modal>
        )}
      </div>

      <div className="card flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingCart size={20} />
              Carrito
            </h3>
            {items.length > 0 && (
              <button onClick={clearCart} className="text-sm text-gray-500 hover:text-red-500">
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-500 text-sm">Carrito vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-500">${formatCurrency(item.product.salePrice || 0)} c/u</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white border flex items-center justify-center hover:bg-gray-100"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white border flex items-center justify-center hover:bg-gray-100"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="w-20 text-right font-medium text-gray-900">
                  ${formatCurrency(item.product.salePrice * item.quantity)}
                </p>
                <button
                  onClick={() => removeItem(item.product._id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
              <span className="font-medium">${formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Descuento</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Math.min(subtotal, Number(e.target.value))))}
                className="w-24 text-right input py-1 text-sm"
                min="0"
                max={subtotal}
              />
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>TOTAL</span>
              <span className="text-primary-600">${formatCurrency(total)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`flex-1 btn py-2 text-sm ${paymentMethod === 'cash' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Banknote size={18} />
              Efectivo
            </button>
            <button
              onClick={() => setPaymentMethod('transfer')}
              className={`flex-1 btn py-2 text-sm ${paymentMethod === 'transfer' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <CreditCard size={18} />
              Transferencia
            </button>
          </div>

          {paymentMethod === 'cash' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Monto Recibido</label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="input"
                placeholder="Ingresá el monto"
              />
              
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickAmount(amount)}
                    className="btn btn-secondary py-1 text-xs"
                  >
                    ${formatCurrency(amount)}
                  </button>
                ))}
              </div>

              {needsChange && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    <span className="font-medium">Vuelto:</span>{' '}
                    <span className="text-lg font-bold text-green-800">${formatCurrency(change)}</span>
                  </p>
                </div>
              )}

              {!needsChange && amountPaidNum > 0 && amountPaidNum < total && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    Faltan: <span className="font-bold">${formatCurrency(total - amountPaidNum)}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleCompleteSale}
            disabled={items.length === 0 || createOrderMutation.isPending || (paymentMethod === 'cash' && amountPaidNum < total)}
            className="btn btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50"
          >
            {createOrderMutation.isPending ? 'Procesando...' : 'Completar Venta'}
          </button>
        </div>
      </div>
    </div>
  );
}
