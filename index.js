// Импортируем необходимые модули
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

// Middleware
app.use(bodyParser.json());
app.use(cors());


// Данные для демонстрации
let users = []; // Массив для хранения пользователей
const products = [
    { id: 1, name: 'Product 1', price: 100 },
    { id: 2, name: 'Product 2', price: 200 },
    { id: 3, name: 'Product 3', price: 300 },
    { id: 4, name: 'Product 4', price: 400 },
    { id: 5, name: 'Product 5', price: 500 },
    { id: 6, name: 'Product 6', price: 600 },
    { id: 7, name: 'Product 7', price: 700 },
    { id: 8, name: 'Product 8', price: 800 },
    { id: 9, name: 'Product 9', price: 900 },
    { id: 10, name: 'Product 10', price: 1000 },
];

// Middleware для проверки токена
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token not provided' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

// Роуты

// Регистрация
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = users.find((u) => u.username === username);
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = { username, password, cart: [] };
    users.push(newUser);
    res.status(201).json({ message: 'User registered successfully' });
});

// Авторизация
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

// Получить список товаров
app.get('/products', (req, res) => {
    res.json(products);
});

// Добавить товар в корзину
app.post('/cart', authenticateToken, (req, res) => {
    const { productId } = req.body;
    const product = products.find((p) => p.id === productId);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    const user = users.find((u) => u.username === req.user.username);
    user.cart.push(product);
    res.json({ message: 'Product added to cart', cart: user.cart });
});

// Получить корзину пользователя
app.get('/cart', authenticateToken, (req, res) => {
    const user = users.find((u) => u.username === req.user.username);
    res.json(user.cart);
});

// Удалить товар из корзины
app.delete('/cart', authenticateToken, (req, res) => {
    const { productId } = req.body;
    const user = users.find((u) => u.username === req.user.username);
    user.cart = user.cart.filter((item) => item.id !== productId);
    res.json({ message: 'Product removed from cart', cart: user.cart });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
