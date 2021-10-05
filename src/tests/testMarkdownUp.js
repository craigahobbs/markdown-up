// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/* eslint-disable id-length */

import {JSDOM} from 'jsdom/lib/api.js';
import {MarkdownUp} from '../markdown-up/index.js';
import test from 'ava';


// Helper function to create the menu burger elements
function menuBurgerElements({
    menuURL = '#menu=1'
} = {}) {
    return {
        'html': 'div',
        'attr': {'class': 'menu-burger'},
        'elem': [
            {
                'html': 'a',
                'attr': {'href': menuURL, 'aria-label': 'Menu'},
                'elem': {
                    'svg': 'svg',
                    'attr': {'width': '24', 'height': '24', 'viewBox': '0 0 24 24'},
                    'elem': {
                        'svg': 'path',
                        'attr': {
                            'd': 'M3,5 L21,5 M3,12 L21,12 M3,19 L21,19',
                            'fill': 'none', 'stroke': 'black', 'stroke-width': '3'
                        }
                    }
                }
            }
        ]
    };
}


// Helper function to create the menu elements
function menuElements({
    fontSizeURL = '#fontSize=14&menu=1',
    lineHeightURL = '#lineHeight=1.4&menu=1',
    markdownURL = '#cmd.markdown=1&menu=1',
    helpURL = '#cmd.help=1&menu=1'
} = {}) {
    return {
        'html': 'div',
        'attr': {'class': 'menu'},
        'elem': [
            {
                'html': 'a',
                'attr': {'href': fontSizeURL, 'aria-label': 'Font size'},
                'elem': {
                    'svg': 'svg',
                    'attr': {'width': '36', 'height': '36', 'viewBox': '0 0 24 24'},
                    'elem': {
                        'svg': 'path',
                        'attr': {
                            'd': 'M4,22 L10,2 L14,2 L20,22 M6,14 L18,14',
                            'fill': 'none', 'stroke': 'black', 'stroke-width': '4'
                        }
                    }
                }
            },
            {
                'html': 'a',
                'attr': {'href': lineHeightURL, 'aria-label': 'Line height'},
                'elem': {
                    'svg': 'svg',
                    'attr': {'width': '36', 'height': '36', 'viewBox': '0 0 24 24'},
                    'elem': {
                        'svg': 'path',
                        'attr': {
                            'd': 'M2,3 L22,3 M2,9 L22,9 M2,15 L22,15 M2,21 L22,21',
                            'fill': 'none', 'stroke': 'black', 'stroke-width': '2'
                        }
                    }
                }
            },
            {
                'html': 'a',
                'attr': {'href': markdownURL, 'aria-label': 'Show Markdown'},
                'elem': {
                    'svg': 'svg',
                    'attr': {'width': '36', 'height': '36', 'viewBox': '0 0 24 24'},
                    'elem': [
                        {
                            'svg': 'path',
                            'attr': {
                                'd': 'M4,2 L20,2 L20,22 L4,22 Z',
                                'fill': 'none', 'stroke': 'black', 'stroke-width': '3'
                            }
                        },
                        {
                            'svg': 'path',
                            'attr': {
                                'd': 'M7,7.5 L17,7.5 M7,12 L17,12 M7,16.5 L17,16.5',
                                'fill': 'none', 'stroke': 'black', 'stroke-width': '2'
                            }
                        }
                    ]
                }
            },
            {
                'html': 'a',
                'attr': {'href': helpURL, 'aria-label': 'Help'},
                'elem': {
                    'svg': 'svg',
                    'attr': {'width': '36', 'height': '36', 'viewBox': '0 0 24 24'},
                    'elem': {
                        'svg': 'path',
                        'attr': {
                            'd': 'M7,9 L7,4 L17,4 L17,12 L12,12 L12,16 M12,19 L12,22',
                            'fill': 'none', 'stroke': 'black', 'stroke-width': '3'
                        }
                    }
                }
            }
        ]
    };
}


test('MarkdownUp, constructor', (t) => {
    const {window} = new JSDOM();
    const app = new MarkdownUp(window);
    t.is(app.window, window);
    t.is(app.fontSize, 12);
    t.is(app.lineHeight, 1.2);
    t.is(app.menu, true);
    t.is(app.url, 'README.md');
    t.is(app.params, null);
});


test('MarkdownUp, constructor options', (t) => {
    const {window} = new JSDOM();
    const app = new MarkdownUp(window, {
        'fontSize': 14,
        'lineHeight': 1.6,
        'menu': false,
        'url': 'CHANGELOG.md'
    });
    t.is(app.window, window);
    t.is(app.fontSize, 14);
    t.is(app.lineHeight, 1.6);
    t.is(app.menu, false);
    t.is(app.url, 'CHANGELOG.md');
    t.is(app.params, null);
});


