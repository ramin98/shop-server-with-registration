const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://127.0.0.1:5500', credentials: true }));

const JWT_SECRET = 'your_jwt_secret'; // Секретный ключ для подписывания JWT

// Массив для хранения пользователей
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

// Функция для проверки токена (middleware)
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const tokenValue = token.split(' ')[1]; // Извлекаем сам токен из 'Bearer TOKEN'

    jwt.verify(tokenValue, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Регистрация
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Проверка, существует ли пользователь
        const existingUser = users.find(user => user.username === username);
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Хэширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание нового пользователя
        const newUser = {
            id: users.length + 1,
            username,
            password: hashedPassword,
            cart:[]
        };

        users.push(newUser);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Авторизация
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Проверка пользователя
        const user = users.find(user => user.username === username);
        if (!user) return res.status(400).json({ message: 'User does not exist' });

        // Проверка пароля
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Создание JWT токена
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Защищенный маршрут (Dashboard)
app.get('/dashboard', authenticateToken, (req, res) => {
    res.json(req.user);
});

// Получить список товаров
app.get('/products', (req, res) => {
    res.json(products);
});

// Добавить товар в корзину
app.post('/cart', (req, res) => {
    const { productId, userId } = req.body;
    const product = products.find((p) => p.id === parseInt(productId));
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    const userIndex = users.findIndex((u) => u.username === parseInt(userId));
    users[userIndex].cart.push(product);
    res.json({ message: 'Product added to cart', product: product.id });
});

// Получить корзину пользователя
app.get('/cart/:id', (req, res) => {
    const user = users.find((u) => u.id === parseInt(params.id));
    res.json(user.cart);
});

// Удалить товар из корзины
app.delete('/cart', (req, res) => {
    const { productId, userId } = req.body;
    const userIndex = users.findIndex((u) => u.username === parseInt(userId));
    let userCart = users[userIndex].cart
    users[userIndex].cart = userCart.filter((item) => item.id !==  parseInt(productId));
    res.json({ message: 'Product removed from cart'});
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
