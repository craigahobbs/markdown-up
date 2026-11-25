// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE


// Import appImports.js as a way of testing it
import '../lib/appImports.js';


import {} from 'bare-script/lib/options.js';
import {MockAudioContext, flushTasks, mockPicovox} from './voiceMock.js';
import {JSDOM} from 'jsdom/lib/api.js';
import {MarkdownUp} from '../lib/app.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';
import {voiceElementsParagraphs} from '../lib/voice.js';


// The JSDOM URL
const jsdomURL = 'https://github.com/craigahobbs/markdown-up';


// Helper function to create an icon's elements
function iconElements(path, size = 18, fill = false) {
    return {
        'svg': 'svg',
        'attr': {'width': size, 'height': size, 'viewBox': '0 0 24 24', 'aria-hidden': 'true'},
        'elem': {
            'svg': 'path',
            'attr': {
                'fill': fill ? 'currentColor' : 'none',
                'stroke': fill ? 'none' : 'currentColor',
                'stroke-width': 2,
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'd': path
            }
        }
    };
}


// Helper function to create the menu burger elements
function menuBurgerElements({menu = false} = {}) {
    return {
        'html': 'div',
        'attr': {'class': 'menu-burger'},
        'elem': {
            'html': 'button',
            'attr': {'type': 'button', 'class': 'menu-button', 'aria-label': 'Menu', 'aria-expanded': `${menu}`},
            'elem': iconElements('M3,5 L21,5 M3,12 L21,12 M3,19 L21,19', 22)
        }
    };
}


// Helper function to create the menu elements
function menuElements({
    darkMode = false, debug = false, fontSize = 12, fontSizeDown = true, fontSizeUp = true,
    helpURL = 'https://craigahobbs.github.io/markdown-up-py/', lineHeight = 1.3, viewMarkdown = false
} = {}) {
    const itemElements = (label, path, checked = null) => ({
        'html': 'button',
        'attr': {
            'type': 'button',
            'class': 'menu-item',
            'role': checked !== null ? 'menuitemcheckbox' : 'menuitem',
            'aria-checked': checked !== null ? `${checked}` : null
        },
        'elem': [
            iconElements(path),
            {'html': 'span', 'attr': {'class': 'menu-label'}, 'elem': {'text': label}},
            checked !== null ? {'html': 'span', 'attr': {'class': 'menu-switch'}} : null
        ]
    });
    const stepperElements = (label, path, text, down, up) => ({
        'html': 'div',
        'attr': {'class': 'menu-item menu-stepper'},
        'elem': [
            iconElements(path),
            {'html': 'span', 'attr': {'class': 'menu-label'}, 'elem': {'text': label}},
            {
                'html': 'button',
                'attr': {'type': 'button', 'class': 'menu-step', 'aria-label': `${label} down`, 'disabled': down ? null : 'disabled'},
                'elem': {'text': '−'}
            },
            {'html': 'span', 'attr': {'class': 'menu-value'}, 'elem': {'text': text}},
            {
                'html': 'button',
                'attr': {'type': 'button', 'class': 'menu-step', 'aria-label': `${label} up`, 'disabled': up ? null : 'disabled'},
                'elem': {'text': '+'}
            }
        ]
    });
    const separatorElements = {'html': 'div', 'attr': {'class': 'menu-separator', 'role': 'separator'}};
    return [
        {'html': 'div', 'attr': {'class': 'menu-backdrop'}},
        {
            'html': 'div',
            'attr': {'class': 'menu', 'role': 'menu'},
            'elem': [
                itemElements('Read aloud', 'M3,9 L7,9 L12,5 L12,19 L7,15 L3,15 Z M16,9 A4,4,0,0,1,16,15 M18.5,6 A8,8,0,0,1,18.5,18'),
                separatorElements,
                itemElements('Dark mode', 'M16,3 A10,10,0,1,1,3,18 A14,14,0,0,0,17,3 Z', darkMode),
                stepperElements('Font size', 'M4,21 L12,3 L20,21 M7.5,14 L16.5,14', `${fontSize}pt`, fontSizeDown, fontSizeUp),
                stepperElements(
                    'Line height',
                    'M11,5 L21,5 M11,12 L21,12 M11,19 L21,19 M5,4 L5,20 M2.5,6.5 L5,4 L7.5,6.5 M2.5,17.5 L5,20 L7.5,17.5',
                    `${lineHeight}`,
                    true,
                    true
                ),
                separatorElements,
                itemElements('Markdown source', 'M5,2 L19,2 L19,22 L5,22 Z M8,7.5 L16,7.5 M8,12 L16,12 M8,16.5 L16,16.5', viewMarkdown),
                itemElements(
                    'Debug',
                    'M12,5 A4,7,0,1,0,12,19 A4,7,0,1,0,12,5 M9,9 L15,9 M9,9 L4,6 M9,12 L3,12 M9,15 L4,18 ' +
                        'M15,9 L20,6 M15,12 L21,12 M15,15 L20,18',
                    debug
                ),
                {
                    'html': 'a',
                    'attr': {'class': 'menu-item', 'role': 'menuitem', 'href': helpURL},
                    'elem': [
                        iconElements('M12,2 A10,10,0,1,0,12,22 A10,10,0,1,0,12,2 M9,9.5 A3,3,0,1,1,12,12.5 L12,14.5 M12,17.5 L12,18'),
                        {'html': 'span', 'attr': {'class': 'menu-label'}, 'elem': {'text': 'Help'}},
                        iconElements('M9,5 L19,5 L19,15 M19,5 L6,18', 14)
                    ]
                }
            ]
        }
    ];
}


// Helper function to get a menu item's element
function menuItem(window, label) {
    return Array.from(window.document.querySelectorAll('.menu-item')).find(
        (element) => element.querySelector('.menu-label').textContent === label
    );
}


// Helper function to remove an element model's callbacks
function deleteElementCallbacks(elements) {
    if (Array.isArray(elements)) {
        for (const element of elements) {
            deleteElementCallbacks(element);
        }
    } else if (elements !== null && typeof elements === 'object') {
        if ('elements' in elements) {
            deleteElementCallbacks(elements.elements);
        } else {
            if ('callback' in elements) {
                delete elements.callback;
            }
            if ('elem' in elements) {
                deleteElementCallbacks(elements.elem);
            }
        }
    }
    return elements;
}


// Drains the event loop (macrotasks + microtasks) so async click handlers have time to complete
async function flushPromises() {
    for (let ix = 0; ix < 10; ix++) {
        // eslint-disable-next-line no-promise-executor-return
        await new Promise(resolve => setTimeout(resolve, 0));
        await Promise.resolve();
    }
}


test('MarkdownUp, constructor', () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window);
    assert.equal(app.window, window);
    assert.equal(app.params, null);
    assert.equal(app.fontSize, 12);
    assert.equal(app.hashURL, 'sameOrigin');
    assert.equal(app.lineHeight, 1.3);
    assert.equal(app.menu, true);
    assert.equal(app.url, 'README.md');
});


test('MarkdownUp, constructor options', () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'fontSize': 14,
        'hashURL': 'any',
        'lineHeight': 1.6,
        'menu': false,
        'url': 'CHANGELOG.md'
    });
    assert.equal(app.window, window);
    assert.equal(app.params, null);
    assert.equal(app.fontSize, 14);
    assert.equal(app.hashURL, 'any');
    assert.equal(app.lineHeight, 1.6);
    assert.equal(app.menu, false);
    assert.equal(app.url, 'CHANGELOG.md');
});


test('MarkdownUp, run and render', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    const documentElementStyleSetPropertyCalls = [];
    window.document.documentElement.style.setProperty = (prop, val) => documentElementStyleSetPropertyCalls.push([prop, val]);

    window.location.hash = '#';
    const app = new MarkdownUp(window, {'markdownText': '# Title\n\nHello!', 'menu': false});
    await app.run();
    assert.equal(window.document.title, 'Title');
    assert.equal(
        window.document.body.innerHTML,
        '<div id="_top" style="display=none; position: absolute; top: 0;"></div><h1 id="title">Title</h1><p>Hello!</p>'
    );
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--barescript-font-size', '12pt'],
        ['--barescript-line-height', `1.3em`]
    ]);
    assert.equal(window.document.documentElement.style.colorScheme, 'light');

    window.location.hash = '#';
    window.localStorage.setItem('MarkdownUp', '{"darkMode": true, "fontSize": 14, "lineHeight": 1.4}');
    window.sessionStorage.setItem('MarkdownUp', '{}');
    documentElementStyleSetPropertyCalls.length = 0;
    await app.render(true);
    assert.equal(window.document.title, 'Title');
    assert.equal(
        window.document.body.innerHTML,
        '<div id="_top" style="display=none; position: absolute; top: 0;"></div><h1 id="title">Title</h1><p>Hello!</p>'
    );
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--barescript-font-size', '14pt'],
        ['--barescript-line-height', `1.4em`]
    ]);
    assert.equal(window.document.documentElement.style.colorScheme, 'dark');

    // Ensure params-not-changed short-circuit is covered
    await app.render();
    assert.equal(window.document.title, 'Title');
    assert.equal(
        window.document.body.innerHTML,
        '<div id="_top" style="display=none; position: absolute; top: 0;"></div><h1 id="title">Title</h1><p>Hello!</p>'
    );
});


test('MarkdownUp, render bad params', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    const documentElementStyleSetPropertyCalls = [];
    window.document.documentElement.style.setProperty = (prop, val) => documentElementStyleSetPropertyCalls.push([prop, val]);

    window.location.hash = '#unknown=bad';
    const app = new MarkdownUp(window);
    await app.render();
    assert.equal(window.document.title, 'MarkdownUp');
    assert.equal(window.document.body.innerHTML, '<p>Error: Unknown member "unknown"</p>');
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--barescript-font-size', '12pt'],
        ['--barescript-line-height', `1.3em`]
    ]);
});


