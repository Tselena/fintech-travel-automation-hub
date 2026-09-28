import { type Page, type Locator, expect } from "@playwright/test";
import { autocompleteData } from "../tests/fixtures/mock-hotels.js";

export class MainPage {
  private readonly page: Page;
  private readonly destinationInput: Locator;
  private readonly firstSuggestion: Locator;

  constructor(page: Page) {
    this.page = page;
    this.destinationInput = page.getByTestId("destination-input").first();
    this.firstSuggestion = page
      .locator('[class*="Suggest_destinationTitle"]')
      .first();
  }

  async open() {
    await this.page.goto("/", { waitUntil: "commit" });
  }

  async setupAutocompleteMock() {
    await this.page.route("**/*", async (route) => {
      const request = route.request();
      const url = request.url().toLowerCase();
      const resourceType = request.resourceType();

      if (
        (resourceType === "fetch" || resourceType === "xhr") &&
        (url.includes("multicomplete") ||
          url.includes("suggest") ||
          url.includes("autocomplete") ||
          url.includes("search"))
      ) {
        console.log(`[MOCK STUB] Перехвачен запрос: ${request.url()}`);

        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(autocompleteData),
        });
      }
      return route.continue();
    });
  }

  async fillDestination(city: string) {
    await this.destinationInput.waitFor({ state: "visible", timeout: 7000 });

    // await this.destinationInput.page().waitForLoadState("networkidle");

    await this.destinationInput.click();
    await this.destinationInput.focus();

    await this.destinationInput.fill("");
    await this.destinationInput.pressSequentially(city, { delay: 150 });

    const currentValue = await this.destinationInput.inputValue();
    if (currentValue !== city) {
      console.warn(
        `[Flaky-Fix] Ввод сбился (получено: "${currentValue}"). Повторный ввод через fill`,
      );
      await this.destinationInput.fill(city);
    }
  }

  async selectFirstSuggestionByClass() {
    await this.firstSuggestion.waitFor({ state: "visible", timeout: 7000 });
    await this.firstSuggestion.click({ force: true });
  }

  async selectSuggestionByKeyboard() {
    await this.page.waitForTimeout(1000);
    await this.destinationInput.press("ArrowDown");
    await this.destinationInput.press("Enter");
  }

  async selectMockedSuggestion() {
    const fakeSuggestion = this.page.getByText(/Атлантида/i).first();
    await fakeSuggestion.waitFor({ state: "visible", timeout: 7000 });
    await fakeSuggestion.click();
  }

  async verifyInputContainsValue(expectedValue: string | RegExp) {
    await expect(this.destinationInput).toHaveValue(expectedValue);
  }
}
