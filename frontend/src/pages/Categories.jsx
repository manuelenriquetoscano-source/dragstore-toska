import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Tags } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import Modal from '../components/common/Modal';

export default function Categories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (category) => api.post('/categories', category),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Categoría creada');
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...category }) => api.put(`/categories/${id}`, category),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Categoría actualizada');
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Categoría eliminada');
    },
  });

  const openModal = (category = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const category = {
      name: formData.get('name'),
      description: formData.get('description'),
      color: formData.get('color'),
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, ...category });
    } else {
      createMutation.mutate(category);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">Organiza tus productos por categorías</p>
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus size={20} />
          Nueva Categoría
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map((category) => (
            <div key={category._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <Tags className="text-xl" style={{ color: category.color }} size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.description || 'Sin descripción'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openModal(category)} className="p-2 text-gray-400 hover:text-primary-600 rounded-lg">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => deleteMutation.mutate(category._id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.length === 0 && !isLoading && (
        <div className="text-center py-12 card">
          <Tags className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">No hay categorías registradas</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input name="name" defaultValue={editingCategory?.name} required className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input name="description" defaultValue={editingCategory?.description} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex gap-2">
              <input name="color" type="color" defaultValue={editingCategory?.color || '#6366f1'} className="w-12 h-10 rounded cursor-pointer" />
              <input type="text" defaultValue={editingCategory?.color || '#6366f1'} className="input flex-1" readOnly />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={closeModal} className="btn btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn btn-primary flex-1">
              {editingCategory ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