test('MarkdownUp, render menu toggle', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    const documentElementStyleSetPropertyCalls = [];
    window.document.documentElement.style.setProperty = (prop, val) => documentElementStyleSetPropertyCalls.push([prop, val]);

    window.location.hash = '#';
    const app = new MarkdownUp(window, {'markdownText': 'Hello!'});
    await app.render();
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--barescript-font-size', '12pt'],
        ['--barescript-line-height', `1.3em`]
    ]);
    assert.equal(window.localStorage.getItem('MarkdownUp'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), null);

    // Click the menu button and wait for the render
    let menuButton = window.document.querySelector('.menu-button');
    window.document.body.innerHTML = '';
    menuButton.click();
    await flushPromises();
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.equal(window.localStorage.getItem('MarkdownUp'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu":1}');

    // Click the menu button again
    menuButton = window.document.querySelector('.menu-button');
    window.document.body.innerHTML = '';
    menuButton.click();
    await flushPromises();
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.equal(window.localStorage.getItem('MarkdownUp'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{}');
});


test('MarkdownUp, render menu view toggle', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    const documentElementStyleSetPropertyCalls = [];
    window.document.documentElement.style.setProperty = (prop, val) => documentElementStyleSetPropertyCalls.push([prop, val]);

    window.location.hash = '#';
    window.sessionStorage.setItem('MarkdownUp', '{"menu": 1}');
    const app = new MarkdownUp(window, {'markdownText': '# Hello\n\nHello!'});
    await app.render();
    assert.equal(window.document.title, 'Hello');
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--barescript-font-size', '12pt'],
        ['--barescript-line-height', `1.3em`]
    ]);
    assert.equal(window.localStorage.getItem('MarkdownUp'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');

    // Click the Markdown menu button and wait for the render
    let markdownButton = menuItem(window, 'Markdown source');
    window.document.title = '';
    window.document.body.innerHTML = '';
    markdownButton.click();
    await flushPromises();
    assert.equal(window.location.hash, '#view=markdown');
    assert.equal(window.document.title, '');
    assert.equal(window.document.body.innerHTML, '');
    assert.equal(window.localStorage.getItem('MarkdownUp'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');
    await app.render();
    assert.equal(window.document.title, 'Hello');
    assert(window.document.body.innerHTML.endsWith('<div class="markdown"># Hello\n\nHello!</div>'));
    assert.equal(window.localStorage.getItem('MarkdownUp'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');

    // Click the Markdown menu button again
    markdownButton = menuItem(window, 'Markdown source');
    window.document.title = '';
    window.document.body.innerHTML = '';
    markdownButton.click();
    await flushPromises();
    assert.equal(window.location.hash, '');
    assert.equal(window.document.title, '');
    assert.equal(window.document.body.innerHTML, '');
    assert.equal(window.localStorage.getItem('MarkdownUp'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');
    await app.render();
    assert.equal(window.document.title, 'Hello');
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.equal(window.localStorage.getItem('MarkdownUp'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');
});


test('MarkdownUp, render menu dark mode toggle, system light mode', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    const documentElementStyleSetPropertyCalls = [];
    window.document.documentElement.style.setProperty = (prop, val) => documentElementStyleSetPropertyCalls.push([prop, val]);

    const windowMatchMediaCalls= [];
    window.matchMedia = (query) => {
        windowMatchMediaCalls.push(query);
        return {'matches': false};
    };

    window.location.hash = '#';
    window.sessionStorage.setItem('MarkdownUp', '{"menu": 1}');
    const app = new MarkdownUp(window, {'markdownText': 'Hello!'});
    await app.render();
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--barescript-font-size', '12pt'],
        ['--barescript-line-height', `1.3em`]
    ]);
    assert.deepEqual(windowMatchMediaCalls, [
        '(prefers-color-scheme: dark)'
    ]);
    assert.equal(window.localStorage.getItem('MarkdownUp'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');

    // Click the dark mode menu button and wait for the render
    let darkModeButton = menuItem(window, 'Dark mode');
    window.document.body.innerHTML = '';
    documentElementStyleSetPropertyCalls.length = 0;
    windowMatchMediaCalls.length = 0;
    darkModeButton.click();
    await flushPromises();
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--barescript-font-size', '12pt'],
        ['--barescript-line-height', `1.3em`]
    ]);
    assert.deepEqual(windowMatchMediaCalls, []);
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{"darkMode":true}');
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');

    // Click the dark mode menu button again
    darkModeButton = menuItem(window, 'Dark mode');
    window.document.body.innerHTML = '';
    documentElementStyleSetPropertyCalls.length = 0;
    windowMatchMediaCalls.length = 0;
    darkModeButton.click();
    await flushPromises();
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--barescript-font-size', '12pt'],
        ['--barescript-line-height', `1.3em`]
    ]);
    assert.deepEqual(windowMatchMediaCalls, []);
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{}');
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');
});


test('MarkdownUp, render menu dark mode toggle, system dark mode', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    const documentElementStyleSetPropertyCalls = [];
    window.document.documentElement.style.setProperty = (prop, val) => documentElementStyleSetPropertyCalls.push([prop, val]);

    const windowMatchMediaCalls= [];
    window.matchMedia = (query) => {
        windowMatchMediaCalls.push(query);
        return {'matches': true};
    };

    window.location.hash = '#';
    window.sessionStorage.setItem('MarkdownUp', '{"menu": 1}');
    const app = new MarkdownUp(window, {'markdownText': 'Hello!'});
    await app.render();
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--barescript-font-size', '12pt'],
        ['--barescript-line-height', `1.3em`]
    ]);
    assert.deepEqual(windowMatchMediaCalls, [
        '(prefers-color-scheme: dark)'
    ]);
    assert.equal(window.localStorage.getItem('MarkdownUp'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');

    // Click the dark mode menu button and wait for the render
    let darkModeButton = menuItem(window, 'Dark mode');
    window.document.body.innerHTML = '';
    documentElementStyleSetPropertyCalls.length = 0;
    windowMatchMediaCalls.length = 0;
    darkModeButton.click();
    await flushPromises();
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--barescript-font-size', '12pt'],
        ['--barescript-line-height', `1.3em`]
    ]);
    assert.deepEqual(windowMatchMediaCalls, []);
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{"darkMode":false}');
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');

    // Click the dark mode menu button again
    darkModeButton = menuItem(window, 'Dark mode');
    window.document.body.innerHTML = '';
    documentElementStyleSetPropertyCalls.length = 0;
    windowMatchMediaCalls.length = 0;
    darkModeButton.click();
    await flushPromises();
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--barescript-font-size', '12pt'],
        ['--barescript-line-height', `1.3em`]
    ]);
    assert.deepEqual(windowMatchMediaCalls, []);
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{}');
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');
});


test('MarkdownUp, render menu close', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    window.location.hash = '#';
    const app = new MarkdownUp(window, {'markdownText': 'Hello!'});

    // The escape key does nothing before the first render
    window.dispatchEvent(new window.KeyboardEvent('keydown', {'key': 'Escape'}));
    await flushPromises();
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), null);

    // The escape key does nothing when the menu is closed
    await app.render();
    assert.equal(window.document.querySelector('.menu-button').getAttribute('aria-expanded'), 'false');
    assert.equal(window.document.querySelector('.menu'), null);
    window.dispatchEvent(new window.KeyboardEvent('keydown', {'key': 'Escape'}));
    await flushPromises();
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), null);

    // Open the menu
    window.document.querySelector('.menu-button').click();
    await flushPromises();
    assert.equal(window.document.querySelector('.menu-button').getAttribute('aria-expanded'), 'true');
    assert.notEqual(window.document.querySelector('.menu'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu":1}');

    // Other keys don't close the menu
    window.dispatchEvent(new window.KeyboardEvent('keydown', {'key': 'a'}));
    await flushPromises();
    assert.notEqual(window.document.querySelector('.menu'), null);

    // The escape key closes the menu
    window.dispatchEvent(new window.KeyboardEvent('keydown', {'key': 'Escape'}));
    await flushPromises();
    assert.equal(window.document.querySelector('.menu'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{}');

    // A click outside of the menu closes the menu
    window.document.querySelector('.menu-button').click();
    await flushPromises();
    assert.notEqual(window.document.querySelector('.menu'), null);
    window.document.querySelector('.menu-backdrop').click();
    await flushPromises();
    assert.equal(window.document.querySelector('.menu'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{}');
});


test('MarkdownUp, render menu close, no menu', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    window.location.hash = '#';
    window.sessionStorage.setItem('MarkdownUp', '{"menu": 1}');
    const app = new MarkdownUp(window, {'markdownText': 'Hello!', 'menu': false});
    await app.render();
    assert.equal(window.document.querySelector('.menu-button'), null);
    assert.equal(window.document.querySelector('.menu'), null);

    // The escape key does nothing
    window.dispatchEvent(new window.KeyboardEvent('keydown', {'key': 'Escape'}));
    await flushPromises();
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');
});


test('MarkdownUp, render menu debug toggle', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    window.console.log = () => null;
    window.location.hash = '#';
    window.sessionStorage.setItem('MarkdownUp', '{"menu": 1}');
    const app = new MarkdownUp(window, {'markdownText': 'Hello!'});
    await app.render();
    assert.equal(menuItem(window, 'Debug').getAttribute('aria-checked'), 'false');

    // Click the debug menu item and wait for the render
    menuItem(window, 'Debug').click();
    await flushPromises();
    assert.equal(menuItem(window, 'Debug').getAttribute('aria-checked'), 'true');
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu":1,"debug":1}');

    // Click the debug menu item again
    menuItem(window, 'Debug').click();
    await flushPromises();
    assert.equal(menuItem(window, 'Debug').getAttribute('aria-checked'), 'false');
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu":1}');
});


test('MarkdownUp, render menu stepper', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    const documentElementStyleSetPropertyCalls = [];
    window.document.documentElement.style.setProperty = (prop, val) => documentElementStyleSetPropertyCalls.push([prop, val]);

    window.location.hash = '#';
    window.sessionStorage.setItem('MarkdownUp', '{"menu": 1}');
    const app = new MarkdownUp(window, {'markdownText': 'Hello!'});
    await app.render();
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--barescript-font-size', '12pt'],
        ['--barescript-line-height', `1.3em`]
    ]);
    assert.deepEqual(Array.from(window.document.querySelectorAll('.menu-value')).map((element) => element.textContent), ['12pt', '1.3']);
    assert.equal(window.localStorage.getItem('MarkdownUp'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');

    // Click the font size up button and wait for the render
    documentElementStyleSetPropertyCalls.splice(0);
    window.document.querySelector('[aria-label="Font size up"]').click();
    await flushPromises();
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--barescript-font-size', '14pt'],
        ['--barescript-line-height', `1.3em`]
    ]);
    assert.deepEqual(Array.from(window.document.querySelectorAll('.menu-value')).map((element) => element.textContent), ['14pt', '1.3']);
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{"fontSize":14}');
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');

    // Click the font size up button again
    documentElementStyleSetPropertyCalls.splice(0);
    window.document.querySelector('[aria-label="Font size up"]').click();
    await flushPromises();
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--barescript-font-size', '18pt'],
        ['--barescript-line-height', `1.3em`]
    ]);
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{"fontSize":18}');

    // Click the font size down button twice - the default font size isn't stored
    window.document.querySelector('[aria-label="Font size down"]').click();
    await flushPromises();
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{"fontSize":14}');
    documentElementStyleSetPropertyCalls.splice(0);
    window.document.querySelector('[aria-label="Font size down"]').click();
    await flushPromises();
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--barescript-font-size', '12pt'],
        ['--barescript-line-height', `1.3em`]
    ]);
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{}');

    // Click the line height down button
    documentElementStyleSetPropertyCalls.splice(0);
    window.document.querySelector('[aria-label="Line height down"]').click();
    await flushPromises();
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--barescript-font-size', '12pt'],
        ['--barescript-line-height', `1.2em`]
    ]);
    assert.deepEqual(Array.from(window.document.querySelectorAll('.menu-value')).map((element) => element.textContent), ['12pt', '1.2']);
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{"lineHeight":1.2}');
    assert.equal(window.document.querySelector('[aria-label="Line height down"]').disabled, true);
    assert.equal(window.document.querySelector('[aria-label="Line height up"]').disabled, false);
});


