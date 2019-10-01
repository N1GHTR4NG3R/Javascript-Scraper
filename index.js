// Required modules
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const settings = require("./assets/settings.json");

// Require the file system to be able to save the information
const fs = require("fs");

async function marketPage(page){
    try {
        await page.goto(
            // Disable timout error due to time it takes to load page!
            `${settings.URL.SalesPage}`,{
                timeout: 0,
            }
            );
        console.log("Loaded Sales API, apologies for the delay!");
        const salesApi = await page.content();
        const $ = cheerio.load(salesApi);
        const salesStr = $('body > pre').text();
        fs.writeFileSync("../bots/GuildLife/scraped_files/current_sales.json", salesStr);
        console.log("Sales list extracted!");
    } catch (error) {
        console.error(error);
    }
}

async function charPage(page){
    try {
        // Nothing to use here just yet maybe in future - navigate to Trade page
        await page.evaluate(() => {
            // Most likely multiple items here - default to first - Will need to create an iteration for trade posts!
            document.querySelector('.char_guild_row .char_guild_col1 a').click();
        });
        await page.waitForNavigation();
        console.log("Redirected to market, this will take a minute or two!");
    } catch (error) {
        console.error(error);
    }
}

async function scrapePlayerCount(page){
    try {
        const data = await page.content();
        const $ = cheerio.load(data);
        // Get the information
        const plCount = $('#wrapper > div.container.clearfix > div.news_main > div > div > div.dashboard > div.dashboard_row2 > div.dashboard_world > div:nth-child(6)').text();
        // Title
        const plCountTitle = plCount.substring(0,14);
        // Amount
        const plCountAmount = plCount.substring(15, 19);
        // Place into an Object
        const plCountObj = { 
            Title: plCountTitle, 
            Amount: plCountAmount 
        };
        // Convert Object to string
        const plCountOut = JSON.stringify(plCountObj, null, "\t");
        fs.writeFileSync("../bots/GuildLife/scraped_files/player_count.json", plCountOut);
        console.log("Got Player count!");
        // Once data is scraped, Navigate to next page! 
        await page.evaluate(() => {
            // If multiple elements here - defaults to first selector
            document.querySelector('.world_char .name a').click();
        });
        await page.waitForNavigation();
        console.log("Redirected to profile page.");
    } catch (error) {
        console.error(error);
    }
}

async function accPage(page){
        console.log("Loading...");
        try {
        await page.waitFor('.bil_submenu_content');
        await page.evaluate(() => {
            document.querySelector('.bil_submenu_content a').click();
        });
        await page.waitForSelector('.world_char');
        console.log("Redirected to Dashboard");
    } catch (error){
        console.error(error);
    }
}

async function signIn(page){
    try {
        // Define log-in Details
        const password = settings.password;
        const email = settings.email;
        // Go through the log-in process here
            const clickSignIn = async (page, text) => {
            // const loginPage = await page.content();
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
            }
        // Action above functions
        await clickSignIn(page, 'Sign In');
    } catch (error) {
        console.error(error);
    }
}

async function loginPage(page){
    try {
        // Navigate to login page
        await page.goto(`${settings.URL.Login}`);
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
        const logInPage = loginPage(page);
        await logInPage;
        // Get page Data
        const content = await page.content();
        // load the page to grab elements
        const $ = cheerio.load(content);
        const logIn = signIn(page, $);
        await logIn;
        const accountPage = accPage(page);
        await accountPage;
        const playerCount = scrapePlayerCount(page);
        await playerCount;
        const charsPage = charPage(page);
        await charsPage;
        const markPage = marketPage(page);
        await markPage;
        const closeProcess = browser.close();
        await closeProcess;
    } catch (error) {
        console.error(error);
    }
}

initBrowser();