test('MarkdownUp.run, help command', async (t) => {
    const {window} = new JSDOM();

    const documentElementStyleSetPropertyCalls = [];
    window.document.documentElement.style.setProperty = (prop, val) => documentElementStyleSetPropertyCalls.push([prop, val]);

    window.location.hash = '#cmd.help=1';
    const app = await MarkdownUp.run(window);
    t.is(app.window, window);
    t.is(app.fontSize, 12);
    t.is(app.lineHeight, 1.2);
    t.is(app.menu, true);
    t.deepEqual(app.params, {'cmd': {'help': 1}});
    t.is(window.document.title, 'MarkdownUp');
    t.true(window.document.body.innerHTML.startsWith('<h1 id="cmd.help=1&amp;type_MarkdownUp">MarkdownUp</h1>'));
    t.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-font-size', '12pt'],
        ['--markdown-model-line-height', `1.2em`]
    ]);
});


test('MarkdownUp.run, font size and line height', async (t) => {
    const {window} = new JSDOM();

    const documentElementStyleSetPropertyCalls = [];
    window.document.documentElement.style.setProperty = (prop, val) => documentElementStyleSetPropertyCalls.push([prop, val]);

    window.location.hash = '#cmd.help=1&fontSize=14&lineHeight=1.4';
    const app = await MarkdownUp.run(window);
    t.is(app.window, window);
    t.is(app.fontSize, 12);
    t.is(app.lineHeight, 1.2);
    t.is(app.menu, true);
    t.deepEqual(app.params, {'cmd': {'help': 1}, 'fontSize': 14, 'lineHeight': 1.4});
    t.is(window.document.title, 'MarkdownUp');
    t.true(window.document.body.innerHTML.startsWith(
        '<h1 id="cmd.help=1&amp;fontSize=14&amp;lineHeight=1.4&amp;type_MarkdownUp">MarkdownUp</h1>'
    ));
    t.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-font-size', '14pt'],
        ['--markdown-model-line-height', `1.4em`]
    ]);
});


test('MarkdownUp.run, main', async (t) => {
    const {window} = new JSDOM();
    const fetchResolve = (url) => {
        t.is(url, 'README.md');
        return {'ok': true, 'text': () => new Promise((resolve) => {
            resolve('# Hello');
        })};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });

    const documentElementStyleSetPropertyCalls = [];
    window.document.documentElement.style.setProperty = (prop, val) => documentElementStyleSetPropertyCalls.push([prop, val]);

    window.location.hash = '#';
    const app = await MarkdownUp.run(window);
    t.is(app.window, window);
    t.is(app.window, window);
    t.is(app.fontSize, 12);
    t.is(app.lineHeight, 1.2);
    t.is(app.menu, true);
    t.deepEqual(app.params, {});
    t.is(window.document.title, 'Hello');
    t.true(window.document.body.innerHTML.startsWith('<h1 id="hello">Hello</h1>'));
    t.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-font-size', '12pt'],
        ['--markdown-model-line-height', `1.2em`]
    ]);
});


test('MarkdownUp.run, hash parameter error', async (t) => {
    const {window} = new JSDOM();

    const documentElementStyleSetPropertyCalls = [];
    window.document.documentElement.style.setProperty = (prop, val) => documentElementStyleSetPropertyCalls.push([prop, val]);

    window.location.hash = '#foo=bar';
    const app = await MarkdownUp.run(window);
    t.is(app.window, window);
    t.is(app.params, null);
    t.is(window.document.title, 'MarkdownUp');
    t.is(window.document.body.innerHTML, "<p>Error: Unknown member 'foo'</p>");
    t.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-font-size', '12pt'],
        ['--markdown-model-line-height', `1.2em`]
    ]);
});