test('MarkdownUp, render menu stepper limit', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    const documentElementStyleSetPropertyCalls = [];
    window.document.documentElement.style.setProperty = (prop, val) => documentElementStyleSetPropertyCalls.push([prop, val]);

    window.location.hash = '#';
    window.localStorage.setItem('MarkdownUp', '{"fontSize": 24}');
    window.sessionStorage.setItem('MarkdownUp', '{"menu": 1}');
    const app = new MarkdownUp(window, {'markdownText': 'Hello!'});
    await app.render();
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--barescript-font-size', '24pt'],
        ['--barescript-line-height', `1.3em`]
    ]);
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{"fontSize": 24}');
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');

    // The font size up button is disabled - clicking it does nothing
    const fontSizeUp = window.document.querySelector('[aria-label="Font size up"]');
    assert.equal(fontSizeUp.disabled, true);
    fontSizeUp.click();
    await flushPromises();
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{"fontSize": 24}');

    // Click the font size down button and wait for the render
    documentElementStyleSetPropertyCalls.splice(0);
    window.document.querySelector('[aria-label="Font size down"]').click();
    await flushPromises();
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--barescript-font-size', '18pt'],
        ['--barescript-line-height', `1.3em`]
    ]);
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{"fontSize":18}');
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');
});


test('MarkdownUp, render menu stepper, value between steps', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    window.location.hash = '#';
    window.sessionStorage.setItem('MarkdownUp', '{"menu": 1}');
    const app = new MarkdownUp(window, {'markdownText': 'Hello!', 'fontSize': 13});
    await app.render();
    assert.deepEqual(Array.from(window.document.querySelectorAll('.menu-value')).map((element) => element.textContent), ['13pt', '1.3']);

    // Click the font size up button and wait for the render
    window.document.querySelector('[aria-label="Font size up"]').click();
    await flushPromises();
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{"fontSize":14}');

    // Click the font size down button twice
    window.document.querySelector('[aria-label="Font size down"]').click();
    await flushPromises();
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{"fontSize":12}');
});


test('MarkdownUp, render menu help', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    window.location.hash = '#';
    window.sessionStorage.setItem('MarkdownUp', '{"menu": 1}');
    const app = new MarkdownUp(window, {'markdownText': 'Hello!', 'helpURL': '#help'});
    await app.render();
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));

    // The help menu item is a link
    const helpLink = menuItem(window, 'Help');
    assert.equal(helpLink.tagName, 'A');
    assert.equal(helpLink.href, 'https://github.com/craigahobbs/markdown-up#help');
});


test('MarkdownUp, render timeout', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    // Patch window.setTimeout and window.clearTimeout
    const windowTimeout = {'id': 0};
    window.setTimeout = (callback, delay) => {
        windowTimeout.callback = callback;
        windowTimeout.delay = delay;
        windowTimeout.id += 1;
        return windowTimeout.id;
    };
    window.clearTimeout = (timeoutId) => {
        assert.equal(timeoutId, windowTimeout.id);
        windowTimeout.callback = null;
        windowTimeout.delay = null;
    };

    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
function main():
    systemGlobalSet('count', count + 1)
    markdownPrint('Hello ' + count)
    if(count != 1, windowSetTimeout(main, 2000))
endfunction

count = 0
windowSetTimeout(main, 1000)
main()
~~~
`
    });
    window.location.hash = '#';
    await app.render();
    assert.equal(windowTimeout.delay, 1000);
    assert.equal(app.runtimeTimeoutId, 1);
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello 1</p>'));

    // Render again to test clearing the runtime timeout ID
    window.location.hash = '#';
    await app.render(true);
    assert.equal(windowTimeout.delay, 1000);
    assert.equal(app.runtimeTimeoutId, 2);
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello 1</p>'));

    // Call the timeout callback
    await windowTimeout.callback();
    assert.equal(windowTimeout.delay, 2000);
    assert.equal(app.runtimeTimeoutId, 3);
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello 2</p>'));

    // Call the timeout callback again - this time skip due to a render in the middle of the callback
    app.runtimeCount += 1;
    await windowTimeout.callback();
    assert.equal(windowTimeout.delay, 2000);
    assert.equal(app.runtimeTimeoutId, 3);
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello 2</p>'));
    app.runtimeCount -= 1;

    // Call the timeout callback again
    await windowTimeout.callback();
    assert.equal(windowTimeout.delay, 2000);
    assert.equal(app.runtimeTimeoutId, 4);
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello 4</p>'));
});


test('MarkdownUp, render resize', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    // Patch window.addEventListener and window.removeEventListener
    const eventListener = {'resize': null};
    window.addEventListener = (type, callback) => {
        eventListener[type] = callback;
    };
    window.removeEventListener = (type, callback) => {
        assert.equal(type, 'resize');
        assert.equal(callback, eventListener[type]);
        eventListener[type] = null;
    };

    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
function main():
    systemGlobalSet('count', count + 1)
    markdownPrint('Hello ' + count)
endfunction

count = 0
windowSetResize(main)
main()
~~~
`
    });
    window.location.hash = '#';
    await app.render();
    assert.equal(typeof eventListener.resize, 'function');
    assert.equal(typeof app.runtimeWindowResize, 'function');
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello 1</p>'));

    // Render again to test clearing the runtime resize event handler
    window.location.hash = '#';
    await app.render(true);
    assert.equal(typeof eventListener.resize, 'function');
    assert.equal(typeof app.runtimeWindowResize, 'function');
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello 1</p>'));

    // Call the resize callback
    await eventListener.resize();
    assert.equal(typeof eventListener.resize, 'function');
    assert.equal(typeof app.runtimeWindowResize, 'function');
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello 2</p>'));
});


test('MarkdownUp, render keydown', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    // Patch window.document.addEventListener and window.document.removeEventListener
    const eventListener = {'keydown': null};
    window.document.addEventListener = (type, callback) => {
        eventListener[type] = callback;
    };
    window.document.removeEventListener = (type, callback) => {
        assert.equal(type, 'keydown');
        assert.equal(callback, eventListener[type]);
        eventListener[type] = null;
    };

    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
function main(event):
    systemGlobalSet('count', count + 1)
    elementModelRender({'html': 'input', 'attr': {'id': 'input1', 'type': 'text'}})
    markdownPrint('Hello ' + count + ' (key: ' + objectGet(event, 'key') + ')')
endfunction

count = 0
documentSetKeyDown(main)
main({'key': 'A'})
~~~
`
    });
    window.location.hash = '#';
    await app.render();
    assert.equal(typeof eventListener.keydown, 'function');
    assert.equal(typeof app.runtimeDocumentKeyDown, 'function');
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello 1 (key: A)</p>'));

    // Render again to test clearing the runtime keydown event handler
    window.location.hash = '#';
    await app.render(true);
    assert.equal(typeof eventListener.keydown, 'function');
    assert.equal(typeof app.runtimeDocumentKeyDown, 'function');
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello 1 (key: A)</p>'));

    // Call the keydown callback
    let keyEvent = {'key': 'B'};
    await eventListener.keydown(keyEvent);
    assert.equal(typeof eventListener.keydown, 'function');
    assert.equal(typeof app.runtimeDocumentKeyDown, 'function');
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello 2 (key: B)</p>'));

    // Set focus to an input element
    const inputElement = window.document.getElementById('input1');
    inputElement.focus();

    // Call the keydown callback again - verify its not called this time
    keyEvent = {'key': 'C'};
    await eventListener.keydown(keyEvent);
    assert.equal(typeof eventListener.keydown, 'function');
    assert.equal(typeof app.runtimeDocumentKeyDown, 'function');
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello 2 (key: B)</p>'));
});


test('MarkdownUp, render keydown once', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
function onKeyDown(event):
    sessionStorageSet('keys', sessionStorageGet('keys') + objectGet(event, 'key'))
endfunction

documentSetKeyDown(onKeyDown)
markdownPrint('Hello')
~~~
`
    });
    window.location.hash = '#';
    window.sessionStorage.setItem('keys', '');
    await app.render();

    // Render again, twice - each render's keydown handler replaces the last
    await app.render(true);
    await app.render(true);
    window.document.dispatchEvent(new window.KeyboardEvent('keydown', {'key': 'a'}));
    await flushPromises();
    assert.equal(window.sessionStorage.getItem('keys'), 'a');
    window.document.dispatchEvent(new window.KeyboardEvent('keydown', {'key': 'b'}));
    await flushPromises();
    assert.equal(window.sessionStorage.getItem('keys'), 'ab');
});


test('MarkdownUp, render focus', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
function main():
    systemGlobalSet('count', count + 1)
    elementModelRender({ \
        'html': 'input', \
        'attr': { \
            'id': 'test-input', \
            'type': 'text', \
            'value': 'Text ' + count \
        }, \
        'callback': {'click': main} \
    })
    documentSetFocus('test-input')
endfunction

count = 0
main()
~~~
`
    });
    window.location.hash = '#';
    await app.render();
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<input id="test-input" type="text" value="Text 1">'));

    let testInput = window.document.getElementById('test-input');
    assert.equal(testInput.value, 'Text 1');
    assert.equal(testInput.selectionStart, 6);
    assert.equal(testInput.selectionEnd, 6);

    await testInput.click();
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<input id="test-input" type="text" value="Text 2">'));

    testInput = window.document.getElementById('test-input');
    assert.equal(testInput.value, 'Text 2');
    assert.equal(testInput.selectionStart, 6);
    assert.equal(testInput.selectionEnd, 6);
});


test('MarkdownUp, render document reset ID', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    // Patch window.setTimeout and window.clearTimeout
    const windowTimeout = {'id': 0};
    window.setTimeout = (callback, delay) => {
        windowTimeout.callback = callback;
        windowTimeout.delay = delay;
        windowTimeout.id += 1;
        return windowTimeout.id;
    };
    window.clearTimeout = (timeoutId) => {
        assert.equal(timeoutId, windowTimeout.id);
        windowTimeout.callback = null;
        windowTimeout.delay = null;
    };

    const app = new MarkdownUp(window, {
        'menu': false,
        'markdownText': `\
~~~ markdown-script
function main():
    systemGlobalSet('count', count + 1)
    markdownPrint('Hello ' + count)
    windowSetTimeout(main, 1000)
    if(count <= 2, documentSetReset('resetID'))
endfunction

markdownPrint('# Title')
elementModelRender({'html': 'div', 'attr': {'id': 'resetID', 'style': 'display=none'}})

count = 0
windowSetTimeout(main, 1000)
main()
~~~
`
    });
    window.location.hash = '#';
    await app.render();
    assert.equal(windowTimeout.delay, 1000);
    assert.equal(app.runtimeTimeoutId, 1);
    assert.equal(window.document.title, '');
    assert.equal(
        window.document.body.innerHTML,
        '<div id="_top" style="display=none; position: absolute; top: 0;"></div>' +
            '<h1 id="title">Title</h1><div id="resetID" style="display=none"></div><p>Hello 1</p>'
    );

    // Call the timeout callback
    await windowTimeout.callback();
    assert.equal(windowTimeout.delay, 1000);
    assert.equal(app.runtimeTimeoutId, 2);
    assert.equal(window.document.title, '');
    assert.equal(
        window.document.body.innerHTML,
        '<div id="_top" style="display=none; position: absolute; top: 0;"></div>' +
            '<h1 id="title">Title</h1><div id="resetID" style="display=none"></div><p>Hello 2</p>'
    );

    // Call the timeout callback
    await windowTimeout.callback();
    assert.equal(windowTimeout.delay, 1000);
    assert.equal(app.runtimeTimeoutId, 3);
    assert.equal(window.document.title, '');
    assert.equal(
        window.document.body.innerHTML,
        '<div id="_top" style="display=none; position: absolute; top: 0;"></div>' +
            '<p>Hello 3</p>'
    );
});


test('MarkdownUp, render location', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
windowSetLocation('#url=other')
~~~
`
    });
    window.location.hash = '#';
    await app.render();
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.startsWith('<div class="menu-burger">'));
    assert.equal(window.location.href, `${jsdomURL}#url=other`);
});


