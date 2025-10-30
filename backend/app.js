const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 5000;

mongoose.connect('mongodb+srv://**********************:***************@cluster0.kxjtzmy.mongodb.net/?appName=Cluster0', 
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Mock product data schema and model
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String
});
const Product = mongoose.model('Product', productSchema);

// Cart item schema
const cartItemSchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  qty: Number,
  product: Object // Store snapshot of product (name, price)
});
const CartItem = mongoose.model('CartItem', cartItemSchema);

// Seed products if empty
app.get('/api/products', async (req, res) => {
  let products = await Product.find();
  if (products.length === 0) {
    products = await Product.insertMany([
      {
        name: 'Wireless Headphones',
        price: 99,
        image: 'https://m.media-amazon.com/images/I/41KJfT62kZL._SY300_SX300_QL70_FMwebp_.jpg'
      },
      {
        name: 'Bluetooth Speaker',
        price: 49,
        image: 'https://m.media-amazon.com/images/I/41xqrbyovFL._SY300_SX300_QL70_FMwebp_.jpg'
      },
      {
        name: 'Smart Watch',
        price: 36,
        image: 'https://m.media-amazon.com/images/I/61pIzNaNRWL.jpg'
      },
      {
        name: 'USB-C Adapter',
        price: 25,
        image: 'https://m.media-amazon.com/images/I/31RUesVV6tS._SY300_SX300_QL70_FMwebp_.jpg'
      },
      {
        name: 'Portable Charger',
        price: 75,
        image: 'https://m.media-amazon.com/images/I/619C1LmIWEL.jpg'
      }
    ]);
  }
  res.json(products);
});

// Add to cart
app.post('/api/cart', async (req, res) => {
  const { productId, qty } = req.body;
  if (!productId || !qty) {
    return res.status(400).json({ error: 'productId and qty required' });
  }
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ error: 'product not found' });

  const cartItem = new CartItem({
    productId,
    qty,
    product: { name: product.name, price: product.price }
  });
  await cartItem.save();
  res.json(cartItem);
});

// Get cart items + total
app.get('/api/cart', async (req, res) => {
  const cartItems = await CartItem.find();
  const total = cartItems.reduce((acc, item) => acc + item.qty * item.product.price, 0);
  res.json({ cartItems, total });
});

// Remove cart item
app.delete('/api/cart/:id', async (req, res) => {
  await CartItem.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Checkout - return mock receipt
app.post('/api/checkout', (req, res) => {
  const { cartItems } = req.body;
  if (!cartItems || !Array.isArray(cartItems)) {
    return res.status(400).json({ error: 'cartItems required as array' });
  }
  const total = cartItems.reduce((acc, item) => acc + item.qty * item.product.price, 0);
  const receipt = {
    total,
    timestamp: new Date().toISOString(),
    items: cartItems
  };
  CartItem.deleteMany().exec(); // clear cart after checkout
  res.json(receipt);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
