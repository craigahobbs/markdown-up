// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import {JSDOM} from 'jsdom/lib/api.js';
import {MarkdownUp} from '../lib/app.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


// The JSDOM URL
const jsdomURL = 'https://github.com/craigahobbs/markdown-up';


// Helper function to create the menu burger elements
function menuBurgerElements({darkMode = false} = {}) {
    return {
        'html': 'div',
        'attr': {'class': 'menu-burger'},
        'elem': {
            'html': 'div',
            'attr': {'style': 'cursor: pointer; user-select: none;'},
            'elem': {
                'svg': 'svg',
                'attr': {'width': 32, 'height': 32},
                'elem': [
                    null,
                    {
                        'svg': 'g',
                        'attr': {'transform': 'translate(4.000, 4.000)'},
                        'elem': {
                            'svg': 'svg',
                            'attr': {'width': '24.000', 'height': '24.000', 'viewBox': '0 0 24 24'},
                            'elem': [
                                {
                                    'svg': 'path',
                                    'attr': {
                                        'fill': 'none',
                                        'stroke': (darkMode ? 'white' : 'black'),
                                        'stroke-width': 3,
                                        'd': 'M3,5 L21,5 M3,12 L21,12 M3,19 L21,19'
                                    }
                                },
                                null
                            ]
                        }
                    }
                ]
            }
        }
    };
}


