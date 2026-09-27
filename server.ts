
import express from 'express';
import { Request, Response } from 'express';
import fs from 'fs';
import idempotencyMiddleware from './middleware.js';
import { router } from 'json-server';
import { request } from 'http';

interface Payment {
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    target?: string;
}

const idempotencyStore = new Map();

const app = express();
app.use(express.json());

app.use(idempotencyMiddleware);

// Хелсчек для корня
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Mock server is ready' });
});
// Хелсчек для эндпоинта /index.html
app.get('/index.html', (req: Request, res: Response) => {
  res.status(200).send('<html><body>Mock Server Ready</body></html>');
});

app.post('/payments/clear', (req: Request, res: Response) => {
    try {
        idempotencyStore.clear();
        console.log('[Server] Хранилище ключей идемпотентности очищено');

        const emptyDb = { payment: [] };
        fs.writeFileSync('db.json', JSON.stringify(emptyDb, null, 2));
        console.log('[Server] База данных db.json успешно очищена');

        return res.status(200).json({
            message: 'База данных и ключи демпотентности успешно очищены для теста',
        });
    } catch (error) {
        console.error('[Server] Ошибка при очистке: ', error);
        return res.status(500).json({ error: 'Не удалось очистить окружение' });
    }
});

function readDb() {
    if (!fs.existsSync('db.json')) {
        fs.writeFileSync('db.json', JSON.stringify({ payments: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync('db.json', 'utf-8'));
};

app.post('/payments', (req, res) => {
    const db = readDb();
    const newPayment: Payment = {
        id: String((db.paymnents?.length || 0) + 1),
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        ...req.body
    }
     
    if (!db.payments) db.payments = [];
    db.payments.push(newPayment);
    fs.writeFileSync('db.json', JSON.stringify(db, null, 2));

    res.status(201).json(newPayment);
});

app.get('/payments/:id', (req: Request, res: Response) => {
    const db = readDb();
    const transaction = (db.payments as Payment[])?.find((payment: Payment) => payment.id === req.params.id);

    if (!transaction) {
        return res.status(404).json({ error: "Транзакция не найдена" });
    }
    res.status(200).json(transaction);
});

app.listen(3000, () => console.log('Идемпотентный мок-сервер запущен на порту 3000'));