test('MarkdownUp, render location callback', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
function onClick():
    markdownPrint('Hello')
    windowSetLocation('#url=other')
endfunction

elementModelRender({ \
    'html': 'span', \
    'attr': {'id': 'test-span'}, \
    'elem': {'text': 'Click Here'}, \
    'callback': {'click': onClick} \
})
~~~
`
    });
    window.location.hash = '#';
    await app.render();
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<span id="test-span">Click Here</span>'));
    assert.equal(window.location.href, `${jsdomURL}#`);

    const testSpan = window.document.getElementById('test-span');
    await testSpan.click();
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello</p>'));
    assert.equal(window.location.href, `${jsdomURL}#url=other`);
});


test('MarkdownUp, render location hash', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': ''});
    window.location.hash = "#var.vName='test'&subtitle";
    await app.render();
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.startsWith('<div class="menu-burger">'));
    assert.equal(window.location.href, `${jsdomURL}#var.vName='test'&subtitle`);
});


test('MarkdownUp, render title', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
documentSetTitle('Hello')
markdownPrint('Hello')
~~~
`
    });
    window.location.hash = '#';
    await app.render();
    assert.equal(window.document.title, 'Hello');
    assert(window.document.body.innerHTML.endsWith('<p>Hello</p>'));
});


test('MarkdownUp, render title callback', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
function onClick():
    documentSetTitle('Hello')
    markdownPrint('Hello')
endfunction

elementModelRender({ \
    'html': 'span', \
    'attr': {'id': 'test-span'}, \
    'elem': {'text': 'Click Here'}, \
    'callback': {'click': onClick} \
})
~~~
`
    });
    window.location.hash = '#';
    await app.render();
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<span id="test-span">Click Here</span>'));

    const testSpan = window.document.getElementById('test-span');
    await testSpan.click();
    assert.equal(window.document.title, 'Hello');
    assert(window.document.body.innerHTML.endsWith('<p>Hello</p>'));
});


test('MarkdownUp.updateParams, invalid session/local storage', () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window);
    app.updateParams('', 'BAD', 'BAD');
    assert.deepEqual(app.params, {});
    assert.deepEqual(app.paramsLocal, {});
    assert.deepEqual(app.paramsSession, {});
});


test('MarkdownUp.main, simple', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchResolve = (url) => {
        assert.equal(url, 'README.md');
        return {'ok': true, 'text': () => new Promise((resolve) => {
            resolve('# Hello');
        })};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': 'Hello',
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': '_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    {'html': 'h1', 'attr': {'id': 'hello'}, 'elem': [{'text': 'Hello'}]}
                ]
            ]
        }
    );
});


test('MarkdownUp.main, url', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchResolve = (url) => {
        assert.equal(url, 'sub/other.md');
        return {'ok': true, 'text': () => new Promise((resolve) => {
            resolve(`\
# Hello

[Absolute link](https://foo.com/foo.html)

[Relative link](foo.html)

[Hash-id link](#hello)

[Hash link with relative URL](#url=file.md)

[Hash link with relative URL and hash-id](#url=file.md&hash-id)

[Hash link with absolute URL](#url=http://file.com)

[Hash link with absolute URL and hash-id](#url=http://file.com&hash-id)

[Hash link with invalid params](#invalid&url=file.md)
`);
        })};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('url=sub%2Fother.md');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': 'Hello',
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': 'url=sub%2Fother.md&_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    {'html': 'h1', 'attr': {'id': 'url=sub%2Fother.md&hello'}, 'elem': [{'text': 'Hello'}]},
                    {
                        'html': 'p',
                        'elem': [
                            {
                                'html': 'a',
                                'attr': {'href': 'https://foo.com/foo.html'},
                                'elem': [{'text': 'Absolute link'}]
                            }
                        ]
                    },
                    {
                        'html': 'p',
                        'elem': [
                            {
                                'html': 'a',
                                'attr': {'href': 'sub/foo.html'},
                                'elem': [{'text': 'Relative link'}]
                            }
                        ]
                    },
                    {
                        'html': 'p',
                        'elem': [
                            {
                                'html': 'a',
                                'attr': {'href': '#url=sub%2Fother.md&hello'},
                                'elem': [{'text': 'Hash-id link'}]
                            }
                        ]
                    },
                    {
                        'html': 'p',
                        'elem': [
                            {
                                'html': 'a',
                                'attr': {'href': '#url=sub%2Ffile.md'},
                                'elem': [{'text': 'Hash link with relative URL'}]
                            }
                        ]
                    },
                    {
                        'html': 'p',
                        'elem': [
                            {
                                'html': 'a',
                                'attr': {'href': '#url=sub%2Ffile.md&hash-id'},
                                'elem': [{'text': 'Hash link with relative URL and hash-id'}]
                            }
                        ]
                    },
                    {
                        'html': 'p',
                        'elem': [
                            {
                                'html': 'a',
                                'attr': {'href': '#url=http%3A%2F%2Ffile.com'},
                                'elem': [{'text': 'Hash link with absolute URL'}]
                            }
                        ]
                    },
                    {
                        'html': 'p',
                        'elem': [
                            {
                                'html': 'a',
                                'attr': {'href': '#url=http%3A%2F%2Ffile.com&hash-id'},
                                'elem': [{'text': 'Hash link with absolute URL and hash-id'}]
                            }
                        ]
                    },
                    {
                        'html': 'p',
                        'elem': [
                            {
                                'html': 'a',
                                'attr': {'href': '#url=sub%2Fother.md'},
                                'elem': [{'text': 'Hash link with invalid params'}]
                            }
                        ]
                    }
                ]
            ]
        }
    );
});


test('MarkdownUp.main, markdownText url override', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchResolve = (url) => {
        assert.equal(url, 'other.md');
        return {'ok': true, 'text': () => new Promise((resolve) => {
            resolve('# Hello\n\nGoodbye');
        })};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window, {'markdownText': '# Goodbye\n\nHello'});
    app.updateParams('url=other.md');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': 'Hello',
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': 'url=other.md&_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    {'html': 'h1', 'attr': {'id': 'url=other.md&hello'}, 'elem': [{'text': 'Hello'}]},
                    {'html': 'p', 'elem': [{'text': 'Goodbye'}]}
                ]
            ]
        }
    );
});


test('MarkdownUp.main, markdownText url override empty', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': '# Goodbye\n\nHello'});
    app.updateParams('url=');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': 'Goodbye',
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': 'url=&_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    {'html': 'h1', 'attr': {'id': 'url=&goodbye'}, 'elem': [{'text': 'Goodbye'}]},
                    {'html': 'p', 'elem': [{'text': 'Hello'}]}
                ]
            ]
        }
    );
});


// Helper function to create the "url" hash parameter not-allowed error result
function hashURLErrorResult(url) {
    return {
        'title': 'MarkdownUp',
        'elements': {'html': 'p', 'elem': {'text': `Error: The "url" hash parameter resource URL "${url}" is not allowed`}}
    };
}


// Helper function to create a MarkdownUp application that tracks its fetched URLs
function hashURLApp(options = null, responseURL = null) {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchURLs = [];
    window.fetch = (url) => new Promise((resolve) => {
        fetchURLs.push(url);
        const response = {'ok': true, 'text': () => new Promise((resolveText) => {
            resolveText('# Hello');
        })};
        if (responseURL !== null) {
            response.url = responseURL;
        }
        resolve(response);
    });
    return [new MarkdownUp(window, options), fetchURLs];
}


test('MarkdownUp.main, url same-origin', async () => {
    for (const url of ['other.md', '../other.md', '/other.md', 'https://github.com/other.md', '//github.com/other.md']) {
        const [app, fetchURLs] = hashURLApp();
        app.updateParams(`url=${encodeURIComponent(url)}`);
        assert.equal((await app.main()).title, 'Hello');
        assert.deepEqual(fetchURLs, [url]);
    }
});


test('MarkdownUp.main, url cross-origin', async () => {
    const urls = [
        'https://other.com/other.md',
        'http://github.com/other.md',
        'https://github.com:8080/other.md',
        'https://github.com.other.com/other.md',
        '//other.com/other.md',
        '\\\\other.com\\other.md',
        'data:text/markdown,%23%20Hello',
        'blob:https://github.com/5b0f4c0c-7b0a-4c0e-8a53-1c9d1f0c3a11',
        'https://'
    ];
    for (const url of urls) {
        const [app, fetchURLs] = hashURLApp();
        app.updateParams(`url=${encodeURIComponent(url)}`);
        assert.deepEqual(await app.main(), hashURLErrorResult(url));
        assert.deepEqual(fetchURLs, []);
    }
});


test('MarkdownUp.main, url cross-origin markdownText', async () => {
    const [app, fetchURLs] = hashURLApp({'markdownText': '# Goodbye'});
    app.updateParams('url=https%3A%2F%2Fother.com%2Fother.md');
    assert.deepEqual(await app.main(), hashURLErrorResult('https://other.com/other.md'));
    assert.deepEqual(fetchURLs, []);
});


test('MarkdownUp.main, url cross-origin view markdown', async () => {
    const [app, fetchURLs] = hashURLApp();
    app.updateParams('url=https%3A%2F%2Fother.com%2Fother.md&view=markdown');
    assert.deepEqual(await app.main(), hashURLErrorResult('https://other.com/other.md'));
    assert.deepEqual(fetchURLs, []);
});


