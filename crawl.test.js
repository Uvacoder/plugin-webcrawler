const { normalizeURL, getURLsFromHTML } = require('./crawl.js');
const { test, expect } = require('@jest/globals');

test('NormalizeURL: Get hostname and path', () => {
  const input = 'https://blog.boot.dev/path';
  const actual = normalizeURL(input);
  const expected = 'blog.boot.dev/path';
  expect(actual).toEqual(expected);
});

test('NormalizeURL: Strip trailing slash', () => {
  const input = 'https://blog.boot.dev/path/';
  const actual = normalizeURL(input);
  const expected = 'blog.boot.dev/path';
  expect(actual).toEqual(expected);
});

test('NormalizeURL: Normalize capitals', () => {
  const input = 'https://BLOG.boot.dev/path/';
  const actual = normalizeURL(input);
  const expected = 'blog.boot.dev/path';
  expect(actual).toEqual(expected);
});

test('NormalizeURL: Accept another protocol', () => {
  const input = 'http://blog.boot.dev/path/';
  const actual = normalizeURL(input);
  const expected = 'blog.boot.dev/path';
  expect(actual).toEqual(expected);
});

test('getURLsFromHTML: Absolute URLS', () => {
  const inputHTMLBody = `
    <html>
        <body>
            <a href="https://blog.boot.dev/path/">
            Boot.dev blog
            </a>
        </body>
    </html>
    `;
  const inputBaseURL = 'https://blog.boot.dev/path/';
  const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL);
  const expected = ['https://blog.boot.dev/path/'];
  expect(actual).toEqual(expected);
});

test('getURLsFromHTML: Relative URLS', () => {
  const inputHTMLBody = `
      <html>
          <body>
              <a href="/path/">
              Boot.dev blog
              </a>
          </body>
      </html>
      `;
  const inputBaseURL = 'https://blog.boot.dev';
  const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL);
  const expected = ['https://blog.boot.dev/path/'];
  expect(actual).toEqual(expected);
});

test('getURLsFromHTML: Relative and absolute URLS', () => {
  const inputHTMLBody = `
        <html>
            <body>
                <a href="/path1/">
                Boot.dev blog Path 1
                </a>
                <a href="https://blog.boot.dev/path2/">
                Boot.dev blog Path 2
                </a>
            </body>
        </html>
        `;
  const inputBaseURL = 'https://blog.boot.dev';
  const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL);
  const expected = [
    'https://blog.boot.dev/path1/',
    'https://blog.boot.dev/path2/',
  ];
  expect(actual).toEqual(expected);
});

test('getURLsFromHTML: Invalid URLS', () => {
  const inputHTMLBody = `
      <html>
          <body>
              <a href="invalid">
              Invalid URL
              </a>
          </body>
      </html>
      `;
  const inputBaseURL = 'https://blog.boot.dev/path/';
  const actual = getURLsFromHTML(inputHTMLBody, inputBaseURL);
  const expected = [];
  expect(actual).toEqual(expected);
});