test('MarkdownUp.main', async (t) => {
    const {window} = new JSDOM();
    const fetchResolve = (url) => {
        t.is(url, 'README.md');
        return {'ok': true, 'text': () => new Promise((resolve) => {
            resolve('# Hello');
        })};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('');
    t.deepEqual(
        await app.main(),
        {
            'title': 'Hello',
            'elements': [
                [
                    {'html': 'h1', 'attr': {'id': 'hello'}, 'elem': [{'text': 'Hello'}]}
                ],
                menuBurgerElements(),
                null
            ]
        }
    );
});


test('MarkdownUp.main, url', async (t) => {
    const {window} = new JSDOM();
    const fetchResolve = (url) => {
        t.is(url, 'sub/other.md');
        return {'ok': true, 'text': () => new Promise((resolve) => {
            resolve(`\
# Hello

[A relative link](foo.html)

[A page link](#hello)
`);
        })};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('url=sub%2Fother.md');
    t.deepEqual(
        await app.main(),
        {
            'title': 'Hello',
            'elements': [
                [
                    {'html': 'h1', 'attr': {'id': 'url=sub%2Fother.md&hello'}, 'elem': [{'text': 'Hello'}]},
                    {
                        'html': 'p',
                        'elem': [
                            {
                                'html': 'a',
                                'attr': {'href': 'sub/foo.html'},
                                'elem': [{'text': 'A relative link'}]
                            }
                        ]
                    },
                    {
                        'html': 'p',
                        'elem': [
                            {
                                'html': 'a',
                                'attr': {'href': '#url=sub%2Fother.md&hello'},
                                'elem': [{'text': 'A page link'}]
                            }
                        ]
                    }
                ],
                menuBurgerElements({'menuURL': '#menu=1&url=sub%2Fother.md'}),
                null
            ]
        }
    );
});


test('MarkdownUp.main, fetch error', async (t) => {
    const {window} = new JSDOM();
    const fetchResolve = (url) => {
        t.is(url, 'README.md');
        return {'ok': false, 'statusText': 'Not Found'};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('');
    let errorMessage = null;
    try {
        await app.main();
    } catch ({message}) { /* c8 ignore next */
        errorMessage = message;
    }
    t.is(errorMessage, 'Could not fetch "README.md", "Not Found"');
});


test('MarkdownUp.main, fetch error no status text', async (t) => {
    const {window} = new JSDOM();
    const fetchResolve = (url) => {
        t.is(url, 'README.md');
        return {'ok': false, 'statusText': ''};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('');
    let errorMessage = null;
    try {
        await app.main();
    } catch ({message}) { /* c8 ignore next */
        errorMessage = message;
    }
    t.is(errorMessage, 'Could not fetch "README.md"');
});


test('MarkdownUp.main, no title', async (t) => {
    const {window} = new JSDOM();
    const fetchResolve = (url) => {
        t.is(url, 'README.md');
        return {'ok': true, 'text': () => new Promise((resolve) => {
            resolve('Hello');
        })};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('');
    t.deepEqual(
        await app.main(),
        {
            'elements': [
                [
                    {'html': 'p', 'elem': [{'text': 'Hello'}]}
                ],
                menuBurgerElements(),
                null
            ]
        }
    );
});


test('MarkdownUp.main, menu', async (t) => {
    const {window} = new JSDOM();
    const fetchResolve = (url) => {
        t.is(url, 'README.md');
        return {'ok': true, 'text': () => new Promise((resolve) => {
            resolve('Hello');
        })};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('menu=1');
    t.deepEqual(
        await app.main(),
        {
            'elements': [
                [
                    {'html': 'p', 'elem': [{'text': 'Hello'}]}
                ],
                menuBurgerElements({'menuURL': '#'}),
                menuElements()
            ]
        }
    );
});


test('MarkdownUp.main, no menu', async (t) => {
    const {window} = new JSDOM();
    const fetchResolve = (url) => {
        t.is(url, 'README.md');
        return {'ok': true, 'text': () => new Promise((resolve) => {
            resolve('Hello');
        })};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window, {'menu': false});
    app.updateParams('menu=1');
    t.deepEqual(
        await app.main(),
        {
            'elements': [
                [
                    {'html': 'p', 'elem': [{'text': 'Hello'}]}
                ],
                null,
                null
            ]
        }
    );
});


test('MarkdownUp.main, menu cycle and toggle', async (t) => {
    const {window} = new JSDOM();
    const fetchResolve = (url) => {
        t.is(url, 'README.md');
        return {'ok': true, 'text': () => new Promise((resolve) => {
            resolve('Hello');
        })};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('menu=1&fontSize=18&cmd.markdown=1');
    t.deepEqual(
        await app.main(),
        {
            'elements': [
                {'html': 'div', 'attr': {'class': 'markdown'}, 'elem': {'text': 'Hello'}},
                menuBurgerElements({'menuURL': '#cmd.markdown=1&fontSize=18'}),
                menuElements({
                    'fontSizeURL': '#cmd.markdown=1&fontSize=8&menu=1',
                    'lineHeightURL': '#cmd.markdown=1&fontSize=18&lineHeight=1.4&menu=1',
                    'markdownURL': '#fontSize=18&menu=1',
                    'helpURL': '#cmd.help=1&fontSize=18&menu=1'
                })
            ]
        }
    );
});


test('MarkdownUp.main, markdown', async (t) => {
    const {window} = new JSDOM();
    const fetchResolve = (url) => {
        t.is(url, 'README.md');
        return {'ok': true, 'text': () => new Promise((resolve) => {
            resolve('Hello');
        })};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('cmd.markdown=1');
    t.deepEqual(
        await app.main(),
        {
            'elements': [
                {'html': 'div', 'attr': {'class': 'markdown'}, 'elem': {'text': 'Hello'}},
                menuBurgerElements({'menuURL': '#cmd.markdown=1&menu=1'}),
                null
            ]
        }
    );
});