test('MarkdownUp.main, url cross-origin option url', async () => {
    // The application's "url" option is not subject to the "url" hash parameter policy
    for (const hashURL of ['sameOrigin', 'none']) {
        const [app, fetchURLs] = hashURLApp({hashURL, 'url': 'https://other.com/other.md'});
        app.updateParams('');
        assert.equal((await app.main()).title, 'Hello');
        assert.deepEqual(fetchURLs, ['https://other.com/other.md']);
    }
});


test('MarkdownUp.main, url redirect same-origin', async () => {
    const [app, fetchURLs] = hashURLApp(null, 'https://github.com/redirect.md');
    app.updateParams('url=other.md');
    assert.equal((await app.main()).title, 'Hello');
    assert.deepEqual(fetchURLs, ['other.md']);
});


test('MarkdownUp.main, url redirect cross-origin', async () => {
    const [app, fetchURLs] = hashURLApp(null, 'https://other.com/redirect.md');
    app.updateParams('url=other.md');
    assert.deepEqual(await app.main(), hashURLErrorResult('https://other.com/redirect.md'));
    assert.deepEqual(fetchURLs, ['other.md']);
});


test('MarkdownUp.main, url hashURL any', async () => {
    const [app, fetchURLs] = hashURLApp({'hashURL': 'any'}, 'https://another.com/redirect.md');
    app.updateParams('url=https%3A%2F%2Fother.com%2Fother.md');
    assert.equal((await app.main()).title, 'Hello');
    assert.deepEqual(fetchURLs, ['https://other.com/other.md']);
});


test('MarkdownUp.main, url hashURL none', async () => {
    for (const hashURL of ['none', 'unknown']) {
        const [app, fetchURLs] = hashURLApp({hashURL});
        app.updateParams('url=other.md');
        assert.deepEqual(await app.main(), hashURLErrorResult('other.md'));
        assert.deepEqual(fetchURLs, []);

        // The empty "url" hash parameter is no "url" hash parameter
        app.updateParams('url=');
        assert.equal((await app.main()).title, 'Hello');
        assert.deepEqual(fetchURLs, ['README.md']);
    }
});


test('MarkdownUp.main, code block', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchResolve = (url) => {
        assert.equal(url, 'README.md');
        return {'ok': true, 'text': () => new Promise((resolve) => {
            resolve(`\
# Hello

~~~
Code
~~~
`);
        })};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('');
    const mainElements = await app.main();
    assert.deepEqual(
        deleteElementCallbacks(mainElements),
        {
            'title': 'Hello',
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': '_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    {'html': 'h1', 'attr': {'id': 'hello'}, 'elem': [{'text': 'Hello'}]},
                    {
                        'html': 'pre',
                        'attr': {
                            'id': '__markdown_copy_1',
                            'style': 'display: flex;'
                        },
                        'elem': [
                            {
                                'html': 'code',
                                'attr': {'style': 'flex: 1; min-width: 0; overflow-x: auto;'},
                                'elem': {'text': 'Code\n'}
                            },
                            {
                                'svg': 'svg',
                                'attr': {
                                    class: 'barescript-no-print',
                                    'width': '20',
                                    'height': '20',
                                    'viewBox': '0 0 24 24',
                                    'style': 'align-self: flex-start; flex-shrink: 0; cursor: pointer; user-select: none;',
                                    // eslint-disable-next-line max-len
                                    'onclick': "window.navigator.clipboard.writeText(document.getElementById('__markdown_copy_1').innerText);"
                                },
                                'elem': {
                                    'svg': 'path',
                                    'attr': {
                                        'fill': 'var(--barescript-color-border)',
                                        // eslint-disable-next-line max-len
                                        'd': 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z'
                                    }
                                }
                            }
                        ]
                    }
                ]
            ]
        }
    );
});


test('MarkdownUp.main, fontSize', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
markdownPrint('fontSize = ' + numberToFixed(documentFontSize()))
~~~
`
    });
    app.updateParams(null, '{"fontSize": 14}');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': null,
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': '_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    [
                        [
                            {'html': 'p', 'elem': [{'text': 'fontSize = 18.67'}]}
                        ]
                    ]
                ]
            ]
        }
    );
});


test('MarkdownUp.main, fetch script', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchResolve = (url) => {
        assert.equal(url, 'README.md');
        return {'ok': true, 'text': () => new Promise((resolve) => {
            resolve('# Hello');
        })};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
markdownPrint(systemFetch('README.md'))
~~~
`
    });
    app.updateParams('');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': null,
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': '_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    [
                        [
                            {
                                'html': 'h1',
                                'attr': {'id': 'hello'},
                                'elem': [{'text': 'Hello'}]
                            }
                        ]
                    ]
                ]
            ]
        }
    );
});


test('MarkdownUp.main, fetch error', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchResolve = (url) => {
        assert.equal(url, 'README.md');
        return {'ok': false, 'statusText': 'Not Found'};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': 'MarkdownUp',
            'elements': {
                'html': 'p',
                'elem': {'text': 'Error: Could not fetch "README.md" - "Not Found"'}
            }
        }
    );
});


test('MarkdownUp.main, fetch error no status text', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchResolve = (url) => {
        assert.equal(url, 'README.md');
        return {'ok': false, 'statusText': ''};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': 'MarkdownUp',
            'elements': {
                'html': 'p',
                'elem': {'text': 'Error: Could not fetch "README.md"'}
            }
        }
    );
});


test('MarkdownUp.main, no title', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': 'Hello'});
    app.updateParams('');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': null,
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': '_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    {'html': 'p', 'elem': [{'text': 'Hello'}]}
                ]
            ]
        }
    );
});


test('MarkdownUp.main, menu', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': 'Hello'});
    app.updateParams('', null, '{"menu": 1}');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': null,
            'elements': [
                [
                    [
                        menuBurgerElements({'menu': true}),
                        menuElements()
                    ],
                    {'html': 'div', 'attr': {'id': '_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    {'html': 'p', 'elem': [{'text': 'Hello'}]}
                ]
            ]
        }
    );
});


test('MarkdownUp.main, no menu', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': 'Hello', 'menu': false});
    app.updateParams('', null, '{"menu": 1}');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': null,
            'elements': [
                [
                    null,
                    {'html': 'div', 'attr': {'id': '_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    {'html': 'p', 'elem': [{'text': 'Hello'}]}
                ]
            ]
        }
    );
});


test('MarkdownUp.main, menu cycle and toggle', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': 'Hello'});
    app.updateParams('view=markdown', '{"fontSize": 18}', '{"menu": 1}');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': null,
            'elements': [
                [
                    [
                        menuBurgerElements({'menu': true}),
                        menuElements({'fontSize': 18, 'viewMarkdown': true})
                    ],
                    {'html': 'div', 'attr': {'id': 'view=markdown&_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                {'html': 'div', 'attr': {'class': 'markdown'}, 'elem': {'text': 'Hello'}}
            ]
        }
    );
});


test('MarkdownUp.main, markdown', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': 'Hello'});
    app.updateParams('view=markdown', null, null);
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': null,
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': 'view=markdown&_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                {'html': 'div', 'attr': {'class': 'markdown'}, 'elem': {'text': 'Hello'}}
            ]
        }
    );
});


test('MarkdownUp.main, darkMode', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': 'Hello'});
    app.updateParams('', '{"darkMode": true}', '{"menu": 1}');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': null,
            'elements': [
                [
                    [
                        menuBurgerElements({'menu': true}),
                        menuElements({'darkMode': true})
                    ],
                    {'html': 'div', 'attr': {'id': '_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    {'html': 'p', 'elem': [{'text': 'Hello'}]}
                ]
            ]
        }
    );
});


test('MarkdownUp.main, markdown-script', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'markdownText': `\
# markdown-script

~~~ markdown-script
markdownPrint('Hello', '~~~', 'Code', '~~~')
~~~
`
    });
    app.updateParams('');
    const mainElements = await app.main();
    assert.deepEqual(
        deleteElementCallbacks(mainElements),
        {
            'title': 'markdown-script',
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': '_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    {'html': 'h1', 'attr': {'id': 'markdown-script'}, 'elem': [{'text': 'markdown-script'}]},
                    [
                        [
                            {'html': 'p', 'elem': [{'text': 'Hello'}]},
                            {
                                'html': 'pre',
                                'attr': {
                                    'id': '__markdown_copy_1',
                                    'style': 'display: flex;'
                                },
                                'elem': [
                                    {
                                        'html': 'code',
                                        'attr': {'style': 'flex: 1; min-width: 0; overflow-x: auto;'},
                                        'elem': {'text': 'Code\n'}
                                    },
                                    {
                                        'svg': 'svg',
                                        'attr': {
                                            class: 'barescript-no-print',
                                            'width': '20',
                                            'height': '20',
                                            'viewBox': '0 0 24 24',
                                            'style': 'align-self: flex-start; flex-shrink: 0; cursor: pointer; user-select: none;',
                                            // eslint-disable-next-line max-len
                                            'onclick': "window.navigator.clipboard.writeText(document.getElementById('__markdown_copy_1').innerText);"
                                        },
                                        'elem': {
                                            'svg': 'path',
                                            'attr': {
                                                'fill': 'var(--barescript-color-border)',
                                                // eslint-disable-next-line max-len
                                                'd': 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z'
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    ]
                ]
            ]
        }
    );
});


test('MarkdownUp.main, markdown-script execution order', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchResolve = (url) => {
        assert.equal(url, 'data.txt');
        return {'ok': true, 'text': () => new Promise((resolve) => {
            resolve('World');
        })};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window, {
        'markdownText': `\
# markdown-script execution order

~~~ markdown-script
value = systemFetch('data.txt')
~~~

~~~ markdown-script
markdownPrint('Hello, ' + value + '!')
~~~
`
    });
    app.updateParams('');
    const mainElements = await app.main();
    assert.deepEqual(
        deleteElementCallbacks(mainElements),
        {
            'title': 'markdown-script execution order',
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': '_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    {
                        'html': 'h1',
                        'attr': {'id': 'markdown-script-execution-order'},
                        'elem': [{'text': 'markdown-script execution order'}]
                    },
                    null,
                    [
                        [
                            {'html': 'p', 'elem': [{'text': 'Hello, World!'}]}
                        ]
                    ]
                ]
            ]
        }
    );
});


