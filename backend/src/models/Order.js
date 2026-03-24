import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  subtotal: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  type: { 
    type: String, 
    enum: ['sale', 'order', 'return'], 
    default: 'sale' 
  },
  customer: {
    name: { type: String, trim: true },
    phone: { type: String }
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'transfer', 'debt', 'mixed'], 
    default: 'cash' 
  },
  amountPaid: { type: Number, default: 0 },
  change: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed' 
  },
  notes: { type: String },
  cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancellationReason: { type: String }
}, { timestamps: true });

orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `${year}${month}${day}-${random}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);