// Helper function to create the menu elements
function menuElements({darkMode = false, viewMarkdown = false} = {}) {
    return {
        'html': 'div',
        'attr': {'class': 'menu'},
        'elem': [
            {
                'html': 'div',
                'attr': {'style': 'cursor: pointer; user-select: none;'},
                'elem': {
                    'svg': 'svg',
                    'attr': {'width': 48, 'height': 48},
                    'elem': [
                        !viewMarkdown ? null : {
                            'svg': 'rect',
                            'attr': {'fill': 'black', 'height': 48, 'stroke': 'none', 'width': 48}
                        },
                        {
                            'svg': 'g',
                            'attr': {'transform': 'translate(6.000, 6.000)'},
                            'elem': {
                                'svg': 'svg',
                                'attr': {'width': '36.000', 'height': '36.000', 'viewBox': '0 0 24 24'},
                                'elem': [
                                    {
                                        'svg': 'path',
                                        'attr': {
                                            'fill': 'none',
                                            'stroke': (darkMode || viewMarkdown ? 'white' : 'black'),
                                            'stroke-width': 3,
                                            'd': 'M4,2 L20,2 L20,22 L4,22 Z'
                                        }
                                    },
                                    {
                                        'svg': 'path',
                                        'attr': {
                                            'fill': 'none',
                                            'stroke': (darkMode || viewMarkdown ? 'white' : 'black'),
                                            'stroke-width': 2,
                                            'd': 'M7,7.5 L17,7.5 M7,12 L17,12 M7,16.5 L17,16.5'
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
            {
                'html': 'div',
                'attr': {'style': 'cursor: pointer; user-select: none;'},
                'elem': {
                    'svg': 'svg',
                    'attr': {'width': 48, 'height': 48},
                    'elem': [
                        !darkMode ? null : {
                            'svg': 'rect',
                            'attr': {'fill': 'white', 'height': 48, 'stroke': 'none', 'width': 48}
                        },
                        {
                            'svg': 'g',
                            'attr': {'transform': 'translate(6.000, 6.000)'},
                            'elem': {
                                'svg': 'svg',
                                'attr': {'width': '36.000', 'height': '36.000', 'viewBox': '0 0 24 24'},
                                'elem': [
                                    {
                                        'svg': 'path',
                                        'attr': {
                                            'fill': 'none',
                                            'stroke': 'black',
                                            'stroke-width': 3,
                                            'd': 'M16,3 A10,10,0,1,1,3,18 A14,14,0,0,0,17,3'
                                        }
                                    },
                                    null
                                ]
                            }
                        }
                    ]
                }
            },
            {
                'html': 'div',
                'attr': {'style': 'cursor: pointer; user-select: none;'},
                'elem': {
                    'svg': 'svg',
                    'attr': {'width': 48, 'height': 48},
                    'elem': [
                        null,
                        {
                            'svg': 'g',
                            'attr': {'transform': 'translate(6.000, 6.000)'},
                            'elem': {
                                'svg': 'svg',
                                'attr': {'width': '36.000', 'height': '36.000', 'viewBox': '0 0 24 24'},
                                'elem': [
                                    {
                                        'svg': 'path',
                                        'attr': {
                                            'fill': 'none',
                                            'stroke': (darkMode ? 'white' : 'black'),
                                            'stroke-width': 4,
                                            'd': 'M4,22 L10,2 L14,2 L20,22 M6,14 L18,14'
                                        }
                                    },
                                    null
                                ]
                            }
                        }
                    ]
                }
            },
            {
                'html': 'div',
                'attr': {'style': 'cursor: pointer; user-select: none;'},
                'elem': {
                    'svg': 'svg',
                    'attr': {'width': 48, 'height': 48},
                    'elem': [
                        null,
                        {
                            'svg': 'g',
                            'attr': {'transform': 'translate(6.000, 6.000)'},
                            'elem': {
                                'svg': 'svg',
                                'attr': {'width': '36.000', 'height': '36.000', 'viewBox': '0 0 24 24'},
                                'elem': [
                                    null,
                                    {
                                        'svg': 'path',
                                        'attr': {
                                            'fill': 'none',
                                            'stroke': (darkMode ? 'white' : 'black'),
                                            'stroke-width': 2,
                                            'd': 'M2,3 L22,3 M2,9 L22,9 M2,15 L22,15 M2,21 L22,21'
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
            {
                'html': 'div',
                'attr': {'style': 'cursor: pointer; user-select: none;'},
                'elem': {
                    'svg': 'svg',
                    'attr': {'width': 48, 'height': 48},
                    'elem': [
                        null,
                        {
                            'svg': 'g',
                            'attr': {'transform': 'translate(6.000, 6.000)'},
                            'elem': {
                                'svg': 'svg',
                                'attr': {'width': '36.000', 'height': '36.000', 'viewBox': '0 0 24 24'},
                                'elem': [
                                    {
                                        'svg': 'path',
                                        'attr': {
                                            'fill': 'none',
                                            'stroke': (darkMode ? 'white' : 'black'),
                                            'stroke-width': 3,
                                            // eslint-disable-next-line max-len
                                            'd': 'M12,5 A4,7,0,1,0,12,19 A4,7,0,1,0,12,5 M9,9 L15,9 M9,9 L4,6 M9,12 L3,12 M9,15 L4,18 M15,9 L20,6 M15,12 L21,12 M15,15 L20,18'
                                        }
                                    },
                                    null
                                ]
                            }
                        }
                    ]
                }
            },
            {
                'html': 'div',
                'attr': {'style': 'cursor: pointer; user-select: none;'},
                'elem': {
                    'svg': 'svg',
                    'attr': {'width': 48, 'height': 48},
                    'elem': [
                        null,
                        {
                            'svg': 'g',
                            'attr': {'transform': 'translate(6.000, 6.000)'},
                            'elem': {
                                'svg': 'svg',
                                'attr': {'width': '36.000', 'height': '36.000', 'viewBox': '0 0 24 24'},
                                'elem': [
                                    {
                                        'svg': 'path',
                                        'attr': {
                                            'fill': 'none',
                                            'stroke': (darkMode ? 'white' : 'black'),
                                            'stroke-width': 3,
                                            'd': 'M7,9 L7,4 L17,4 L17,12 L12,12 L12,16 M12,19 L12,22'
                                        }
                                    },
                                    null
                                ]
                            }
                        }
                    ]
                }
            }
        ]
    };
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


function sleep(ms) {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise((resolve) => setTimeout(resolve, ms));
}


test('MarkdownUp, constructor', () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window);
    assert.equal(app.window, window);
    assert.equal(app.params, null);
    assert.equal(app.fontSize, 12);
    assert.equal(app.lineHeight, 1.2);
    assert.equal(app.menu, true);
    assert.equal(app.url, 'README.md');
});


test('MarkdownUp, constructor options', () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'fontSize': 14,
        'lineHeight': 1.6,
        'menu': false,
        'url': 'CHANGELOG.md'
    });
    assert.equal(app.window, window);
    assert.equal(app.params, null);
    assert.equal(app.fontSize, 14);
    assert.equal(app.lineHeight, 1.6);
    assert.equal(app.menu, false);
    assert.equal(app.url, 'CHANGELOG.md');
});


test('MarkdownUp, run and render', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    const documentElementStyleSetPropertyCalls = [];
    window.document.documentElement.style.setProperty = (prop, val) => documentElementStyleSetPropertyCalls.push([prop, val]);

    window.location.hash = '#view=help';
    const app = new MarkdownUp(window, {'menu': false});
    await app.run();
    assert.equal(window.document.title, 'MarkdownUp');
    assert(window.document.body.innerHTML.startsWith(
        '<div id="view=help&amp;_top" style="display=none; position: absolute; top: 0;"></div>' +
            '<h1 id="view=help&amp;type_MarkdownUp">struct MarkdownUp</h1>'
    ));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-dark-mode', '0'],
        ['--markdown-model-font-size', '12pt'],
        ['--markdown-model-line-height', `1.2em`]
    ]);

    window.location.hash = '#view=help';
    window.localStorage.setItem('MarkdownUp', '{"darkMode": true, "fontSize": 14, "lineHeight": 1.4}');
    window.sessionStorage.setItem('MarkdownUp', '{}');
    documentElementStyleSetPropertyCalls.length = 0;
    await app.render(true);
    assert.equal(window.document.title, 'MarkdownUp');
    assert(window.document.body.innerHTML.startsWith(
        '<div id="view=help&amp;_top" style="display=none; position: absolute; top: 0;"></div>' +
            '<h1 id="view=help&amp;type_MarkdownUp">struct MarkdownUp</h1>'
    ));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-dark-mode', '1'],
        ['--markdown-model-font-size', '14pt'],
        ['--markdown-model-line-height', `1.4em`]
    ]);
});


test('MarkdownUp, render bad params', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    const documentElementStyleSetPropertyCalls = [];
    window.document.documentElement.style.setProperty = (prop, val) => documentElementStyleSetPropertyCalls.push([prop, val]);

    window.location.hash = '#unknown=bad';
    const app = new MarkdownUp(window);
    await app.render();
    assert.equal(window.document.title, 'MarkdownUp');
    assert.equal(window.document.body.innerHTML, "<p>Error: Unknown member 'unknown'</p>");
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-dark-mode', '0'],
        ['--markdown-model-font-size', '12pt'],
        ['--markdown-model-line-height', `1.2em`]
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
        ['--markdown-model-dark-mode', '0'],
        ['--markdown-model-font-size', '12pt'],
        ['--markdown-model-line-height', `1.2em`]
    ]);
    assert.equal(window.localStorage.getItem('MarkdownUp'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), null);

    // Click the menu button and wait for the render
    let [, menuButton] = window.document.getElementsByTagName('div');
    window.document.body.innerHTML = '';
    menuButton.click();
    await sleep(0);
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.equal(window.localStorage.getItem('MarkdownUp'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu":1}');

    // Click the menu button again
    [, menuButton] = window.document.getElementsByTagName('div');
    window.document.body.innerHTML = '';
    menuButton.click();
    await sleep(0);
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
        ['--markdown-model-dark-mode', '0'],
        ['--markdown-model-font-size', '12pt'],
        ['--markdown-model-line-height', `1.2em`]
    ]);
    assert.equal(window.localStorage.getItem('MarkdownUp'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');

    // Click the Markdown menu button and wait for the render
    let [, , , markdownButton] = window.document.getElementsByTagName('div');
    window.document.title = '';
    window.document.body.innerHTML = '';
    markdownButton.click();
    await sleep(0);
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
    [, , , markdownButton] = window.document.getElementsByTagName('div');
    window.document.title = '';
    window.document.body.innerHTML = '';
    markdownButton.click();
    await sleep(0);
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
        ['--markdown-model-dark-mode', '0'],
        ['--markdown-model-font-size', '12pt'],
        ['--markdown-model-line-height', `1.2em`]
    ]);
    assert.deepEqual(windowMatchMediaCalls, [
        '(prefers-color-scheme: dark)'
    ]);
    assert.equal(window.localStorage.getItem('MarkdownUp'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');

    // Click the dark mode menu button and wait for the render
    let [, , , , darkModeButton] = window.document.getElementsByTagName('div');
    window.document.body.innerHTML = '';
    documentElementStyleSetPropertyCalls.length = 0;
    windowMatchMediaCalls.length = 0;
    darkModeButton.click();
    await sleep(0);
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-dark-mode', '1'],
        ['--markdown-model-font-size', '12pt'],
        ['--markdown-model-line-height', `1.2em`]
    ]);
    assert.deepEqual(windowMatchMediaCalls, []);
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{"darkMode":true}');
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');

    // Click the dark mode menu button again
    [, , , , darkModeButton] = window.document.getElementsByTagName('div');
    window.document.body.innerHTML = '';
    documentElementStyleSetPropertyCalls.length = 0;
    windowMatchMediaCalls.length = 0;
    darkModeButton.click();
    await sleep(0);
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-dark-mode', '0'],
        ['--markdown-model-font-size', '12pt'],
        ['--markdown-model-line-height', `1.2em`]
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
        ['--markdown-model-dark-mode', '1'],
        ['--markdown-model-font-size', '12pt'],
        ['--markdown-model-line-height', `1.2em`]
    ]);
    assert.deepEqual(windowMatchMediaCalls, [
        '(prefers-color-scheme: dark)'
    ]);
    assert.equal(window.localStorage.getItem('MarkdownUp'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');

    // Click the dark mode menu button and wait for the render
    let [, , , , darkModeButton] = window.document.getElementsByTagName('div');
    window.document.body.innerHTML = '';
    documentElementStyleSetPropertyCalls.length = 0;
    windowMatchMediaCalls.length = 0;
    darkModeButton.click();
    await sleep(0);
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-dark-mode', '0'],
        ['--markdown-model-font-size', '12pt'],
        ['--markdown-model-line-height', `1.2em`]
    ]);
    assert.deepEqual(windowMatchMediaCalls, []);
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{"darkMode":false}');
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');

    // Click the dark mode menu button again
    [, , , , darkModeButton] = window.document.getElementsByTagName('div');
    window.document.body.innerHTML = '';
    documentElementStyleSetPropertyCalls.length = 0;
    windowMatchMediaCalls.length = 0;
    darkModeButton.click();
    await sleep(0);
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-dark-mode', '1'],
        ['--markdown-model-font-size', '12pt'],
        ['--markdown-model-line-height', `1.2em`]
    ]);
    assert.deepEqual(windowMatchMediaCalls, []);
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{}');
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');
});