test('MarkdownUp.main, markdown-script windowPlaySound', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    // Mock the Web Audio context
    let audioContextCount = 0;
    let createBufferCount = 0;
    const makeParam = () => ({'setValueAtTime': () => null, 'exponentialRampToValueAtTime': () => null});
    window.AudioContext = class {
        constructor() {
            audioContextCount += 1;
            this.state = 'running';
            this.currentTime = 0;
            this.sampleRate = 8;
            this.destination = {};
            this.createGain = () => ({'gain': makeParam(), 'connect': () => null});
            this.createOscillator = () => (
                {'frequency': makeParam(), 'connect': () => null, 'start': () => null, 'stop': () => null}
            );
            this.createBuffer = (unusedChannels, length) => {
                createBufferCount += 1;
                return {'getChannelData': () => new Float32Array(length)};
            };
            this.createBufferSource = () => ({'connect': () => null, 'start': () => null, 'stop': () => null});
            this.createBiquadFilter = () => ({'frequency': {}, 'connect': () => null});
        }
    };

    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
windowPlaySound('click')
windowPlaySound('drumHihat')
windowPlaySound('drumHihat')
~~~
`
    });
    app.updateParams('');

    assert.equal(app.audioContext, null);
    assert.equal(app.audioNoiseBuffer, null);
    await app.main();

    // A single, shared audio context and noise buffer were created across all windowPlaySound calls
    assert.equal(audioContextCount, 1);
    assert.equal(createBufferCount, 1);
    assert(app.audioContext instanceof window.AudioContext);
    assert.notEqual(app.audioNoiseBuffer, null);
});


test('MarkdownUp, key state', () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window);

    // The key state starts empty
    assert.deepEqual(app.keyState, {});

    // A keydown records the key as down along with the modifier flags
    window.dispatchEvent(new window.KeyboardEvent('keydown', {'code': 'ArrowUp', 'ctrlKey': true}));
    assert.deepEqual(app.keyState, {'ArrowUp': true, 'ctrl': true, 'shift': false, 'alt': false, 'meta': false});

    // A keyup records the key as up
    window.dispatchEvent(new window.KeyboardEvent('keyup', {'code': 'ArrowUp'}));
    assert.deepEqual(app.keyState, {'ArrowUp': false, 'ctrl': false, 'shift': false, 'alt': false, 'meta': false});

    // A second key is pressed, then a window blur clears all key state
    window.dispatchEvent(new window.KeyboardEvent('keydown', {'code': 'KeyW', 'shiftKey': true}));
    assert.equal(app.keyState.KeyW, true);
    assert.equal(app.keyState.shift, true);
    window.dispatchEvent(new window.Event('blur'));
    assert.deepEqual(app.keyState, {'ArrowUp': false, 'ctrl': false, 'shift': false, 'alt': false, 'meta': false, 'KeyW': false});
});


test('MarkdownUp.main, markdown-script windowKeyState', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
markdownPrint('ArrowUp is ' + if(windowKeyState('ArrowUp'), 'down', 'up'))
~~~
`
    });

    // No key is down
    window.location.hash = '#';
    await app.render();
    assert(window.document.body.innerHTML.endsWith('<p>ArrowUp is up</p>'));

    // Press ArrowUp and re-render
    window.dispatchEvent(new window.KeyboardEvent('keydown', {'code': 'ArrowUp'}));
    window.location.hash = '#';
    await app.render(true);
    assert(window.document.body.innerHTML.endsWith('<p>ArrowUp is down</p>'));
});


test('MarkdownUp.main, markdown-script invalid markdown line', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'markdownText': `\
# markdown-script

~~~ markdown-script
markdownPrint('1')
~~~

~~~ markdown-script
markdownPrint(null)
~~~

~~~ markdown-script
markdownPrint({})
~~~

~~~ markdown-script
markdownPrint('2')
~~~
`
    });
    app.updateParams('');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': 'markdown-script',
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': '_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    {'html': 'h1', 'attr': {'id': 'markdown-script'}, 'elem': [{'text': 'markdown-script'}]},
                    [
                        [
                            {'html': 'p', 'elem': [{'text': '1'}]}
                        ]
                    ],
                    [[]],
                    [[]],
                    [
                        [
                            {'html': 'p', 'elem': [{'text': '2'}]}
                        ]
                    ]
                ]
            ]
        }
    );
});


test('MarkdownUp.main, markdown-script globals', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'globals': {'message': 'Globals'},
        'markdownText': `\
~~~ markdown-script
markdownPrint(message)
~~~
`
    });
    app.updateParams('');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': null,
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': '_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    [
                        [
                            {'html': 'p', 'elem': [{'text': 'Globals'}]}
                        ]
                    ]
                ]
            ]
        }
    );
});


test('MarkdownUp.main, markdown-script debug', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchResolve = (url) => {
        assert.equal(url, 'README.md');
        return {'ok': true, 'text': () => new Promise((resolve) => {
            resolve(`\
# markdown-script

~~~ markdown-script
systemLogDebug('Hello')
~~~
`);
        })};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const logs = [];
    window.console = {
        'log': (message) => {
            logs.push(message);
        }
    };
    const app = new MarkdownUp(window);
    app.updateParams('', null, '{"debug": 1}');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': 'markdown-script',
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': '_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    {'html': 'h1', 'attr': {'id': 'markdown-script'}, 'elem': [{'text': 'markdown-script'}]},
                    null
                ]
            ]
        }
    );
    const cleanedLogs = logs.map((log) => log.replace(/\d+(\.\d+)? milliseconds/, 'X milliseconds'));
    assert.deepEqual(cleanedLogs, [
        'MarkdownUp: ===== Rendering Markdown document "README.md"',
        'MarkdownUp: Fetching "README.md" ...',
        'MarkdownUp: Fetch completed in X milliseconds',
        'MarkdownUp: Executing script at line number 4 ...',
        'Hello',
        'MarkdownUp: Script static analysis... OK',
        'MarkdownUp: Script executed in X milliseconds',
        'MarkdownUp: Markdown rendered in X milliseconds'
    ]);
});


test('MarkdownUp.main, markdown-script debug text', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const logs = [];
    window.console = {
        'log': (message) => {
            logs.push(message);
        }
    };
    const app = new MarkdownUp(window, {
        'markdownText': `\
# markdown-script

~~~ markdown-script
systemLogDebug('Hello')
~~~
`
    });
    app.updateParams('', null, '{"debug": 1}');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': 'markdown-script',
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': '_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    {'html': 'h1', 'attr': {'id': 'markdown-script'}, 'elem': [{'text': 'markdown-script'}]},
                    null
                ]
            ]
        }
    );
    const cleanedLogs = logs.map((log) => log.replace(/\d+(\.\d+)? milliseconds/, 'X milliseconds'));
    assert.deepEqual(cleanedLogs, [
        'MarkdownUp: ===== Rendering Markdown text',
        'MarkdownUp: Executing script at line number 4 ...',
        'Hello',
        'MarkdownUp: Script static analysis... OK',
        'MarkdownUp: Script executed in X milliseconds',
        'MarkdownUp: Markdown rendered in X milliseconds'
    ]);
});


test('MarkdownUp.main, markdown-script debug warnings', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const logs = [];
    window.console = {
        'log': (message) => {
            logs.push(message);
        }
    };
    const app = new MarkdownUp(window, {
        'markdownText': `\
# markdown-script

~~~ markdown-script
~~~

~~~ markdown-script
function foo(a, b):
endfunction
~~~
`
    });
    app.updateParams('', null, '{"debug": 1}');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': 'markdown-script',
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': '_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    {'html': 'h1', 'attr': {'id': 'markdown-script'}, 'elem': [{'text': 'markdown-script'}]},
                    null,
                    null
                ]
            ]
        }
    );
    const cleanedLogs = logs.map((log) => log.replace(/\d+(\.\d+)? milliseconds/, 'X milliseconds'));
    assert.deepEqual(cleanedLogs, [
        'MarkdownUp: ===== Rendering Markdown text',
        'MarkdownUp: Executing script at line number 4 ...',
        'MarkdownUp: Script static analysis... 1 warning:',
        'MarkdownUp: :1: Empty script',
        'MarkdownUp: Script executed in X milliseconds',
        'MarkdownUp: Executing script at line number 7 ...',
        'MarkdownUp: Script static analysis... 2 warnings:',
        'MarkdownUp: :1: Unused argument "a" of function "foo"',
        'MarkdownUp: :1: Unused argument "b" of function "foo"',
        'MarkdownUp: Script executed in X milliseconds',
        'MarkdownUp: Markdown rendered in X milliseconds'
    ]);
});


test('MarkdownUp.main, markdown-script variables', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
markdownPrint('varName = ' + varName)
~~~
`
    });
    app.updateParams('var.varName=5');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': null,
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': 'var.varName=5&_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    [
                        [
                            {'html': 'p', 'elem': [{'text': 'varName = 5'}]}
                        ]
                    ]
                ]
            ]
        }
    );
});


test('MarkdownUp.main, markdown-script variables error', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const logs = [];
    window.console = {
        'log': (message) => {
            logs.push(message);
        }
    };
    const app = new MarkdownUp(
        window,
        {
            'markdownText': `\
~~~ markdown-script
markdownPrint('varName = ' + varName)
~~~
`
        }
    );
    app.updateParams('var.varName=foo%20bar', null, '{"debug": 1}');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': null,
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': 'var.varName=foo%20bar&_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    [
                        [
                            {'html': 'p', 'elem': [{'text': 'varName = null'}]}
                        ]
                    ]
                ]
            ]
        }
    );
    const cleanedLogs = logs.map((log) => log.replace(/\d+(\.\d+)? milliseconds/, 'X milliseconds'));
    assert.deepEqual(cleanedLogs, [
        `\
MarkdownUp: Error evaluating variable "varName" expression "foo bar": Syntax error
foo bar
   ^
`,
        'MarkdownUp: ===== Rendering Markdown text',
        'MarkdownUp: Executing script at line number 2 ...',
        'MarkdownUp: Script static analysis... 1 warning:',
        'MarkdownUp: :1: Unknown global variable "varName"',
        'MarkdownUp: Script executed in X milliseconds',
        'MarkdownUp: Markdown rendered in X milliseconds'
    ]);
});


test('MarkdownUp.main, markdown-script runtime error', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
foobar()
~~~
`
    });
    app.updateParams('');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()),
        {
            'title': null,
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': '_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                [
                    [
                        null,
                        {'html': 'pre', 'elem': {'text': 'Undefined function "foobar"'}}
                    ]
                ]
            ]
        }
    );
});


test('MarkdownUp.main, menu options', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    window.console.log = () => null;
    const app = new MarkdownUp(window, {'markdownText': 'Hello', 'helpURL': '#help'});
    app.updateParams('', '{"fontSize": 24, "lineHeight": 1.5}', '{"menu": 1, "debug": 1}');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()).elements[0][0],
        [
            menuBurgerElements({'menu': true}),
            menuElements({'debug': true, 'fontSize': 24, 'fontSizeUp': false, 'helpURL': '#help', 'lineHeight': 1.5})
        ]
    );

    app.updateParams('', '{"fontSize": 8}', '{"menu": 1}');
    assert.deepEqual(
        deleteElementCallbacks(await app.main()).elements[0][0],
        [
            menuBurgerElements({'menu': true}),
            menuElements({'fontSize': 8, 'fontSizeDown': false, 'helpURL': '#help'})
        ]
    );
});


//
// Voice playback
//


// Helper to create an application with a mock audio context and a mock PicoVox
function testVoiceApp(window, options) {
    window.AudioContext = MockAudioContext;
    const app = new MarkdownUp(window, options);
    const picovox = mockPicovox();
    app.voice.loadFn = () => Promise.resolve(picovox);
    return [app, picovox];
}


