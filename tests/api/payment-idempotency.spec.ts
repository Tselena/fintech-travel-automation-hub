import { test, expect } from '@playwright/test';
import crypto from 'crypto';
import { request } from 'http';

test.describe.configure({ mode: 'serial' }); 

test.describe('Проверка идемпотентности и статуса транзакций', () => {
    test.beforeEach(async ({ request }, testInfo) => {
        test.skip(testInfo.project.name !== 'fintech', 'Этот тест предназначен только для проекта FinTech');
        
        const clearResponse = await request.post('/payments/clear');
        expect(clearResponse.status()).toBe(200);
    });

    test('Транзакция успешно создана и при повторе возвращается тот же результат', async ({ request }) => {
        const idempotencyKey = crypto.randomUUID();
        const transactionPayload = {
            amount: 5000,
            currency: 'RUB',
            target: 'travel-booking-hub'
        };

        // Создание транзакции
        const firstResponse = await request.post('/payments', {
            headers: { 'idempotency-key': idempotencyKey },
            data: transactionPayload
        });
        expect(firstResponse.status()).toBe(201);

        const firstResponseBody = await firstResponse.json();
        expect(firstResponseBody).toHaveProperty('id');
        expect(firstResponseBody.amount).toBe(5000);

        const createdTransactionId = firstResponseBody.id;

        // Проверка идемпотентности
        const duplicateResponse = await request.post('/payments', {
            headers: { 'idempotency-key': idempotencyKey },
            data: transactionPayload
        });
        expect(duplicateResponse.status()).toBe(201);

        const duplicateResponseBody = await duplicateResponse.json();
        expect(duplicateResponseBody.id).toBe(createdTransactionId);

        // Проверка статуса созданной транзакции
        const statusResponse = await request.get(`/payments/${createdTransactionId}`);
        expect(statusResponse.status()).toBe(200);

        const statusResponseBody = await statusResponse.json();
        expect(statusResponseBody.id).toBe(createdTransactionId);
        expect(statusResponseBody.amount).toBe(5000);
    });
})