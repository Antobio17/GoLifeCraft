import { Locator, Page, expect } from "@playwright/test";
import { Ds } from "../../../support/ds";

export class LoginPage {
  private readonly ds: Ds;

  constructor(private readonly page: Page) {
    this.ds = new Ds(page);
  }

  async goto(): Promise<void> {
    await this.page.goto("/login");
    await expect(this.ds.input("login-email")).toBeVisible();
  }

  get email(): Locator {
    return this.ds.input("login-email");
  }

  get password(): Locator {
    return this.ds.input("login-password");
  }

  get submit(): Locator {
    return this.ds.button("login-submit");
  }

  async forgotPassword(): Promise<void> {
    await this.ds.click("login-forgot");
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
