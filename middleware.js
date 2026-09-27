
export default (req, res, next) => {
    const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
    console.log(`[Middleware] Пришел POST-запрос. Ключ: ${idempotencyKey}`)

    if (req.method === 'POST ' && idempotencyKey) {
        console.log(`[Middleware] Входящий POST. Ключ: ${idempotencyKey}`);

        if (idempotencyStore.has(idempotencyKey)) {
            const savedResponse = idempotencyStore.get(idempotencyKey);
            console.og(`[Idempotency] Повторный запрос перехвачен для ключа ${key}`);
            
            res.status(savedResponse.status);
            res.set('Content-Type', 'application/json');
            return res.send(savedResponse.body);
        }

        const originalSend = res.send;
        res.send = function (body) {
            idempotencyStore.set(idempotencyKey, {
                status: res.statusCode || 201,
                body: body,
            });
            console.log(`[Middleware] Успешно сохранили ответ в кэш для ключа: ${idempotencyKey}`);
            return originalSend.call(this, body);
        };
    }
    next();
};

