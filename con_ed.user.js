// ==UserScript==
// @name        coned bill downloader
// @namespace   Violentmonkey Scripts
// @match       https://www.coned.com/*
// @grant       GM_download    
// @version     1.0
// @author      -
// @description 11/13/2021, 3:11:19 PM
// ==/UserScript==
function debugLog(...messages) {
    console.log('tb debug', ...messages)
}

/**
 * 
 * @param {boolean} condition 
 * @param {string} message 
 */
function assert(condition, message) {
    if (!condition) {
        console.error('tb error', 'failed assertion', message)
    }
}

/**
 * 
 * @param {Element} element 
 * @param {string} selector 
 */
function getElementBySelector(element, selector) {
    const elementList = element.querySelectorAll(selector);
    debugLog(elementList.length)
    assert(elementList.length === 1, `expected only 1 element with selector ${selector}`)
    return elementList[0]
}

function addGlobalStyle(css) {
    let head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.innerHTML = css;
    head.appendChild(style);
}

addGlobalStyle(`.tb {
    position: fixed;
    bottom: 5%;
    right: 50%;
    font-weight: bold;
    font-size: 2rem;
    border: solid;
    border-radius: 10px;
    background: white;
    padding: 5px;
}`)


function createButton(message, onclick) {
    const btn = document.createElement("button");
    btn.innerHTML = message;
    btn.classList.add('tb')
    btn.onclick = onclick
    document.body.appendChild(btn);
}

function getAccountName() {
    const container = getElementBySelector(document, '#accountSelectedId');
    const address = getElementBySelector(container, '.account-dropdown__address').innerText.split(' ').join('_').toLowerCase()
    const account_number = getElementBySelector(container, '.account-dropdown__account-number').innerText.split(' ').at(-1).trim()
    return `${account_number}_${address}`
}


function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 
 * @param {HTMLAnchorElement} linkElement 
 * @param {string} oldHref
 * @param {number} delay 
 */
async function tillHrefChanged(linkElement, oldHref, delay) {
    while (linkElement.href === oldHref) {
        await timeout(delay)
    }
    return;
}

unsafeWindow.open = (e) => {debugLog(e)}

function getBillLinks()
{
    const links = document.querySelectorAll('.billing-payment-item__view-link');
    const linkQueue = []
    for (const link of links) {
        const linkName = link.text.trim().toLowerCase();
        if (linkName === "view bill") {
            linkQueue.push(link)
        }
    }
    return linkQueue
}

async function downloadPages() {

    const documentName = getAccountName();
    const linkQueue = getBillLinks()

    for (let linkElement of linkQueue) {
        const oldHref = linkElement.href;
        linkElement.click();
        await tillHrefChanged(linkElement, oldHref, 100)
        const downloadLink = linkElement.href;
        const date = linkElement.getAttribute('data-bill-date')
        const filename = `${documentName}_${date}.pdf`.replaceAll('-', '_')
        GM_download(downloadLink, filename)
    }

}

createButton('Download PDFs', downloadPages)

