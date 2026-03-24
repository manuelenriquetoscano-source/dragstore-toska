import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  contact: { type: String, trim: true },
  phone: { type: String, required: true },
  email: { type: String, lowercase: true, trim: true },
  address: { type: String, trim: true },
  notes: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Supplier', supplierSchema);
