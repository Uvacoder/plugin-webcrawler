const { JSDOM } = require('jsdom');

async function crawlPage(baseURL, currentURL, pages) {
  const baseURLObj = new URL(baseURL);
  const currentURLObj = new URL(currentURL);
  if (baseURLObj.hostname !== currentURLObj.hostname) {
    return pages;
  }

  const normalizedCurrentURL = normalizeURL(currentURL);
  if (pages[normalizedCurrentURL] > 0) {
    pages[normalizedCurrentURL]++;
    return pages;
  }

  pages[normalizedCurrentURL] = 1;

  console.log(`crawling: ${currentURL}`);

  let HTMLBody = '';

  try {
    const res = await fetch(currentURL);

    if (res.status > 399) {
      console.log(
        `error in fetch with statuscode ${res.status} on page ${currentURL}`
      );
      return pages;
    }

    const contentType = res.headers.get('content-type');
    if (!contentType.includes('text/html')) {
      console.log(
        `non HTML response, content type: ${contentType} on page ${currentURL}`
      );
      return pages;
    }

    HTMLBody = await res.text();

    const nextURLs = getURLsFromHTML(HTMLBody, baseURL);

    for (const nextURL of nextURLs) {
      pages = await crawlPage(baseURL, nextURL, pages);
    }
  } catch (error) {
    console.log(`error in fetch: ${error.message} on page ${currentURL}`);
  }
  return pages;
}

function getURLsFromHTML(htmlBody, baseURL) {
  const urls = [];
  const dom = new JSDOM(htmlBody);
  const linkElements = dom.window.document.querySelectorAll('a');
  for (const linkElement of linkElements) {
    if (linkElement.href.slice(0, 1) === '/') {
      try {
        urls.push(new URL(linkElement.href, baseURL).href);
      } catch (error) {
        console.log(`Error: ${error.message}: ${linkElement.href}`);
      }
    } else {
      try {
        urls.push(new URL(linkElement.href).href);
      } catch (error) {
        console.log(`Error: ${error.message}: ${linkElement.href}`);
      }
    }
  }
  return urls;
}

function normalizeURL(urlString) {
  const urlObj = new URL(urlString);
  const hostPath = `${urlObj.hostname}${urlObj.pathname}`;
  if (hostPath.length > 0 && hostPath.slice(-1) === '/') {
    return hostPath.slice(0, -1);
  }
  return hostPath;
}

module.exports = {
  normalizeURL,
  getURLsFromHTML,
  crawlPage,
};
