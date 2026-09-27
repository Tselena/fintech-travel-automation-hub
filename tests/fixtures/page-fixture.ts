import { test as baseTest } from '@playwright/test';

export const test = baseTest.extend({
    page: async ({ page }, use) => {
        await page.route('**/*', (route) => {
            const url = route.request().url().toLowerCase();
            const resourceType = route.request().resourceType();

            if (
                url.includes('flocktory') || url.includes('tm.js') || url.includes('analytics') || resourceType === 'image'
            ) {
                return route.abort();
            }
            return route.continue();
        });
        await use(page);
    },
});


export { expect } from '@playwright/test';