// Helper to get the voice playback bar's button elements, by label
function voiceButtons(bar) {
    return Object.fromEntries(Array.from(bar.querySelectorAll('button')).map((button) => [button.getAttribute('aria-label'), button]));
}


// Helper function to create the voice playback bar elements
function voiceElements({playing = true, rate = 1, voice = 'Michael'} = {}) {
    const buttonElements = (label, path, fill = true, isPrimary = false) => ({
        'html': 'button',
        'attr': {'type': 'button', 'class': `voice-button${isPrimary ? ' voice-primary' : ''}`, 'aria-label': label},
        'elem': iconElements(path, isPrimary ? 22 : 18, fill)
    });
    return {
        'html': 'div',
        'attr': {'class': 'voice', 'role': 'group', 'aria-label': 'Read aloud'},
        'elem': [
            buttonElements('Rewind', 'M5,6 H8 V18 H5 Z M19,6 L10,12 L19,18 Z'),
            buttonElements('Skip back', 'M12,6 L3,12 L12,18 Z M21,6 L12,12 L21,18 Z'),
            (playing
                ? buttonElements('Pause', 'M8,6 H11 V18 H8 Z M13,6 H16 V18 H13 Z', true, true)
                : buttonElements('Play', 'M9,6 L18,12 L9,18 Z', true, true)),
            buttonElements('Skip forward', 'M3,6 L12,12 L3,18 Z M12,6 L21,12 L12,18 Z'),
            {'html': 'button', 'attr': {'type': 'button', 'class': 'voice-text', 'aria-label': 'Voice'}, 'elem': {'text': voice}},
            {'html': 'span', 'attr': {'class': 'voice-separator'}, 'elem': {'text': '|'}},
            {
                'html': 'button',
                'attr': {'type': 'button', 'class': 'voice-text', 'aria-label': 'Speaking rate'},
                'elem': {'text': `${rate}x`}
            },
            buttonElements('Close', 'M7,7 L17,17 M17,7 L7,17', false)
        ]
    };
}


test('MarkdownUp, read aloud', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    window.location.hash = '#';
    window.sessionStorage.setItem('MarkdownUp', '{"menu": 1}');
    const [app, picovox] = testVoiceApp(window, {'markdownText': `\
[Home](#home) | [Docs](#docs)

# The Title

Hello there.

~~~
code block
~~~

## Section Two

Goodbye.
`});
    await app.render();
    assert.equal(app.voice.state(), null);
    assert.equal(window.document.getElementById('markdownUpVoiceDefault'), null);

    // Click the read aloud menu item - the page is read aloud (without its navigation links) and the menu closes
    menuItem(window, 'Read aloud').click();
    await flushTasks();
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{}');
    assert.equal(window.document.querySelector('.menu'), null);
    assert.deepEqual(app.voice.state(), {'key': null, 'playing': true});
    assert.deepEqual(app.voice.audioContext.calls, ['resume']);
    assert.deepEqual(picovox.calls.map(([text]) => text), ['The Title', 'Hello there.', 'Section Two', 'Goodbye.']);
    assert.deepEqual(picovox.calls[0][1], {'voice': 'michael', 'rate': 1, 'seed': 1000, 'pause': 0, 'sampleRate': 24000});

    // The voice playback bar is rendered in its own element
    let bar = window.document.getElementById('markdownUpVoiceDefault');
    assert.equal(bar, window.document.body.firstChild);
    assert.equal(bar.className, 'voice-default');
    assert.deepEqual(Object.keys(voiceButtons(bar)), ['Rewind', 'Skip back', 'Pause', 'Skip forward', 'Voice', 'Speaking rate', 'Close']);
    assert.deepEqual(deleteElementCallbacks(app.voiceElements()), voiceElements());

    // The page read aloud isn't a script's voice playback
    const scriptOptions = app.createScriptOptions();
    assert.equal(scriptOptions.voice.state(), null);
    scriptOptions.voice.setText('Other text.', true);
    scriptOptions.voice.close();
    await flushTasks();
    assert.deepEqual(app.voice.state(), {'key': null, 'playing': true});
    assert.equal(picovox.calls.length, 4);

    // An unchanged voice playback bar isn't rendered again
    const barVoice = bar.firstChild;
    app.renderVoice();
    assert.equal(bar.firstChild, barVoice);

    // Pause and play
    voiceButtons(bar).Pause.click();
    assert.deepEqual(app.voice.state(), {'key': null, 'playing': false});
    assert.deepEqual(deleteElementCallbacks(app.voiceElements()), voiceElements({'playing': false}));
    assert.notEqual(bar.firstChild, barVoice);
    voiceButtons(bar).Play.click();
    assert.deepEqual(app.voice.state(), {'key': null, 'playing': true});
    assert.deepEqual(Object.keys(voiceButtons(bar)), ['Rewind', 'Skip back', 'Pause', 'Skip forward', 'Voice', 'Speaking rate', 'Close']);

    // Skip forward, skip back, and rewind
    voiceButtons(bar)['Skip forward'].click();
    assert.equal(app.voice.playback.run.position, 2);
    voiceButtons(bar)['Skip back'].click();
    assert.equal(app.voice.playback.run.position, 0);
    voiceButtons(bar)['Skip forward'].click();
    voiceButtons(bar).Rewind.click();
    assert.equal(app.voice.playback.run.position, 0);

    // Change the voice and the speaking rate
    assert.equal(voiceButtons(bar).Voice.textContent, 'Michael');
    voiceButtons(bar).Voice.click();
    assert.equal(voiceButtons(bar).Voice.textContent, 'Sarah');
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{"voice":"sarah"}');
    assert.equal(voiceButtons(bar)['Speaking rate'].textContent, '1x');
    voiceButtons(bar)['Speaking rate'].click();
    assert.equal(voiceButtons(bar)['Speaking rate'].textContent, '1.1x');
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{"voice":"sarah","voiceRate":1.1}');
    assert.deepEqual(deleteElementCallbacks(app.voiceElements()), voiceElements({'rate': 1.1, 'voice': 'Sarah'}));
    await flushTasks();
    assert.deepEqual(
        picovox.calls[picovox.calls.length - 1][1],
        {'voice': 'sarah', 'rate': 1.1, 'seed': 1003, 'pause': 0.4, 'sampleRate': 24000}
    );

    // The page read aloud continues when the page is rendered again - and its voice playback bar is left in place
    const barVoiceRendered = bar.firstChild;
    await app.render(true);
    assert.deepEqual(app.voice.state(), {'key': null, 'playing': true});
    assert.equal(window.document.getElementById('markdownUpVoiceDefault'), bar);
    assert.equal(bar, window.document.body.firstChild);
    assert.equal(bar.firstChild, barVoiceRendered);
    assert(window.document.body.innerHTML.endsWith('<p>Goodbye.</p>'));
    assert.equal(window.document.querySelectorAll('.menu-burger').length, 1);
    assert.equal(voiceButtons(bar).Voice.textContent, 'Sarah');

    // A new page ends the page read aloud
    window.location.hash = '#var.vPage=2';
    await app.render();
    assert.equal(app.voice.state(), null);
    assert.equal(window.document.getElementById('markdownUpVoiceDefault'), null);

    // Read aloud again, with the preferred voice and speaking rate
    const callCount = picovox.calls.length;
    window.document.querySelector('.menu-button').click();
    await flushTasks();
    menuItem(window, 'Read aloud').click();
    await flushTasks();
    assert.deepEqual(
        picovox.calls[callCount],
        ['The Title', {'voice': 'sarah', 'rate': 1.1, 'seed': 1000, 'pause': 0, 'sampleRate': 24000}]
    );

    // Close
    bar = window.document.getElementById('markdownUpVoiceDefault');
    voiceButtons(bar).Close.click();
    assert.equal(app.voice.state(), null);
    assert.equal(window.document.getElementById('markdownUpVoiceDefault'), null);
    await flushTasks();
});


test('MarkdownUp, read aloud nothing', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    window.location.hash = '#';
    window.sessionStorage.setItem('MarkdownUp', '{"menu": 1}');
    const [app, picovox] = testVoiceApp(window, {'markdownText': '~~~\ncode block\n~~~\n'});
    await app.render();

    // Click the read aloud menu item - the page has nothing to read, so the menu just closes
    menuItem(window, 'Read aloud').click();
    await flushTasks();
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{}');
    assert.equal(window.document.querySelector('.menu'), null);
    assert.equal(app.voice.state(), null);
    assert.equal(app.voice.audioContext, null);
    assert.equal(window.document.getElementById('markdownUpVoiceDefault'), null);
    assert.deepEqual(picovox.calls, []);
});


test('MarkdownUp, read aloud before PicoVox loads', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    window.location.hash = '#view=markdown';
    window.sessionStorage.setItem('MarkdownUp', '{"menu": 1}');
    const [app, picovox] = testVoiceApp(window, {'markdownText': '# The Title\n\nHello *there*.'});
    let loadResolve;
    app.voice.loadFn = () => new Promise((resolve) => {
        loadResolve = resolve;
    });
    await app.render();
    assert(window.document.body.innerHTML.endsWith('<div class="markdown"># The Title\n\nHello *there*.</div>'));

    // Click the read aloud menu item
    menuItem(window, 'Read aloud').click();
    await flushTasks();
    assert.deepEqual(app.voice.state(), {'key': null, 'playing': true});

    // The voice can't be changed until PicoVox loads
    const bar = window.document.getElementById('markdownUpVoiceDefault');
    assert.equal(voiceButtons(bar).Voice.textContent, 'Michael');
    voiceButtons(bar).Voice.click();
    assert.equal(voiceButtons(bar).Voice.textContent, 'Michael');
    assert.equal(window.localStorage.getItem('MarkdownUp'), null);

    // PicoVox loads - the Markdown text view's text is read aloud as Markdown
    loadResolve(picovox);
    await flushTasks();
    assert.deepEqual(picovox.calls.map(([text]) => text), ['The Title', 'Hello there.']);
    voiceButtons(bar).Voice.click();
    assert.equal(voiceButtons(bar).Voice.textContent, 'Sarah');
    app.voice.close();
    await flushTasks();
});


