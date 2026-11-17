# NU.nl News Widget

**Live demo:** https://2159863-sys.github.io/M-Cube-Stage-Opdracht/

A 1920x1080 news widget that shows the latest news from the NU.nl RSS feed.
It runs on its own without any user interaction, which makes it suitable for display screens.

Made as an internship assignment for M-Cube Netherlands.

## Features

### Minimum requirements
- Recreates the provided design (Arial font, background image and logo)
- Works without user interaction
- Built at 1920x1080 pixels
- Shows the latest news from the NU.nl RSS feed

### Extra requirements
- **Caching / offline:** the RSS feed and images are saved in the browser cache
  with a service worker, so the widget also works offline
- **Multiple pages:** shows 2 news items per page and switches every 10 seconds
- **Progress bar:** shows how long the current page stays on screen
- **Animations:** news cards fade and slide in when a new page appears

### Also
- The feed is refreshed every 5 minutes instead of continuously
- On screens that are not 1920x1080, the widget scales proportionally so it still fits

## How to run

**Option 1:** open the live demo link above.

**Option 2:** run it locally.
1. Open the project folder in VS Code
2. Install the **Live Server** extension
3. Right-click `index.html` → **Open with Live Server**

> Opening `index.html` directly (`file://`) will not work, because `fetch` and
> the service worker need a local server.

## Project structure

```
├── index.html          Structure of the widget and the news card template
├── style.css           All styling and animations
├── script.js           Fetches the feed, shows the news and switches pages
├── service-worker.js   Saves the feed and images for offline use
└── assets/
    ├── background.jpg
    └── logo.png
```

## How it works

1. `script.js` fetches the RSS feed (XML) with `fetch`
2. `DOMParser` reads the XML, and each `<item>` becomes an object with a title,
   description and image
3. The news card `<template>` is filled with each item and shown on the page
4. Every 10 seconds the next page is shown, and after the last page it starts again
5. The service worker saves the feed and images, and uses the saved versions when offline

## Built with
- HTML
- CSS
- JavaScript (ES6), with no frameworks or libraries
