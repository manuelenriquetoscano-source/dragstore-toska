import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';

dotenv.config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB conectado para seed');
};

const categories = [
  { name: 'Bebidas con Alcohol', description: 'Cervezas, vinos, licores', color: '#8b5cf6', icon: 'beer' },
  { name: 'Bebidas sin Alcohol', description: 'Gaseosas, jugos, aguas', color: '#3b82f6', icon: 'cup' },
  { name: 'Alimentos Básicos', description: 'Arroz, fideos, harinas, azúcar', color: '#22c55e', icon: 'grain' },
  { name: 'Aceites y Condimentos', description: 'Aceites, sales, especias', color: '#f59e0b', icon: 'droplet' },
  { name: 'Lácteos', description: 'Leche, queso, yogurt, manteca', color: '#06b6d4', icon: 'milk' },
  { name: 'Panadería y Bollería', description: 'Pan fresco, facturas, bizcochos', color: '#f97316', icon: 'croissant' },
  { name: 'Carnes y Fiambres', description: 'Carnes, embutidos, fiambres', color: '#ef4444', icon: 'beef' },
  { name: 'Verdulería', description: 'Frutas y verduras frescas', color: '#10b981', icon: 'apple' },
  { name: 'Limpieza', description: 'Detergentes, lavandina, jabones', color: '#64748b', icon: 'spray' },
  { name: 'Higiene Personal', description: 'Jabón, shampoo, dentífricos', color: '#ec4899', icon: 'heart' },
  { name: 'Snacks y Golosinas', description: 'Papas, chocolates, galletitas', color: '#a855f7', icon: 'cookie' },
  { name: 'Congelados', description: 'Helados, pizzas, productos congelados', color: '#0ea5e9', icon: 'snowflake' },
  { name: 'Alimentos para Mascotas', description: 'Balanceado y accesorios', color: '#84cc16', icon: 'dog' },
  { name: 'Varios', description: 'Bolsas, velas, artículos varios', color: '#6b7280', icon: 'package' },
  { name: 'Cigarrillos', description: 'Cigarrillos y encendedores', color: '#374151', icon: 'cigarette' },
];

const suppliers = [
  { name: 'Distribuidora Norte Grande', contact: 'Carlos Pérez', phone: '388-4123456', email: 'ventas@nortegrande.com', address: 'San Salvador de Jujuy' },
  { name: 'Almacén Central SRL', contact: 'María López', phone: '388-4234567', email: 'info@almacencentral.com', address: 'San Salvador de Jujuy' },
  { name: 'Proveeduria del Norte', contact: 'Roberto García', phone: '388-4345678', email: 'compras@proveedurianorte.com', address: 'Libertador Gral. San Martín' },
  { name: 'Bebidas y Más', contact: 'Ana Martínez', phone: '388-4456789', email: 'ventas@bebidasymas.com', address: 'San Salvador de Jujuy' },
  { name: 'Productos Regionales Calilegua', contact: 'Jorge Ruiz', phone: '388-4567890', email: 'regional@calilegua.com', address: 'Calilegua' },
];