test('MarkdownUp, voice script', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    window.location.hash = '#';
    window.localStorage.setItem('MarkdownUp', '{"voice": "james", "voiceRate": 1.5}');
    window.sessionStorage.setItem('MarkdownUp', '{"menu": 1}');
    const [app, picovox] = testVoiceApp(window, {'markdownText': `\
# The Title

~~~ markdown-script
if !systemGlobalGet('vPage'):
    voiceSpeak('Hello there. More te', false, 'key1')
endif
markdownPrint('State: ' + jsonStringify(voiceState()))
~~~
`});
    await app.render();
    await flushTasks();
    assert(window.document.body.innerHTML.includes('<p>State: {"key":"key1","playing":true}</p>'));
    assert.equal(window.document.getElementById('markdownUpVoiceDefault'), window.document.body.firstChild);
    assert.deepEqual(app.voice.state(), {'key': 'key1', 'playing': true});
    assert.deepEqual(picovox.calls, [
        ['Hello there.', {'voice': 'james', 'rate': 1.5, 'seed': 1000, 'pause': 0, 'sampleRate': 24000}]
    ]);

    // Setting the same text does nothing
    const scriptOptions = app.createScriptOptions();
    const {sentences} = app.voice.playback;
    scriptOptions.voice.setText('Hello there. More te', false);
    assert.equal(app.voice.playback.sentences, sentences);

    // The text grows
    scriptOptions.voice.setText('Hello there. More text. And mo', false);
    await flushTasks();
    assert.deepEqual(picovox.calls.map(([text]) => text), ['Hello there.', 'More text.']);
    scriptOptions.voice.setText('Hello there. More text. And mo', true);
    await flushTasks();
    assert.deepEqual(picovox.calls.map(([text]) => text), ['Hello there.', 'More text.', 'And mo']);

    // A script's voice playback continues on a new page
    window.location.hash = '#var.vPage=2';
    await app.render();
    await flushTasks();
    assert.deepEqual(app.voice.state(), {'key': 'key1', 'playing': true});
    assert.equal(picovox.calls.length, 3);

    // Reading the page aloud replaces the script's voice playback
    menuItem(window, 'Read aloud').click();
    await flushTasks();
    assert.deepEqual(app.voice.state(), {'key': null, 'playing': true});
    assert.equal(scriptOptions.voice.state(), null);
    assert.deepEqual(picovox.calls.slice(3).map(([text]) => text), ['The Title', 'State: {"key":"key1","playing":true}']);

    // A script's voice playback replaces the page read aloud
    scriptOptions.voice.speak('Bye.', true, null);
    assert.deepEqual(scriptOptions.voice.state(), {'key': null, 'playing': true});
    scriptOptions.voice.close();
    assert.equal(scriptOptions.voice.state(), null);
    assert.equal(app.voice.state(), null);
    scriptOptions.voice.setText('Bye bye.', true);
    assert.equal(app.voice.state(), null);
    await flushTasks();
});


test('MarkdownUp, voice playback bar page element', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    // Patch window.setTimeout and window.clearTimeout
    const windowTimeout = {};
    window.setTimeout = (callback) => {
        windowTimeout.callback = callback;
        return 1;
    };
    window.clearTimeout = () => null;

    window.location.hash = '#';
    const [app] = testVoiceApp(window, {
        'menu': false,
        'markdownText': `\
~~~ markdown-script
function main(count):
    markdownPrint('Count ' + count)
    elementModelRender({'html': 'div', 'attr': {'id': 'markdownUpVoice'}})
    windowSetTimeout(systemPartial(main, count + 1), 1000)
endfunction

markdownPrint('# Title')
windowSetTimeout(systemPartial(main, 1), 1000)
~~~
`
    });
    await app.render();
    assert.equal(
        window.document.body.innerHTML,
        '<div id="_top" style="display=none; position: absolute; top: 0;"></div><h1 id="title">Title</h1>'
    );

    // Start a voice playback - the page has no voice playback bar element, so the bar is rendered in its own element
    const scriptOptions = app.createScriptOptions();
    scriptOptions.voice.speak('Hello.', true, null);
    assert.equal(window.document.getElementById('markdownUpVoiceDefault'), window.document.body.firstChild);
    assert.equal(window.document.querySelectorAll('.voice').length, 1);

    // The page renders its voice playback bar element - the bar is rendered in it
    await windowTimeout.callback();
    assert.deepEqual(voiceElementsParagraphs(app.pageElements), [{'text': 'Count 1', 'section': false}]);
    assert.equal(window.document.getElementById('markdownUpVoiceDefault'), null);
    let pageBar = window.document.getElementById('markdownUpVoice');
    assert.equal(pageBar, window.document.body.lastChild);
    assert.equal(window.document.querySelectorAll('.voice').length, 1);
    assert.equal(pageBar.firstChild.className, 'voice');

    // The page renders again
    await windowTimeout.callback();
    assert.notEqual(window.document.getElementById('markdownUpVoice'), pageBar);
    pageBar = window.document.getElementById('markdownUpVoice');
    assert.equal(pageBar.firstChild.className, 'voice');

    // Close the voice playback - the page's voice playback bar element is cleared
    voiceButtons(pageBar).Close.click();
    assert.equal(app.voice.state(), null);
    assert.equal(pageBar.firstChild, null);
    app.renderVoice();
    assert.equal(pageBar.firstChild, null);
    assert.equal(window.document.getElementById('markdownUpVoiceDefault'), null);
    await flushTasks();
});


test('MarkdownUp, voice playback bar document reset', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    // Patch window.setTimeout and window.clearTimeout
    const windowTimeout = {};
    window.setTimeout = (callback) => {
        windowTimeout.callback = callback;
        return 1;
    };
    window.clearTimeout = () => null;

    window.location.hash = '#';
    const [app] = testVoiceApp(window, {
        'menu': false,
        'markdownText': `\
~~~ markdown-script
function main(count):
    markdownPrint('Hello ' + count)
    windowSetTimeout(systemPartial(main, count + 1), 1000)
    documentSetReset(if(count <= 2, 'resetID', 'unknownID'))
endfunction

elementModelRender({'html': 'div', 'attr': {'id': 'resetID'}})
main(1)
~~~
`
    });
    await app.render();
    const {body} = window.document;
    assert(body.innerHTML.endsWith('<div id="resetID"></div><p>Hello 1</p>'));

    // Start a voice playback - the voice playback bar's own element is the body's first element
    app.createScriptOptions().voice.speak('Hello.', true, null);
    await flushTasks();
    const bar = window.document.getElementById('markdownUpVoiceDefault');
    const barVoice = bar.firstChild;
    assert.equal(bar, body.firstChild);
    assert.equal(barVoice.className, 'voice');

    // The page renders below its reset element - the voice playback bar is left in place
    await windowTimeout.callback();
    assert(body.innerHTML.endsWith('<div id="resetID"></div><p>Hello 2</p>'));
    assert.equal(body.firstChild, bar);
    assert.equal(bar.firstChild, barVoice);

    // The reset ID is unknown, so the page's elements are all removed - the voice playback bar is still left in place
    await windowTimeout.callback();
    assert.equal(body.children.length, 2);
    assert.equal(body.lastChild.outerHTML, '<p>Hello 3</p>');
    assert.equal(body.firstChild, bar);
    assert.equal(bar.firstChild, barVoice);
    app.voice.close();
    assert.equal(body.children.length, 1);
    await flushTasks();
});


test('MarkdownUp, voice script new document', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    window.fetch = (url) => Promise.resolve({'ok': true, 'text': () => Promise.resolve(`# Document ${url}`)});
    window.location.hash = '#url=one.md';
    const [app] = testVoiceApp(window);
    await app.render();
    assert(window.document.body.innerHTML.endsWith('Document one.md</h1>'));

    // A script's voice playback continues on a new page of the document
    app.createScriptOptions().voice.speak('Hello.', true, 'key1');
    window.location.hash = '#url=one.md&var.vPage=2';
    await app.render();
    assert.deepEqual(app.voice.state(), {'key': 'key1', 'playing': true});
    assert.notEqual(window.document.getElementById('markdownUpVoiceDefault'), null);

    // A new document ends it
    window.location.hash = '#url=two.md&var.vPage=2';
    await app.render();
    assert(window.document.body.innerHTML.endsWith('Document two.md</h1>'));
    assert.equal(app.voice.state(), null);
    assert.equal(window.document.getElementById('markdownUpVoiceDefault'), null);
    await flushTasks();
});


test('MarkdownUp, page elements document reset', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    // Patch window.setTimeout and window.clearTimeout
    const windowTimeout = {};
    window.setTimeout = (callback) => {
        windowTimeout.callback = callback;
        return 1;
    };
    window.clearTimeout = () => null;

    window.location.hash = '#';
    const app = new MarkdownUp(window, {
        'menu': false,
        'markdownText': `\
Intro

~~~ markdown-script
function main(count):
    markdownPrint('Hello ' + count)
    windowSetTimeout(systemPartial(main, count + 1), 1000)
    documentSetReset(if(count <= 2, 'resetID', 'unknownID'))
endfunction

markdownPrint('# Title')
elementModelRender({'html': 'div', 'attr': {'id': 'resetID'}})
main(1)
~~~
`
    });
    await app.render();
    assert.deepEqual(voiceElementsParagraphs(app.pageElements).map(({text}) => text), ['Intro', 'Title', 'Hello 1']);

    // Call the timeout callback - the page elements are reset
    await windowTimeout.callback();
    assert.deepEqual(voiceElementsParagraphs(app.pageElements).map(({text}) => text), ['Intro', 'Title', 'Hello 2']);

    // Call the timeout callback - the reset ID is unknown, so there are no page elements after the reset
    await windowTimeout.callback();
    assert.equal(window.document.body.innerHTML, '<p>Hello 3</p>');
    assert.deepEqual(voiceElementsParagraphs(app.pageElements).map(({text}) => text), ['Hello 3']);
});


test('MarkdownUp, voice lines', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    window.location.hash = '#';
    const [app, picovox] = testVoiceApp(window, {'markdownText': `\
~~~ markdown-script
voiceLoad()
voiceSay('Go for ignition.', 'james', 'angry')
markdownPrint('Ready: ' + voiceReady())
markdownPrint('State: ' + jsonStringify(voiceState()))
~~~
`});
    await app.render();
    await flushTasks();

    // The line is said - it isn't a voice playback, so there's no voice playback bar
    const audioContext = app.voice.lineAudioContext;
    assert.deepEqual(audioContext.calls, ['resume', 'resume']);
    assert.deepEqual(picovox.calls, [
        ['Go for ignition.', {'voice': 'james', 'style': 'angry', 'rate': 1, 'seed': 1000, 'pause': 0, 'sampleRate': 24000}]
    ]);
    assert(window.document.body.innerHTML.endsWith('<p>Ready: true\nState: null</p>'));
    assert.equal(app.voice.state(), null);
    assert.equal(window.document.getElementById('markdownUpVoiceDefault'), null);
    assert.equal(app.voice.lines.size, 1);
    assert.deepEqual(audioContext.sources.map((source) => source.stopped), [false]);

    // Rendering the page anew stops its lines (and the page says its line again)
    await app.render(true);
    await flushTasks();
    assert.deepEqual(audioContext.sources.map((source) => source.stopped), [true, false]);
    assert.equal(app.voice.lines.size, 1);

    // The script library's voiceClose stops the lines
    app.createScriptOptions().voice.close();
    assert.deepEqual(audioContext.sources.map((source) => source.stopped), [true, true]);
    assert.equal(app.voice.lines.size, 0);
});
