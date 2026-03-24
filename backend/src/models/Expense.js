import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  category: { 
    type: String,
    enum: ['services', 'rent', 'supplies', 'salaries', 'maintenance', 'taxes', 'marketing', 'other'],
    required: true 
  },
  date: { type: Date, default: Date.now },
  receipt: { type: String },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
