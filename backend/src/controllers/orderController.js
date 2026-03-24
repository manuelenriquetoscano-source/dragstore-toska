import Order from '../models/Order.js';
import Product from '../models/Product.js';

export const getOrders = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type, 
      startDate, 
      endDate,
      cashier 
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (cashier) query.cashier = cashier;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('cashier', 'name')
      .populate('cancelledBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('cashier', 'name')
      .populate('items.product', 'sku barCode');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: { code: 'NOT_FOUND', message: 'Orden no encontrada' }
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { items, customer, discount = 0, paymentMethod, amountPaid, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'EMPTY_ORDER', message: 'La orden debe tener al menos un producto' }
      });
    }

    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(400).json({ 
          success: false, 
          error: { code: 'PRODUCT_NOT_FOUND', message: `Producto no encontrado: ${item.product}` }
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          error: { code: 'INSUFFICIENT_STOCK', message: `Stock insuficiente para: ${product.name}` }
        });
      }

      const itemSubtotal = product.salePrice * item.quantity;
      subtotal += itemSubtotal;

      processedItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.salePrice,
        subtotal: itemSubtotal
      });

      product.stock -= item.quantity;
      await product.save();
    }

    const total = subtotal - discount;
    const change = paymentMethod === 'cash' ? (amountPaid || 0) - total : 0;

    const order = await Order.create({
      items: processedItems,
      customer,
      subtotal,
      discount,
      total,
      paymentMethod,
      amountPaid: amountPaid || total,
      change,
      notes,
      cashier: req.user._id
    });

    await order.populate('cashier', 'name');

    res.status(201).json({
      success: true,
      data: order,
      message: 'Venta registrada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: { code: 'NOT_FOUND', message: 'Orden no encontrada' }
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'ALREADY_CANCELLED', message: 'Esta orden ya fue cancelada' }
      });
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    order.status = 'cancelled';
    order.cancelledBy = req.user._id;
    order.cancellationReason = reason;
    await order.save();

    res.json({
      success: true,
      data: order,
      message: 'Orden cancelada y stock restaurado'
    });
  } catch (error) {
    next(error);
  }
};

export const getTodaySales = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sales = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow },
      status: 'completed'
    }).populate('cashier', 'name').sort({ createdAt: -1 });

    const totalAmount = sales.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = sales.length;

    res.json({
      success: true,
      data: {
        orders: sales,
        totalAmount,
        totalOrders
      }
    });
  } catch (error) {
    next(error);
  }
};
