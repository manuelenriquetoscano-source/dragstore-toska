import Product from '../models/Product.js';
import Order from '../models/Order.js';

export const getProducts = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      category, 
      lowStock, 
      sort = '-createdAt' 
    } = req.query;

    const query = { active: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barCode: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stock', '$minStock'] };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name color')
      .populate('supplier', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: products,
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

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name color')
      .populate('supplier', 'name');

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: { code: 'NOT_FOUND', message: 'Producto no encontrado' }
      });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const getProductByBarcode = async (req, res, next) => {
  try {
    const product = await Product.findOne({ 
      barCode: req.params.barcode, 
      active: true 
    }).populate('category', 'name color');

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: { code: 'NOT_FOUND', message: 'Producto no encontrado' }
      });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    
    await product.populate('category', 'name color');
    await product.populate('supplier', 'name');

    res.status(201).json({
      success: true,
      data: product,
      message: 'Producto creado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name color')
     .populate('supplier', 'name');

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: { code: 'NOT_FOUND', message: 'Producto no encontrado' }
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Producto actualizado'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: { code: 'NOT_FOUND', message: 'Producto no encontrado' }
      });
    }

    res.json({
      success: true,
      message: 'Producto eliminado'
    });
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req, res, next) => {
  try {
    const { quantity, type, reason } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: { code: 'NOT_FOUND', message: 'Producto no encontrado' }
      });
    }

    if (type === 'in') {
      product.stock += quantity;
    } else if (type === 'out') {
      if (product.stock < quantity) {
        return res.status(400).json({ 
          success: false, 
          error: { code: 'INSUFFICIENT_STOCK', message: 'Stock insuficiente' }
        });
      }
      product.stock -= quantity;
    }

    await product.save();

    res.json({
      success: true,
      data: product,
      message: `Stock actualizado: ${type === 'in' ? 'entrada' : 'salida'} de ${quantity} unidades`
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      active: true,
      $expr: { $lte: ['$stock', '$minStock'] }
    })
    .populate('category', 'name color')
    .sort({ stock: 1 });

    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};
