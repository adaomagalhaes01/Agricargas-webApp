const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'sua_chave_secreta_super_segura';
const DB_FILE = path.join(__dirname, 'users.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Inicializa "Banco de Dados" (Arquivo JSON)
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

const getUsers = () => JSON.parse(fs.readFileSync(DB_FILE));
const saveUsers = (users) => fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));

// Rota de Registro
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    const users = getUsers();

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), name, email, password: hashedPassword };

    users.push(newUser);
    saveUsers(users);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, SECRET_KEY, { expiresIn: '1d' });

    // Remove senha antes de enviar para o cliente
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ token, user: userWithoutPassword });
});

// Rota de Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1d' });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
});

// Rota de Perfil (Exemplo de rota protegida)
app.get('/api/me', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Não autorizado' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const users = getUsers();
        const user = users.find(u => u.id === decoded.id);
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (err) {
        res.status(401).json({ message: 'Token inválido' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend rodando em http://localhost:${PORT}`);
});
