import { test } from '../fixtures/page-fixture.js';
import {MainPage} from '../../pages/mainPage.js'


test.beforeEach(async ({}, testInfo) => {
  test.skip(
    testInfo.project.name === "fintech",
    "Этот тест не предназначен для проекта FinTech",
  );
});


test("UI-test: Выбор направления на сайте", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.open();
  await mainPage.fillDestination("Москва");
  await mainPage.selectSuggestionByKeyboard();
  await mainPage.verifyInputContainsValue(/Москва/i);
  await page.waitForTimeout(500);
});



test("Mock-test: Подмена городов в поисковой строчке", async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.setupAutocompleteMock();
  await mainPage.open();
  await mainPage.fillDestination("Абра");
  await mainPage.selectMockedSuggestion();
  await mainPage.verifyInputContainsValue(/Атлантида/i);
});


  


  

  

