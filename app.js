'use strict';
console.time("create account");
function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}

function scrollToBottom (id) {
    var div = document.getElementById(id);
    div.scrollTop = div.scrollHeight - div.clientHeight;
}

const puppeteer = require('puppeteer');

(async() => {

const browser = await puppeteer.launch({headless: false, slowMo: 10});
const page = await browser.newPage();
await page.goto('https://www.mailinator.com/', {waitUntil: 'networkidle2'});

// Wait for the results to show up
await page.waitForSelector('.panel-body a');

// Extract the results from the page
const links = await page.evaluate(() => {
  const anchors = Array.from(document.querySelectorAll('.panel-body a'));
  return anchors.map(anchor => anchor.textContent);
});
const email = links[0].trim().toLocaleLowerCase();
console.log(`new email is: ${email}`);
page.close();

const accountPage = await browser.newPage();

await accountPage.goto('https://localhost:44300/#/', {waitUntil: 'networkidle2'}); //https://localhost:44300/#/  

await accountPage.click('#signup');
await accountPage.waitFor('#emailAddress');
await accountPage.waitFor('#password');
await accountPage.type('#emailAddress', `${email}`);
await accountPage.type('#password', `${email}`);
await accountPage.click('#emailSignup');
await accountPage.waitFor('#firstName');
await accountPage.waitFor('#lastName');
await accountPage.waitFor('#dateOfBirth');
await accountPage.waitFor('#firstName');
await accountPage.waitFor('#home');
await accountPage.type('#firstName', 'auto');
await accountPage.type('#lastName', 'yu');
await accountPage.type('#dateOfBirth', '25051980');
await accountPage.click('#gender');

await delay(1000);
await accountPage.click('.md-select-menu-container md-option');
await delay(1000);
await accountPage.type('#home', '78');//7 High Street, Thornbury, Victoria, Australia
await delay(1000);
//
await accountPage.waitFor('md-virtual-repeat-container');
await accountPage.click('md-virtual-repeat-container ul li');
await delay(1000);
await accountPage.evaluate(()=>{
    window.scrollTo(0,document.body.scrollHeight);
    return Promise.resolve();
});
await accountPage.click('.md-container.md-ink-ripple');
await accountPage.click('#goToNextStep');
console.log("===================>Step 1");
// https://localhost:44300/#/origination/connectToSocial
await accountPage.waitFor('a[ng-click="vm.onContinue()"]');
await accountPage.click('a[ng-click="vm.onContinue()"]')
console.log("===================>Step 2");
//https://localhost:44300/#/origination/smsVerification
await accountPage.waitFor('#mobilePhone');
await accountPage.type('#mobilePhone', '0400000000');

await delay(300);
await accountPage.waitFor('button[ng-bind="::vm.content.sendCode"]');
await accountPage.click('button[ng-bind="::vm.content.sendCode"]');

await accountPage.waitFor('#verificationCode');
await accountPage.type('#verificationCode', '123456');

await accountPage.waitFor('button[ng-bind="::vm.content.continue"]');
await accountPage.click('button[ng-bind="::vm.content.continue"]');
console.log("===================>Step 3");
//https://localhost:44300/#/origination/paymentMethod
await delay(3000);
const frames = await accountPage.frames();
const hostedPage = frames.find(f => {
    //console.log(f.name());
    return f.name() === 'hosted-payment-page';
})

await hostedPage.evaluate(() => {
    var e = document.getElementById("cardNumber");
    e.value = "4726 7800 0000 1232";
    var $e = angular.element(e);
    $e.triggerHandler('input');
    return Promise.resolve();
});

await hostedPage.evaluate(() => {
    var e = document.getElementById("cardExpiry");
    e.value = "05/23";
    var $e = angular.element(e);
    $e.triggerHandler('input');
    return Promise.resolve();
});

await hostedPage.evaluate(() => {
    var e = document.getElementById("cvc");
    e.value = "123";
    var $e = angular.element(e);
    $e.triggerHandler('input');
    return Promise.resolve();
});

await hostedPage.evaluate(() => {
    var e = document.getElementById("cardHolderName");
    e.value = "gary yu";
    var $e = angular.element(e);
    $e.triggerHandler('input');
    return Promise.resolve();
});

await hostedPage.evaluate(() => {
    var e = document.querySelector('button[ng-bind="::vm.actionName"]');
    e.click();
    return Promise.resolve();
});
console.log("===================>Step 4");
//https://localhost:44300/#/origination/identification
await accountPage.waitFor('button[ng-click="vm.toggleIdVerification()"]');
await accountPage.click('button[ng-click="vm.toggleIdVerification()"]');

await accountPage.waitFor('#driversLicenceNumber');
await accountPage.type('#driversLicenceNumber', '1111111111');


await accountPage.click('#driversLicenceState');
await delay(1000);
await accountPage.click('md-content md-option[tabindex="0"]');

await accountPage.click('#goToNextStep');
console.log("===================>Step 5");
// https://localhost:44300/#/approved
await accountPage.waitFor('#approved-continue');
await accountPage.click('#approved-continue');
await delay(1000);
await accountPage.evaluate(()=>{
    var div = document.getElementById('dialogContent_17');
    div.scrollTop = div.scrollHeight - div.clientHeight;
    return Promise.resolve();
});

await accountPage.click('#acceptContract');
console.log("Done!")
console.timeEnd("create account");
await browser.close();
})();