test('MarkdownUp, render menu cycle', async () => {
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
        ['--markdown-model-dark-mode', '0'],
        ['--markdown-model-font-size', '12pt'],
        ['--markdown-model-line-height', `1.2em`]
    ]);
    assert.equal(window.localStorage.getItem('MarkdownUp'), null);
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');

    // Click the Markdown menu button and wait for the render
    let [, , , , , markdownButton] = window.document.getElementsByTagName('div');
    window.document.body.innerHTML = '';
    documentElementStyleSetPropertyCalls.length = 0;
    markdownButton.click();
    await sleep(0);
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-dark-mode', '0'],
        ['--markdown-model-font-size', '14pt'],
        ['--markdown-model-line-height', `1.2em`]
    ]);
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{"fontSize":14}');
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');

    // Click the Markdown menu button again to cycle-over
    [, , , , , markdownButton] = window.document.getElementsByTagName('div');
    window.document.body.innerHTML = '';
    documentElementStyleSetPropertyCalls.length = 0;
    markdownButton.click();
    await sleep(0);
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-dark-mode', '0'],
        ['--markdown-model-font-size', '16pt'],
        ['--markdown-model-line-height', `1.2em`]
    ]);
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{"fontSize":16}');
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');
});


test('MarkdownUp, render menu cycle overflow', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    const documentElementStyleSetPropertyCalls = [];
    window.document.documentElement.style.setProperty = (prop, val) => documentElementStyleSetPropertyCalls.push([prop, val]);

    window.location.hash = '#';
    window.localStorage.setItem('MarkdownUp', '{"fontSize": 18}');
    window.sessionStorage.setItem('MarkdownUp', '{"menu": 1}');
    const app = new MarkdownUp(window, {'markdownText': 'Hello!'});
    await app.render();
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-dark-mode', '0'],
        ['--markdown-model-font-size', '18pt'],
        ['--markdown-model-line-height', `1.2em`]
    ]);
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{"fontSize": 18}');
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');

    // Click the Markdown menu button and wait for the render
    const [, , , , , markdownButton] = window.document.getElementsByTagName('div');
    window.document.body.innerHTML = '';
    documentElementStyleSetPropertyCalls.length = 0;
    markdownButton.click();
    await sleep(0);
    assert(window.document.body.innerHTML.endsWith('<p>Hello!</p>'));
    assert.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-dark-mode', '0'],
        ['--markdown-model-font-size', '8pt'],
        ['--markdown-model-line-height', `1.2em`]
    ]);
    assert.equal(window.localStorage.getItem('MarkdownUp'), '{"fontSize":8}');
    assert.equal(window.sessionStorage.getItem('MarkdownUp'), '{"menu": 1}');
});


