import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Expense from '../models/Expense.js';

export const getStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todaySales, weekSales, monthSales, pendingOrders, lowStockCount, totalProducts] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: today }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: weekAgo }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: monthStart }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ]),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments({ 
        active: true, 
        stock: { $lte: 5 }
      }),
      Product.countDocuments({ active: true })
    ]);

    res.json({
      success: true,
      data: {
        todaySales: todaySales[0]?.total || 0,
        todayOrders: todaySales[0]?.count || 0,
        weekSales: weekSales[0]?.total || 0,
        weekOrders: weekSales[0]?.count || 0,
        monthSales: monthSales[0]?.total || 0,
        monthOrders: monthSales[0]?.count || 0,
        pendingOrders,
        lowStockCount,
        totalProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesByPeriod = async (req, res, next) => {
  try {
    const { range = 'week' } = req.query;
    const today = new Date();
    let startDate;
    let groupFormat;

    switch (range) {
      case 'day':
        startDate = new Date(today.setHours(0, 0, 0, 0));
        groupFormat = { hour: { $hour: '$createdAt' } };
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        groupFormat = { day: { $dayOfMonth: '$createdAt' } };
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        groupFormat = { month: { $month: '$createdAt' } };
        break;
      default:
        startDate = new Date(today.setDate(today.getDate() - 7));
        groupFormat = { day: { $dayOfWeek: '$createdAt' } };
    }

    const sales = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
      {
        $group: {
          _id: groupFormat,
          total: { $sum: '$total' },
          count: { $sum: 1 },
          profit: { 
            $sum: { 
              $subtract: [
                '$total',
                { 
                  $reduce: {
                    input: '$items',
                    initialValue: 0,
                    in: { $add: ['$$value', { $multiply: ['$$this.quantity', '$$this.unitPrice'] }] }
                  }
                }
              ]
            }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({ success: true, data: sales });
  } catch (error) {
    next(error);
  }
};

export const getTopProducts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: Number(limit) }
    ]);

    res.json({ success: true, data: topProducts });
  } catch (error) {
    next(error);
  }
};

export const getInventoryValue = async (req, res, next) => {
  try {
    const inventory = await Product.aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$stock', '$purchasePrice'] } },
          totalRetail: { $sum: { $multiply: ['$stock', '$salePrice'] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: inventory[0] || { totalProducts: 0, totalStock: 0, totalValue: 0, totalRetail: 0 }
    });
  } catch (error) {
    next(error);
  }
};