const products = [
  // Bebidas con Alcohol
  { name: 'Cerveza Corona 710ml', category: 'Bebidas con Alcohol', purchasePrice: 580, salePrice: 850, stock: 48, unit: 'botella' },
  { name: 'Cerveza Quilmes 1L', category: 'Bebidas con Alcohol', purchasePrice: 620, salePrice: 900, stock: 36, unit: 'botella' },
  { name: 'Cerveza Brahama 1L', category: 'Bebidas con Alcohol', purchasePrice: 590, salePrice: 850, stock: 30, unit: 'botella' },
  { name: 'Vino Trumpeter Torrontés 750ml', category: 'Bebidas con Alcohol', purchasePrice: 1200, salePrice: 1750, stock: 12, unit: 'botella' },
  { name: 'Fernet Branca 750ml', category: 'Bebidas con Alcohol', purchasePrice: 2100, salePrice: 2900, stock: 15, unit: 'botella' },
  { name: 'Gin Bombay 750ml', category: 'Bebidas con Alcohol', purchasePrice: 3200, salePrice: 4500, stock: 8, unit: 'botella' },
  
  // Bebidas sin Alcohol
  { name: 'Coca-Cola 2.25L', category: 'Bebidas sin Alcohol', purchasePrice: 850, salePrice: 1250, stock: 60, unit: 'botella' },
  { name: 'Sprite 2.25L', category: 'Bebidas sin Alcohol', purchasePrice: 820, salePrice: 1200, stock: 45, unit: 'botella' },
  { name: 'Manaos 2.25L', category: 'Bebidas sin Alcohol', purchasePrice: 550, salePrice: 800, stock: 40, unit: 'botella' },
  { name: 'Aquarius Naranja 1.5L', category: 'Bebidas sin Alcohol', purchasePrice: 420, salePrice: 650, stock: 35, unit: 'botella' },
  { name: 'Jugo Concentrado Tang 500g', category: 'Bebidas sin Alcohol', purchasePrice: 320, salePrice: 500, stock: 25, unit: 'paquete' },
  { name: 'Agua Mineral Villa del Azul 1.5L', category: 'Bebidas sin Alcohol', purchasePrice: 180, salePrice: 300, stock: 80, unit: 'botella' },
  { name: 'Agua Sin Gas 500ml', category: 'Bebidas sin Alcohol', purchasePrice: 120, salePrice: 200, stock: 100, unit: 'botella' },
  { name: 'Gaseosa Pepsi 2L', category: 'Bebidas sin Alcohol', purchasePrice: 750, salePrice: 1100, stock: 30, unit: 'botella' },
  
  // Alimentos Básicos
  { name: 'Arroz Lucchetti 1kg', category: 'Alimentos Básicos', purchasePrice: 450, salePrice: 680, stock: 50, unit: 'paquete' },
  { name: 'Fideos Matarazzo Espagueti 500g', category: 'Alimentos Básicos', purchasePrice: 280, salePrice: 420, stock: 60, unit: 'paquete' },
  { name: 'Fideos Don Vicente Mostachol 500g', category: 'Alimentos Básicos', purchasePrice: 260, salePrice: 390, stock: 45, unit: 'paquete' },
  { name: 'Harina 000 Cañada 1kg', category: 'Alimentos Básicos', purchasePrice: 320, salePrice: 480, stock: 40, unit: 'paquete' },
  { name: 'Azúcar Ledesma 1kg', category: 'Alimentos Básicos', purchasePrice: 380, salePrice: 550, stock: 35, unit: 'paquete' },
  { name: 'Sal Fina 500g', category: 'Alimentos Básicos', purchasePrice: 150, salePrice: 250, stock: 50, unit: 'paquete' },
  { name: 'Polenta Primor 500g', category: 'Alimentos Básicos', purchasePrice: 220, salePrice: 350, stock: 30, unit: 'paquete' },
  { name: 'Pure de Tomate Arcor 520g', category: 'Alimentos Básicos', purchasePrice: 280, salePrice: 420, stock: 40, unit: 'lata' },
  { name: 'Lentejas 500g', category: 'Alimentos Básicos', purchasePrice: 350, salePrice: 520, stock: 25, unit: 'paquete' },
  { name: 'Poroto Negro 500g', category: 'Alimentos Básicos', purchasePrice: 320, salePrice: 480, stock: 20, unit: 'paquete' },
  
  // Aceites y Condimentos
  { name: 'Aceite Cocinero 900ml', category: 'Aceites y Condimentos', purchasePrice: 680, salePrice: 980, stock: 30, unit: 'botella' },
  { name: 'Aceite Natura 900ml', category: 'Aceites y Condimentos', purchasePrice: 720, salePrice: 1050, stock: 25, unit: 'botella' },
  { name: 'Vinagre de Alcohol 1L', category: 'Aceites y Condimentos', purchasePrice: 250, salePrice: 380, stock: 20, unit: 'botella' },
  { name: 'Mayonesa Hellmann's 475g', category: 'Aceites y Condimentos', purchasePrice: 580, salePrice: 850, stock: 18, unit: 'pote' },
  { name: 'Ketchup Heintz 380g', category: 'Aceites y Condimentos', purchasePrice: 420, salePrice: 620, stock: 15, unit: 'pote' },
  { name: 'Ají Molido 80g', category: 'Aceites y Condimentos', purchasePrice: 180, salePrice: 280, stock: 30, unit: 'paquete' },
  { name: 'Comino 80g', category: 'Aceites y Condimentos', purchasePrice: 160, salePrice: 250, stock: 25, unit: 'paquete' },
  { name: 'Pimentón 80g', category: 'Aceites y Condimentos', purchasePrice: 170, salePrice: 270, stock: 20, unit: 'paquete' },
  
  // Lácteos
  { name: 'Leche La Serenisima 1L', category: 'Lácteos', purchasePrice: 400, salePrice: 580, stock: 50, unit: 'bolsa' },
  { name: 'Leche Enteriza La Serenisima 1L', category: 'Lácteos', purchasePrice: 450, salePrice: 650, stock: 40, unit: 'caja' },
  { name: 'Yogur Serenito 1kg', category: 'Lácteos', purchasePrice: 550, salePrice: 800, stock: 25, unit: 'pote' },
  { name: 'Yogur Bebible Yogs 1L', category: 'Lácteos', purchasePrice: 480, salePrice: 700, stock: 20, unit: 'botella' },
  { name: 'Queso Cuartelero 500g', category: 'Lácteos', purchasePrice: 1200, salePrice: 1750, stock: 10, unit: 'unidad' },
  { name: 'Queso Untables 180g', category: 'Lácteos', purchasePrice: 380, salePrice: 580, stock: 30, unit: 'pote' },
  { name: 'Manteca Mimosa 200g', category: 'Lácteos', purchasePrice: 480, salePrice: 700, stock: 20, unit: 'paquete' },
  { name: 'Queso Rallado 140g', category: 'Lácteos', purchasePrice: 320, salePrice: 480, stock: 35, unit: 'paquete' },
  
  // Panadería
  { name: 'Pan Francés (unidad)', category: 'Panadería y Bollería', purchasePrice: 120, salePrice: 180, stock: 40, unit: 'unidad' },
  { name: 'Facturas Varias (docena)', category: 'Panadería y Bollería', purchasePrice: 1500, salePrice: 2200, stock: 5, unit: 'docena' },
  { name: 'Bizcochitos de Grasa (250g)', category: 'Panadería y Bollería', purchasePrice: 280, salePrice: 420, stock: 15, unit: 'paquete' },
  { name: 'Pan Integral 400g', category: 'Panadería y Bollería', purchasePrice: 380, salePrice: 550, stock: 12, unit: 'unidad' },
  
  // Carnes y Fiambres
  { name: 'Jamón Cocido Yadran 200g', category: 'Carnes y Fiambres', purchasePrice: 850, salePrice: 1250, stock: 15, unit: 'paquete' },
  { name: 'Salame Paladini 200g', category: 'Carnes y Fiambres', purchasePrice: 780, salePrice: 1150, stock: 10, unit: 'paquete' },
  { name: 'Queso tybo 200g', category: 'Carnes y Fiambres', purchasePrice: 680, salePrice: 1000, stock: 12, unit: 'paquete' },
  { name: 'Mortadela 200g', category: 'Carnes y Fiambres', purchasePrice: 550, salePrice: 820, stock: 18, unit: 'paquete' },
  
  // Limpieza
  { name: 'Lavandina Ayudín 1L', category: 'Limpieza', purchasePrice: 280, salePrice: 420, stock: 40, unit: 'botella' },
  { name: 'Detergente Magistral 750ml', category: 'Limpieza', purchasePrice: 320, salePrice: 480, stock: 35, unit: 'botella' },
  { name: 'Jabón Rex 125g', category: 'Limpieza', purchasePrice: 180, salePrice: 280, stock: 50, unit: 'unidad' },
  { name: 'Jabón en Polvo OMO 800g', category: 'Limpieza', purchasePrice: 850, salePrice: 1250, stock: 20, unit: 'paquete' },
  { name: 'Suavizanteizante Rex 1L', category: 'Limpieza', purchasePrice: 480, salePrice: 700, stock: 15, unit: 'botella' },
  { name: 'Alcohol etílico 1L', category: 'Limpieza', purchasePrice: 420, salePrice: 620, stock: 25, unit: 'botella' },
  { name: 'Limpia Vidrios 500ml', category: 'Limpieza', purchasePrice: 350, salePrice: 520, stock: 20, unit: 'botella' },
  { name: 'Escoba Nova 1', category: 'Limpieza', purchasePrice: 580, salePrice: 850, stock: 10, unit: 'unidad' },
  { name: 'Trapeador 1', category: 'Limpieza', purchasePrice: 450, salePrice: 680, stock: 8, unit: 'unidad' },
  
  // Higiene Personal
  { name: 'Pasta Dental Colgate 150g', category: 'Higiene Personal', purchasePrice: 480, salePrice: 720, stock: 25, unit: 'tubo' },
  { name: 'Jabón de Tocador Dove 100g', category: 'Higiene Personal', purchasePrice: 380, salePrice: 580, stock: 30, unit: 'unidad' },
  { name: 'Champú Sedal 370ml', category: 'Higiene Personal', purchasePrice: 620, salePrice: 920, stock: 20, unit: 'botella' },
  { name: 'Acondicionador Sedal 370ml', category: 'Higiene Personal', purchasePrice: 580, salePrice: 850, stock: 18, unit: 'botella' },
  { name: 'Desodorante Rex Lady 150ml', category: 'Higiene Personal', purchasePrice: 520, salePrice: 780, stock: 15, unit: 'unidad' },
  { name: 'Papel Higiénico Bolsax4 Elite', category: 'Higiene Personal', purchasePrice: 850, salePrice: 1250, stock: 30, unit: 'paquete' },
  { name: 'Higiénico Pormayor 30m', category: 'Higiene Personal', purchasePrice: 320, salePrice: 480, stock: 40, unit: 'rollo' },
  { name: 'Gasa Algodón 100g', category: 'Higiene Personal', purchasePrice: 280, salePrice: 420, stock: 20, unit: 'paquete' },
  
  // Snacks y Golosinas
  { name: 'Papas Fritas Lays 150g', category: 'Snacks y Golosinas', purchasePrice: 420, salePrice: 650, stock: 40, unit: 'bolsa' },
  { name: 'Papas Fritas Pringles 165g', category: 'Snacks y Golosinas', purchasePrice: 680, salePrice: 1000, stock: 25, unit: 'tubo' },
  { name: 'Chizitos 200g', category: 'Snacks y Golosinas', purchasePrice: 350, salePrice: 520, stock: 35, unit: 'bolsa' },
  { name: 'Palitos Salados 200g', category: 'Snacks y Golosinas', purchasePrice: 280, salePrice: 420, stock: 30, unit: 'bolsa' },
  { name: 'Chocolate Cofler Leche 80g', category: 'Snacks y Golosinas', purchasePrice: 320, salePrice: 480, stock: 45, unit: 'tabla' },
  { name: 'Chocolate Aguila 80g', category: 'Snacks y Golosinas', purchasePrice: 300, salePrice: 450, stock: 40, unit: 'tabla' },
  { name: 'Caramelos Minitablets 100u', category: 'Snacks y Golosinas', purchasePrice: 280, salePrice: 420, stock: 30, unit: 'bolsa' },
  { name: 'Galletitas Oreo 132g', category: 'Snacks y Golosinas', purchasePrice: 480, salePrice: 720, stock: 25, unit: 'paquete' },
  { name: 'Galletitas Criollitas 113g', category: 'Snacks y Golosinas', purchasePrice: 350, salePrice: 520, stock: 30, unit: 'paquete' },
  { name: 'Alfajores Havanna 3x1', category: 'Snacks y Golosinas', purchasePrice: 850, salePrice: 1250, stock: 20, unit: 'caja' },
  
  // Congelados
  { name: 'Helado Simple 1L', category: 'Congelados', purchasePrice: 1200, salePrice: 1750, stock: 10, unit: 'caja' },
  { name: 'Pizza Pre-pizza 400g', category: 'Congelados', purchasePrice: 850, salePrice: 1250, stock: 8, unit: 'caja' },
  { name: 'Empanadas Copada Docena', category: 'Congelados', purchasePrice: 2800, salePrice: 4000, stock: 5, unit: 'docena' },
  
  // Alimentos para Mascotas
  { name: 'Balanceado Pedigree Adulto 3kg', category: 'Alimentos para Mascotas', purchasePrice: 1800, salePrice: 2600, stock: 8, unit: 'bolsa' },
  { name: 'Balanceado Whiskas Gato 1kg', category: 'Alimentos para Mascotas', purchasePrice: 850, salePrice: 1250, stock: 10, unit: 'bolsa' },
  
  // Varios
  { name: 'Bolsas de Residuos 30L', category: 'Varios', purchasePrice: 280, salePrice: 420, stock: 50, unit: 'paquete' },
  { name: 'Velas 12', category: 'Varios', purchasePrice: 180, salePrice: 300, stock: 25, unit: 'paquete' },
  { name: 'Fósforos 10 Cajas', category: 'Varios', purchasePrice: 220, salePrice: 350, stock: 30, unit: 'paquete' },
  { name: 'Film de Cocina 30m', category: 'Varios', purchasePrice: 380, salePrice: 580, stock: 20, unit: 'rollo' },
  { name: 'Papel Aluminium 30m', category: 'Varios', purchasePrice: 420, salePrice: 650, stock: 18, unit: 'rollo' },
  
  // Cigarrillos
  { name: 'Cigarrillos Marlboro 20', category: 'Cigarrillos', purchasePrice: 1800, salePrice: 2500, stock: 30, unit: 'atado' },
  { name: 'Cigarrillos Derby 20', category: 'Cigarrillos', purchasePrice: 1500, salePrice: 2100, stock: 40, unit: 'atado' },
  { name: 'Cigarrillos Philip Morris 20', category: 'Cigarrillos', purchasePrice: 1750, salePrice: 2450, stock: 25, unit: 'atado' },
  { name: 'Encendedor Bic', category: 'Cigarrillos', purchasePrice: 250, salePrice: 400, stock: 50, unit: 'unidad' },
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('Limpiando base de datos...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Supplier.deleteMany({});
    await Product.deleteMany({});

    console.log('Creando usuarios...');
    await User.create({
      name: 'Administrador',
      email: 'admin@toska.com',
      password: 'admin123',
      role: 'admin'
    });
    await User.create({
      name: 'Cajero Principal',
      email: 'cajero@toska.com',
      password: 'cajero123',
      role: 'cashier'
    });
    console.log('✓ Usuarios creados');

    console.log('Creando categorías...');
    const categoriesData = await Category.insertMany(categories);
    console.log(`✓ ${categoriesData.length} categorías creadas`);

    console.log('Creando proveedores...');
    const suppliersData = await Supplier.insertMany(suppliers);
    console.log(`✓ ${suppliersData.length} proveedores creados`);

    console.log('Creando productos...');
    const categoryMap = {};
    categoriesData.forEach(c => { categoryMap[c.name] = c._id; });
    const supplierMap = {};
    suppliersData.forEach(s => { supplierMap[s.name] = s._id; });

    const productsToInsert = products.map(p => ({
      name: p.name,
      category: categoryMap[p.category],
      purchasePrice: p.purchasePrice,
      salePrice: p.salePrice,
      stock: p.stock,
      minStock: 5,
      unit: p.unit,
      supplier: supplierMap['Distribuidora Norte Grande'],
    }));

    await Product.insertMany(productsToInsert);
    console.log(`✓ ${products.length} productos creados`);

    console.log('\n=================================');
    console.log('SEED COMPLETADO EXITOSAMENTE!');
    console.log('=================================');
    console.log(`Categorías: ${categoriesData.length}`);
    console.log(`Proveedores: ${suppliersData.length}`);
    console.log(`Productos: ${products.length}`);
    console.log('\nCredenciales de acceso:');
    console.log('Admin: admin@toska.com / admin123');
    console.log('Cajero: cajero@toska.com / cajero123');
    console.log('=================================\n');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedData();