test('MarkdownUp, render timeout', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    // Patch window.setTimeout and window.clearTimeout
    const windowTimeout = {'id': 0};
    window.setTimeout = (callback, delay) => {
        if (delay === 0) {
            // Ignore JSDOM call?
            return 0;
        }
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
    if(count == 2, windowSetTimeout(main, 2000))
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

    // Call the timeout callback again
    await windowTimeout.callback();
    assert.equal(windowTimeout.delay, null);
    assert.equal(app.runtimeTimeoutId, null);
    assert.equal(window.document.title, '');
    assert(window.document.body.innerHTML.endsWith('<p>Hello 3</p>'));
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


test('MarkdownUp, render focus', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
function main():
    systemGlobalSet('count', count + 1)
    elementModelRender(objectNew( \
        'html', 'input', \
        'attr', objectNew( \
            'id', 'test-input', \
            'type', 'text', \
            'value', 'Text ' + count \
        ), \
        'callback', objectNew('click', main) \
    ))
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
        if (delay === 0) {
            // Ignore JSDOM call?
            return 0;
        }
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
elementModelRender(objectNew('html', 'div', 'attr', objectNew('id', 'resetID', 'style', 'display=none')))

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

elementModelRender(objectNew( \
    'html', 'span', \
    'attr', objectNew('id', 'test-span'), \
    'elem', objectNew('text', 'Click Here'), \
    'callback', objectNew('click', onClick) \
))
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

elementModelRender(objectNew( \
    'html', 'span', \
    'attr', objectNew('id', 'test-span'), \
    'elem', objectNew('text', 'Click Here'), \
    'callback', objectNew('click', onClick) \
))
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


test('MarkdownUp.main, help', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window);
    app.updateParams('view=help', null, null);
    const result = deleteElementCallbacks(await app.main());
    assert.deepEqual(
        result.elements[1][0][0],
        {'html': 'h1', 'attr': {'id': 'view=help&type_MarkdownUp'}, 'elem': {'text': 'struct MarkdownUp'}}
    );
    result.elements[1] = '<helpElements>';
    assert.deepEqual(
        result,
        {
            'title': 'MarkdownUp',
            'elements': [
                [
                    [
                        menuBurgerElements(),
                        null
                    ],
                    {'html': 'div', 'attr': {'id': 'view=help&_top', 'style': 'display=none; position: absolute; top: 0;'}}
                ],
                '<helpElements>'
            ]
        }
    );
});


test('MarkdownUp.updateParams, invalid session/local storage', () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window);
    app.updateParams('', 'BAD', 'BAD');
    assert.deepEqual(app.params, {});
    assert.deepEqual(app.paramsLocal, {});
    assert.deepEqual(app.paramsSession, {});
});


