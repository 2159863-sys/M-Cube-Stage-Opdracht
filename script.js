const RSS_URL = "https://rss.app/feeds/LrTk1cMRxeTKDJHz.xml";
const ITEMS_PER_PAGE = 2;
const PAGE_DURATION = 10000;      // 10 seconds per page
const REFRESH_INTERVAL = 300000;  // reload the feed every 5 minutes
const RETRY_DELAY = 30000;        // try again after 30 seconds if there is no news
const WIDGET_WIDTH = 1920;
const WIDGET_HEIGHT = 1080;

const WIDGET = document.querySelector(".news-widget");
const NEWS_LIST = document.querySelector(".news-list");
const STATUS = document.querySelector(".widget-status");
const PROGRESS = document.querySelector(".page-progress");
const PROGRESS_FILL = document.querySelector(".page-progress-fill");
const CARD_TEMPLATE = document.querySelector(".news-card-template");

let newsItems = [];
let currentPage = 0;

// Download the RSS feed as text.
async function fetchFeed() {
    const RESPONSE = await fetch(RSS_URL);

    if (!RESPONSE.ok) {
        throw new Error("Could not load the RSS feed.");
    }

    return RESPONSE.text();
}

// Get the text of a tag inside an item, or an empty string if it is missing.
function getText(item, tagName) {
    const ELEMENT = item.querySelector(tagName);

    if (ELEMENT) {
        return ELEMENT.textContent;
    } else {
        return "";
    }
}

// Get the image url from the <enclosure> tag.
function getImageUrl(item) {
    const ENCLOSURE = item.querySelector("enclosure");

    if (ENCLOSURE) {
        return ENCLOSURE.getAttribute("url");
    } else {
        return "";
    }
}

// Turn one <item> into a simple object.
function createNewsItem(item) {
    return {
        title: getText(item, "title"),
        description: getText(item, "description"),
        image: getImageUrl(item)
    };
}

// Turn the XML text into a list of news objects.
function parseFeed(xmlText) {
    const XML = new DOMParser().parseFromString(xmlText, "text/xml");
    const ITEMS = [...XML.querySelectorAll("item")];
    return ITEMS.map(createNewsItem);
}

// Fill a copy of the template with one news item.
function createNewsCard(newsItem) {
    const CARD = CARD_TEMPLATE.content.cloneNode(true);
    const IMAGE = CARD.querySelector(".news-image");

    IMAGE.src = newsItem.image;
    IMAGE.alt = newsItem.title;
    CARD.querySelector(".news-title").textContent = newsItem.title;
    CARD.querySelector(".news-description").textContent = newsItem.description;

    return CARD;
}

// Restart the progress bar animation from empty to full.
function startProgressBar() {
    PROGRESS_FILL.animate(
        [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
        { duration: PAGE_DURATION }
    );
}

// Show the news items of the current page.
function showPage() {
    const START = currentPage * ITEMS_PER_PAGE;
    const PAGE_ITEMS = newsItems.slice(START, START + ITEMS_PER_PAGE);

    NEWS_LIST.replaceChildren(...PAGE_ITEMS.map(createNewsCard));
    startProgressBar();
}

// Go to the next page, and back to the first page after the last one.
function goToNextPage() {
    const PAGE_COUNT = Math.ceil(newsItems.length / ITEMS_PER_PAGE);

    currentPage = (currentPage + 1) % PAGE_COUNT;
    showPage();
}

// Load the feed and save the news items.
async function loadNews() {
    try {
        const XML_TEXT = await fetchFeed();
        newsItems = parseFeed(XML_TEXT);
    } catch (error) {
        console.error(error);
    }
}

// Scale the 1920x1080 widget so it fits any screen size.
function scaleWidget() {
    const SCALE = Math.min(
        window.innerWidth / WIDGET_WIDTH,
        window.innerHeight / WIDGET_HEIGHT
    );

    WIDGET.style.setProperty("--widget-scale", SCALE);
}

// Register the service worker that saves the feed and images for offline use.
function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("service-worker.js");
    }
}

// Load the news once, then keep switching pages and refreshing the feed.
async function startWidget() {
    await loadNews();

    if (newsItems.length === 0) {
        STATUS.textContent = "No news available.";
        setTimeout(startWidget, RETRY_DELAY);
        return;
    }

    STATUS.hidden = true;
    PROGRESS.hidden = false;
    showPage();

    setInterval(goToNextPage, PAGE_DURATION);
    setInterval(loadNews, REFRESH_INTERVAL);
}

window.addEventListener("resize", scaleWidget);
scaleWidget();
registerServiceWorker();
startWidget();