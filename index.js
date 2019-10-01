// Required modules
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const settings = require("./assets/settings.json");

// Require the file system to be able to save the information
const fs = require("fs");

async function marketPage(browser, page){
    // Scrape Market data
    await page.content();
    await page.goto(
        // Disable timout error due to time it takes to load page!
        `${settings.URL.SalesPage}`,{
            timeout: 0,
        }
        );
    console.log("Loaded Sales API, Apologies for the delay!");
    const salesApi = await page.content();
    const $ = cheerio.load(salesApi);
    const salesStr = $('body > pre').text();
    fs.writeFileSync("../bots/GuildLife/scraped_files/current_sales.json", salesStr);
    console.log("Sales list extracted!");
    const closeProcess = browser.close();
    await closeProcess;
}

async function charPage(browser, page){
    // Nothing to use here just yet - navigate to Trade page
    console.log("Char page is more for personal use - Navigated here in-case of future needs!");
    console.log("Will need to add a loop functionality to be able to select the right trade post if you have a favourite!");
    await page.evaluate(() => {
        // Most likely multiple items here - default to first
        // At some point, will need to iterate through to select right trade post!
        document.querySelector('.char_guild_row .char_guild_col1 a').click();
    });
    await page.waitForNavigation();
    console.log("Changed to market page, this will take a minute or two!");
    const markPage = marketPage(browser, page);
    await markPage;
}

async function scrapePlayerCount(browser, page){
    const charName = settings.character;
    // Write the player count data to file!
    const data = await page.content();
    const $ = cheerio.load(data);
    // Get the information
    const plCount = $('#wrapper > div.container.clearfix > div.news_main > div > div > div.dashboard > div.dashboard_row2 > div.dashboard_world > div:nth-child(6)').text();
    // Retrieve the "title" from the string
    const plCountTitle = plCount.substring(0,14);
    // retrieve the "amount" from the string
    const plCountAmount = plCount.substring(15, 18);
    // convert amount to a number
    const plCountNo = parseInt(plCountAmount);
    // Place into an Object
    const plCountObj = { 
        Title: plCountTitle, 
        Amount: plCountNo 
    };
    // Convert Object to string and output in a readable format, keeping it parsed to use
    const plCountOut = JSON.stringify(plCountObj, null, "\t");
    fs.writeFileSync("../bots/GuildLife/scraped_files/player_count.json", plCountOut);
    console.log("Got Player count!");
    // Once data is scraped, Navigate to next page! 
    await page.evaluate(() => {
        // If multiple elements here - defaults to first one (First character in list)
        document.querySelector('.world_char .name a').click();
    });
    await page.waitForNavigation();
    console.log("Changed page to profile page.");
    const charsPage = charPage(browser, page);
    await charsPage;
}

async function accPage(browser, page){
    console.log("Loading...");
    try {
    await page.waitFor('.bil_submenu_content');
    await page.evaluate(() => {
        document.querySelector('.bil_submenu_content a').click();
    });
    await page.waitForSelector('.world_char');
    console.log("Changed page to: " + page.url());
    const playerCount = scrapePlayerCount(browser, page);
    await playerCount;
    } catch (error){
        console.error(error);
    }
}

async function signIn(browser, page, $){
    try {
    // Define log-in Details
    const password = settings.password;
    const email = settings.email;
    // Go through the log-in process here
        const clickSignIn = async (page, text) => {
            const loginPage = await page.content();
            // Have to "wait" for elements before inputting.
            await page.waitFor('input[name="email"]');
            // Input data.
            await page.type('input[name="email"]', `${email}`);
            await page.waitFor('input[name = "password"]');
            await page.type('input[name="password"]', `${password}`);
            await page.evaluate(() => {
                document.querySelector('.button-with-bg').click();
            });
            await page.waitForNavigation();
            // Confirm log-in
            console.log("Logged in at: " + page.url());
            const accountPage = accPage(browser, page);
            await accountPage;
        }
    // Action above functions
    await clickSignIn(page, 'Sign In');
    } catch (error) {
        console.error(error);
    }
}

async function loginPage(browser, page){
    try {
    // Navigate to login page
    await page.goto(`${settings.URL.Login}`);
    // Get page Data
    const content = await page.content();
    // load the page to grab elements
    const $ = cheerio.load(content);
    const logIn = await signIn(browser, page, $);
    logIn;
    } catch (error) {
        console.error(error);
    }
} 

async function initBrowser() {
    try {
    // Initiate and launch browser - Set headless to true for a server!
    const browser = await puppeteer.launch({headless: true, defaultViewport: null, args: ['--no-sandbox']});
    // Open new tab
    const page = await browser.newPage();
    // init scraping
    const content = await loginPage(browser, page);
    } catch (error) {
        console.error(error);
    }
}

initBrowser();