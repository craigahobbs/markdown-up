// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/* eslint-disable id-length */

import {MarkdownApp} from '../markdown-up/index.js';
import Window from 'window';
import test from 'ava';


test('MarkdownApp, constructor', (t) => {
    const window = new Window();
    const markdownApp = new MarkdownApp(window, 'README.md');
    t.is(markdownApp.window, window);
    t.is(markdownApp.defaultMarkdownURL, 'README.md');
    t.is(markdownApp.params, null);
});


test('MarkdownApp.run, help command', async (t) => {
    const window = new Window();
    window.location.hash = '#cmd.help=1';
    const markdownApp = await MarkdownApp.run(window, 'README.md');
    t.is(markdownApp.window, window);
    t.is(markdownApp.defaultMarkdownURL, 'README.md');
    t.deepEqual(markdownApp.params, {'cmd': {'help': 1}});
    t.is(window.document.title, 'MarkdownUp');
    t.true(window.document.body.innerHTML.startsWith(
        '<h1 id="cmd.help=1&amp;type_MarkdownApp"><a class="linktarget">MarkdownApp</a></h1>'
    ));
});


test('MarkdownApp.run, hash parameter error', async (t) => {
    const window = new Window();
    window.location.hash = '#foo=bar';
    const markdownApp = await MarkdownApp.run(window, 'README.md');
    t.is(markdownApp.window, window);
    t.is(markdownApp.defaultMarkdownURL, 'README.md');
    t.is(markdownApp.params, null);
    t.is(window.document.title, 'MarkdownUp');
    t.is(window.document.body.innerHTML, "<p>Error: Unknown member 'foo'</p>");
});


test('MarkdownApp.appElements', async (t) => {
    const window = new Window();
    const fetchResolve = (url) => {
        t.is(url, 'README.md');
        return {'ok': true, 'text': () => new Promise((resolve) => {
            resolve('# Hello');
        })};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const markdownApp = new MarkdownApp(window, 'README.md');
    markdownApp.updateParams('#');
    t.deepEqual(
        await markdownApp.appElements('MarkdownUp'),
        [
            'Hello',
            [
                {'html': 'h1', 'elem': [{'text': 'Hello'}]}
            ]
        ]
    );
});


test('MarkdownApp.appElements, no title', async (t) => {
    const window = new Window();
    const fetchResolve = (url) => {
        t.is(url, 'README.md');
        return {'ok': true, 'text': () => new Promise((resolve) => {
            resolve('No title');
        })};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const markdownApp = new MarkdownApp(window, 'README.md');
    markdownApp.updateParams('#');
    t.deepEqual(
        await markdownApp.appElements('MarkdownUp'),
        [
            'MarkdownUp',
            [
                {'html': 'p', 'elem': [{'text': 'No title'}]}
            ]
        ]
    );
});


test('MarkdownApp.appElements, url', async (t) => {
    const window = new Window();
    const fetchResolve = (url) => {
        t.is(url, 'other.md');
        return {'ok': true, 'text': () => new Promise((resolve) => {
            resolve('# Hello');
        })};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const markdownApp = new MarkdownApp(window, 'README.md');
    markdownApp.updateParams('url=other.md');
    t.deepEqual(
        await markdownApp.appElements('MarkdownUp'),
        [
            'Hello',
            [
                {'html': 'h1', 'elem': [{'text': 'Hello'}]}
            ]
        ]
    );
});


test('MarkdownApp.appElements, fetch error', async (t) => {
    const window = new Window();
    const fetchResolve = (url) => {
        t.is(url, 'README.md');
        return {'ok': false, 'statusText': 'Not Found'};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const markdownApp = new MarkdownApp(window, 'README.md');
    markdownApp.updateParams('#');
    let errorMessage = null;
    try {
        await markdownApp.appElements('MarkdownUp');
    } catch ({message}) { /* c8 ignore next */
        errorMessage = message;
    }
    t.is(errorMessage, "Could not fetch 'README.md', 'Not Found'");
});
