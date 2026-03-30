import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, sparse: true },
  barCode: { type: String },
  description: { type: String, trim: true },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    required: true 
  },
  purchasePrice: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  minStock: { type: Number, default: 5 },
  unit: { 
    type: String, 
    enum: ['unidad', 'kg', 'litro', 'paquete', 'botella', 'lata', 'bolsa', 'pote', 'tubo', 'rollo', 'docena', 'atado', 'caja', 'tabla'],
    default: 'unidad' 
  },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  expirationDate: { type: Date },
  image: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.pre('save', function(next) {
  if (!this.sku) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.sku = `SKU-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

productSchema.virtual('profitMargin').get(function() {
  if (this.salePrice === 0) return 0;
  return Number(((this.salePrice - this.purchasePrice) / this.salePrice * 100).toFixed(2));
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model('Product', productSchema);