test('MarkdownUp.main', async () => {
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
    const copyCalls = [];
    window.navigator.clipboard = {
        'writeText': (text) => {
            copyCalls.push(text);
        }
    };
    const app = new MarkdownUp(window);
    app.updateParams('');
    const mainElements = await app.main();
    const copyCallback = mainElements.elements[1][1][0].elem.callback;
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
                    [
                        {
                            'html': 'p',
                            'attr': {'style': 'cursor: pointer; font-size: 0.85em; text-align: right; user-select: none;'},
                            'elem': {'html': 'a', 'elem': {'text': 'Copy'}}
                        },
                        {
                            'html': 'pre',
                            'attr': {'style': 'margin-top: 0.25em'},
                            'elem': {'html': 'code', 'elem': {'text': 'Code\n'}}
                        }
                    ]
                ]
            ]
        }
    );

    // Test the copy callback
    const element = {
        'addEventListener': (event, eventFn) => {
            assert.equal(event, 'click');
            eventFn();
        }
    };
    copyCallback(element);
    assert.deepEqual(copyCalls, ['Code\n']);
});


test('MarkdownUp.main, fontSize', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': `\
~~~ markdown-script
markdownPrint('fontSize = ' + numberToFixed(documentFontSize()))
~~~
`});
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
                        menuBurgerElements(),
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
                        menuBurgerElements(),
                        menuElements({'viewMarkdown': true})
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
                        menuBurgerElements({'darkMode': 1}),
                        menuElements({'darkMode': 1})
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
    const copyCalls = [];
    window.navigator.clipboard = {
        'writeText': (text) => {
            copyCalls.push(text);
        }
    };
    const app = new MarkdownUp(window, {'markdownText': `\
# markdown-script

~~~ markdown-script
markdownPrint('Hello', '~~~', 'Code', '~~~')
~~~
`});
    app.updateParams('');
    const mainElements = await app.main();
    const copyElem = mainElements.elements[1][1][0][1][0].elem;
    const copyCallback = copyElem.callback;
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
                            [
                                {
                                    'html': 'p',
                                    'attr': {'style': 'cursor: pointer; font-size: 0.85em; text-align: right; user-select: none;'},
                                    'elem': {'html': 'a', 'elem': {'text': 'Copy'}}
                                },
                                {
                                    'html': 'pre',
                                    'attr': {'style': 'margin-top: 0.25em'},
                                    'elem': {'html': 'code', 'elem': {'text': 'Code\n'}}
                                }
                            ]
                        ]
                    ]
                ]
            ]
        }
    );

    // Test the copy callback
    const element = {
        'addEventListener': (event, eventFn) => {
            assert.equal(event, 'click');
            eventFn();
        }
    };
    copyCallback(element);
    assert.deepEqual(copyCalls, ['Code\n']);
});


test('MarkdownUp.main, markdown-script invalid markdown line', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': `\
# markdown-script

~~~ markdown-script
markdownPrint('1')
~~~

~~~ markdown-script
markdownPrint(null)
~~~

~~~ markdown-script
markdownPrint(objectNew())
~~~

~~~ markdown-script
markdownPrint('2')
~~~
`});
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
                    [],
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
    const app = new MarkdownUp(window, {'globals': {'message': 'Globals'}, 'markdownText': `\
~~~ markdown-script
markdownPrint(message)
~~~
`});
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
        'MarkdownUp: Script static analysis... OK',
        'Hello',
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
    const app = new MarkdownUp(window, {'markdownText': `\
# markdown-script

~~~ markdown-script
systemLogDebug('Hello')
~~~
`});
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
        'MarkdownUp: Script static analysis... OK',
        'Hello',
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
    const app = new MarkdownUp(window, {'markdownText': `\
# markdown-script

~~~ markdown-script
~~~

~~~ markdown-script
function foo(a, b):
endfunction
~~~
`});
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
        'MarkdownUp:     Empty script',
        'MarkdownUp: Script executed in X milliseconds',
        'MarkdownUp: Executing script at line number 7 ...',
        'MarkdownUp: Script static analysis... 2 warnings:',
        'MarkdownUp:     Unused argument "a" of function "foo" (index 0)',
        'MarkdownUp:     Unused argument "b" of function "foo" (index 0)',
        'MarkdownUp: Script executed in X milliseconds',
        'MarkdownUp: Markdown rendered in X milliseconds'
    ]);
});


test('MarkdownUp.main, markdown-script variables', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': `\
~~~ markdown-script
markdownPrint('varName = ' + varName)
~~~
`});
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
MarkdownUp: Error evaluating variable "varName" expression "foo bar": Syntax error:
foo bar
   ^
`,
        'MarkdownUp: ===== Rendering Markdown text',
        'MarkdownUp: Executing script at line number 2 ...',
        'MarkdownUp: Script static analysis... OK',
        'MarkdownUp: Script executed in X milliseconds',
        'MarkdownUp: Markdown rendered in X milliseconds'
    ]);
});


test('MarkdownUp.main, markdown-script runtime error', async () => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': `\
~~~ markdown-script
foobar()
~~~
`});
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
