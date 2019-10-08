# Javascript-Scraper
 Simple scraper in Javascript
 
 !!! IMPORTANT !!!

Before using this be sure you have permission from the Site Admin - This is my code, and have open sourced it to try and gain better knowledge from other developers. I have permission to use it and to share this with the community - but I would advise if you use it, to get permission beforehand.

!!! IMPORTANT !!!

====================================================

I built this purely to help me with another project, but figured I would put it on here, so if anyone is interested they could give me some tips, advice or feedback to get this to be dynamic.

This scraper was built to extract the information I needed from a particular website:
"www.lifeisfeudal.com"

It can be modified to use on other sites (With Permission).

====================================================

It works both server side and locally.

You will need to input login details in the assets/settings.json file (Seen here as sample/settings, Just rename it).

File directories will need to be modified for your setup.

You will need to install puppeteer.js, cheerio.js  and some dependencies found here: https://github.com/GoogleChrome/puppeteer/issues/3443 for this to work.

If you would like it to display in a GUI so you can see what it does, remove `args: [ '--no-sandbox']` from the initbrowser function parameters, and also change `headless: true` to `headless: false`

Have fun!
