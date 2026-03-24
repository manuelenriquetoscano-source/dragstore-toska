import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import Modal from '../components/common/Modal';

export default function Products() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['products', search],
    queryFn: async () => {
      const { data } = await api.get('/products', { 
        params: { search, limit: 100 } 
      });
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (product) => api.post('/products', product),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Producto creado');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Error al crear');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...product }) => api.put(`/products/${id}`, product),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Producto actualizado');
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Producto eliminado');
    },
  });

  const openModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = {
      name: formData.get('name'),
      sku: formData.get('sku') || undefined,
      barCode: formData.get('barCode') || undefined,
      category: formData.get('category'),
      purchasePrice: Number(formData.get('purchasePrice')),
      salePrice: Number(formData.get('salePrice')),
      stock: Number(formData.get('stock')),
      minStock: Number(formData.get('minStock')),
      unit: formData.get('unit'),
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, ...product });
    } else {
      createMutation.mutate(product);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o código de barras..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus size={20} />
          Nuevo Producto
        </button>
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Producto</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Categoría</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">P. Compra</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">P. Venta</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Stock</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.data?.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <Package className="text-primary-600" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{product.sku}</td>
                    <td className="px-4 py-3">
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: product.category?.color + '20', color: product.category?.color }}
                      >
                        {product.category?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">${product.purchasePrice?.toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">${product.salePrice?.toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${product.stock <= product.minStock ? 'text-orange-600' : 'text-gray-900'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openModal(product)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => deleteMutation.mutate(product._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data?.data?.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No hay productos registrados</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input name="name" defaultValue={editingProduct?.name} required className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input name="sku" defaultValue={editingProduct?.sku} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
              <input name="barCode" defaultValue={editingProduct?.barCode} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select name="category" defaultValue={editingProduct?.category?._id} required className="input">
                <option value="">Seleccionar...</option>
                {categories?.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
              <select name="unit" defaultValue={editingProduct?.unit || 'unidad'} className="input">
                <option value="unidad">Unidad</option>
                <option value="kg">Kilogramo</option>
                <option value="litro">Litro</option>
                <option value="paquete">Paquete</option>
                <option value="botella">Botella</option>
                <option value="lata">Lata</option>
                <option value="bolsa">Bolsa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio Compra *</label>
              <input name="purchasePrice" type="number" step="0.01" defaultValue={editingProduct?.purchasePrice} required className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta *</label>
              <input name="salePrice" type="number" step="0.01" defaultValue={editingProduct?.salePrice} required className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
              <input name="stock" type="number" defaultValue={editingProduct?.stock || 0} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
              <input name="minStock" type="number" defaultValue={editingProduct?.minStock || 5} className="input" />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={closeModal} className="btn btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn btn-primary flex-1">
              {editingProduct ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
