import chalk from "chalk";
import fs from "fs";
import { getRandomProxy, loadProxies } from "./classes/proxy";
import { sosoValuRefferal } from "./classes/sosoValue";
import { generatePassword } from "./utils/generate";
import { logMessage, prompt, rl } from "./utils/logger";
import randomUserAgent from 'random-useragent';
import puppeteer from 'puppeteer';

// Function to get a random user agent
function getRandomUserAgent() {
  return randomUserAgent.getRandom();
}

// Simulate random mouse movement
async function simulateMouseMovement(page) {
  const x = Math.floor(Math.random() * 200) + 100;
  const y = Math.floor(Math.random() * 200) + 100;
  await page.mouse.move(x, y);
}

// Simulate random scrolling
async function simulateScroll(page) {
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.evaluate((scrollHeight) => {
    window.scrollTo(0, scrollHeight * Math.random());
  }, scrollHeight);
  await page.waitForTimeout(Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000); // Random wait after scroll
}

async function main(): Promise<void> {
  console.log(
    chalk.cyan(`
░█▀▀░█▀█░█▀▀░█▀█░░░█░█░█▀█░█░░░█░█░█▀▀
░▀▀█░█░█░▀▀█░█░█░░░▀▄▀░█▀█░█░░░█░█░█▀▀
░▀▀▀░▀▀▀░▀▀▀░▀▀▀░░░░▀░░▀░▀░▀▀▀░▀▀▀░▀▀▀
        By : El Puqus Airdrop
        github.com/ahlulmukh
      Use it at your own risk
  `)
  );

  const refCode = await prompt(chalk.yellow("Enter Referral Code: "));
  const count = parseInt(await prompt(chalk.yellow("How many do you want? ")));
  const captchaMethod = await prompt(
    chalk.yellow(`Choose Captcha Metode \n1.2Captcha\n2.Puppeteer (Free) :`)
  );
  const proxiesLoaded = loadProxies();
  if (!proxiesLoaded) {
    console.log(chalk.yellow("No proxy available. Using default IP."));
  }
  let successful = 0;

  const sosoValueaccount = fs.createWriteStream("accounts.txt", { flags: "a" });

  for (let i = 0; i < count; i++) {
    console.log(chalk.white("-".repeat(85)));
    logMessage(i + 1, count, "Process", "debug");
    const currentProxy = await getRandomProxy();
    const sosoValue = new sosoValuRefferal(refCode, currentProxy, captchaMethod);

    try {
      const email = sosoValue.generateTempEmail();
      const password = generatePassword();
      const registered = await sosoValue.registerAccount(email, password.encodedPassword);
      if (registered) {
        successful++;
        sosoValueaccount.write(`Email Address : ${email}\n`);
        sosoValueaccount.write(`Password : ${password.password}\n`);
        sosoValueaccount.write(`Invitation Code : ${registered.invitationCode}\n`);
        sosoValueaccount.write(`===================================================================\n`);
      }
    } catch (err) {
      logMessage(i + 1, count, `Error: `, "error");
    }
  }

  sosoValueaccount.end();

  console.log(chalk.magenta("\n[*] Dono bang!"));
  console.log(chalk.green(`[*] Account dono ${successful} dari ${count} akun`));
  console.log(chalk.magenta("[*] Result in accounts.txt"));
  rl.close();
}

main().catch((err) => {
  console.error(chalk.red("Error occurred:"), err);
  process.exit(1);
});
