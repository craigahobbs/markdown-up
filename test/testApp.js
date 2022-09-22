// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/* eslint-disable id-length */

import {JSDOM} from 'jsdom/lib/api.js';
import {MarkdownUp} from '../lib/app.js';
import test from 'ava';


// The JSDOM URL
const jsdomURL = 'https://github.com/craigahobbs/markdown-up';


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
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window);
    t.is(app.window, window);
    t.is(app.params, null);
    t.is(app.fontSize, 12);
    t.is(app.lineHeight, 1.2);
    t.is(app.menu, true);
    t.is(app.url, 'README.md');
});


test('MarkdownUp, constructor options', (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'fontSize': 14,
        'lineHeight': 1.6,
        'menu': false,
        'url': 'CHANGELOG.md'
    });
    t.is(app.window, window);
    t.is(app.params, null);
    t.is(app.fontSize, 14);
    t.is(app.lineHeight, 1.6);
    t.is(app.menu, false);
    t.is(app.url, 'CHANGELOG.md');
});


test('MarkdownUp, run and render', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    const documentElementStyleSetPropertyCalls = [];
    window.document.documentElement.style.setProperty = (prop, val) => documentElementStyleSetPropertyCalls.push([prop, val]);

    window.location.hash = '#cmd.help=1';
    const app = new MarkdownUp(window);
    await app.run();
    t.is(window.document.title, 'MarkdownUp');
    t.true(window.document.body.innerHTML.startsWith(
        '<h1 id="cmd.help=1&amp;type_MarkdownUp">struct MarkdownUp</h1>'
    ));
    t.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-font-size', '12pt'],
        ['--markdown-model-line-height', `1.2em`]
    ]);

    window.location.hash = '#cmd.help=1&fontSize=14&lineHeight=1.4';
    documentElementStyleSetPropertyCalls.length = 0;
    await app.render();
    t.is(window.document.title, 'MarkdownUp');
    t.true(window.document.body.innerHTML.startsWith(
        '<h1 id="cmd.help=1&amp;fontSize=14&amp;lineHeight=1.4&amp;type_MarkdownUp">struct MarkdownUp</h1>'
    ));
    t.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-font-size', '14pt'],
        ['--markdown-model-line-height', `1.4em`]
    ]);
});


test('MarkdownUp, render bad params', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    const documentElementStyleSetPropertyCalls = [];
    window.document.documentElement.style.setProperty = (prop, val) => documentElementStyleSetPropertyCalls.push([prop, val]);

    window.location.hash = '#unknown=bad';
    const app = new MarkdownUp(window);
    await app.render();
    t.is(window.document.title, 'MarkdownUp');
    t.is(window.document.body.innerHTML, "<p>Error: Unknown member 'unknown'</p>");
    t.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-font-size', '12pt'],
        ['--markdown-model-line-height', `1.2em`]
    ]);
});


test('MarkdownUp, render timeout', async (t) => {
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
        t.is(timeoutId, windowTimeout.id);
        windowTimeout.callback = null;
        windowTimeout.delay = null;
    };

    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
function main()
    setGlobal('count', count + 1)
    markdownPrint('Hello ' + count)
    if(count == 2, setWindowTimeout(main, 2000))
endfunction

count = 0
setWindowTimeout(main, 1000)
main()
~~~
`
    });
    window.location.hash = '#menu=1';
    await app.render();
    t.is(windowTimeout.delay, 1000);
    t.is(app.runtimeTimeoutId, 1);
    t.is(window.document.title, '');
    t.true(window.document.body.innerHTML.startsWith('<div id="menu=1" style="display=none"></div><p>Hello 1</p>'));

    // Render again to test clearing the runtime timeout ID
    window.location.hash = '#';
    await app.render();
    t.is(windowTimeout.delay, 1000);
    t.is(app.runtimeTimeoutId, 2);
    t.is(window.document.title, '');
    t.true(window.document.body.innerHTML.startsWith('<p>Hello 1</p>'));

    // Call the timeout callback
    windowTimeout.callback();
    t.is(windowTimeout.delay, 2000);
    t.is(app.runtimeTimeoutId, 3);
    t.is(window.document.title, '');
    t.true(window.document.body.innerHTML.startsWith('<p>Hello 1</p>'));
    t.true(window.document.body.innerHTML.endsWith('<p>Hello 2</p>'));

    // Call the timeout callback again
    windowTimeout.callback();
    t.is(windowTimeout.delay, null);
    t.is(app.runtimeTimeoutId, null);
    t.is(window.document.title, '');
    t.true(window.document.body.innerHTML.startsWith('<p>Hello 1</p>'));
    t.true(window.document.body.innerHTML.endsWith('<p>Hello 3</p>'));
});


test('MarkdownUp, render resize', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    // Patch window.addEventListener and window.removeEventListener
    const eventListener = {'resize': null};
    window.addEventListener = (type, callback) => {
        eventListener[type] = callback;
    };
    window.removeEventListener = (type, callback) => {
        t.is(type, 'resize');
        t.is(callback, eventListener[type]);
        eventListener[type] = null;
    };

    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
function main()
    setGlobal('count', count + 1)
    markdownPrint('Hello ' + count)
endfunction

count = 0
setWindowResize(main)
main()
~~~
`
    });
    window.location.hash = '#menu=1';
    await app.render();
    t.is(typeof eventListener.resize, 'function');
    t.is(typeof app.runtimeWindowResize, 'function');
    t.is(window.document.title, '');
    t.true(window.document.body.innerHTML.startsWith('<div id="menu=1" style="display=none"></div><p>Hello 1</p>'));

    // Render again to test clearing the runtime resize event handler
    window.location.hash = '#';
    await app.render();
    t.is(typeof eventListener.resize, 'function');
    t.is(typeof app.runtimeWindowResize, 'function');
    t.is(window.document.title, '');
    t.true(window.document.body.innerHTML.startsWith('<p>Hello 1</p>'));

    // Call the resize callback
    eventListener.resize();
    t.is(typeof eventListener.resize, 'function');
    t.is(typeof app.runtimeWindowResize, 'function');
    t.is(window.document.title, '');
    t.true(window.document.body.innerHTML.startsWith('<p>Hello 1</p>'));
    t.true(window.document.body.innerHTML.endsWith('<p>Hello 2</p>'));
});


test('MarkdownUp, render focus', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
function main()
    setGlobal('count', count + 1)
    documentReset()
    elementModelRender(objectNew( \
        'html', 'input', \
        'attr', objectNew( \
            'id', 'test-input', \
            'type', 'text', \
            'value', 'Text ' + count \
        ), \
        'callback', objectNew('click', main) \
    ))
    setDocumentFocus('test-input')
endfunction

count = 0
main()
~~~
`
    });
    window.location.hash = '#';
    await app.render();
    t.is(window.document.title, '');
    t.true(window.document.body.innerHTML.startsWith('<input id="test-input" type="text" value="Text 1">'));

    let testInput = window.document.getElementById('test-input');
    t.is(testInput.value, 'Text 1');
    t.is(testInput.selectionStart, 6);
    t.is(testInput.selectionEnd, 6);

    testInput.click();
    t.is(window.document.title, '');
    t.true(window.document.body.innerHTML.startsWith('<input id="test-input" type="text" value="Text 2">'));

    testInput = window.document.getElementById('test-input');
    t.is(testInput.value, 'Text 2');
    t.is(testInput.selectionStart, 6);
    t.is(testInput.selectionEnd, 6);
});


test('MarkdownUp, render location', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
setWindowLocation('#url=other')
~~~
`
    });
    window.location.hash = '#';
    await app.render();
    t.is(window.document.title, '');
    t.true(window.document.body.innerHTML.startsWith('<div class="menu-burger">'));
    t.is(window.location.href, `${jsdomURL}#url=other`);
});


test('MarkdownUp, render location callback', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
function onClick()
    documentReset()
    markdownPrint('Hello')
    setWindowLocation('#url=other')
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
    t.is(window.document.title, '');
    t.true(window.document.body.innerHTML.startsWith('<span id="test-span">Click Here</span>'));
    t.is(window.location.href, `${jsdomURL}#`);

    const testSpan = window.document.getElementById('test-span');
    testSpan.click();

    t.is(window.document.title, '');
    t.true(window.document.body.innerHTML.startsWith('<p>Hello</p>'));
    t.is(window.location.href, `${jsdomURL}#url=other`);
});


test('MarkdownUp, render location hash', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': ''});
    window.location.hash = '#myid';
    await app.render();
    t.is(window.document.title, '');
    t.true(window.document.body.innerHTML.startsWith('<div class="menu-burger">'));
    t.is(window.location.href, `${jsdomURL}#myid`);
});


test('MarkdownUp, render title', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
setDocumentTitle('Hello')
markdownPrint('Hello')
~~~
`
    });
    window.location.hash = '#';
    await app.render();
    t.is(window.document.title, 'Hello');
    t.true(window.document.body.innerHTML.startsWith('<p>Hello</p>'));
});


test('MarkdownUp, render title callback', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {
        'markdownText': `\
~~~ markdown-script
function onClick()
    setDocumentTitle('Hello')
    documentReset()
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
    t.is(window.document.title, '');
    t.true(window.document.body.innerHTML.startsWith('<span id="test-span">Click Here</span>'));

    const testSpan = window.document.getElementById('test-span');
    testSpan.click();

    t.is(window.document.title, 'Hello');
    t.true(window.document.body.innerHTML.startsWith('<p>Hello</p>'));
});


test('MarkdownUp.main, help', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window);
    app.updateParams('cmd.help=1');
    const result = await app.main();
    t.deepEqual(
        result.elements[0][0][0],
        {'html': 'h1', 'attr': {'id': 'cmd.help=1&type_MarkdownUp'}, 'elem': {'text': 'struct MarkdownUp'}}
    );
    result.elements[0] = '<helpElements>';
    t.deepEqual(
        result,
        {
            'title': 'MarkdownUp',
            'elements': [
                '<helpElements>',
                [
                    menuBurgerElements({'menuURL': '#cmd.help=1&menu=1'}),
                    null
                ]
            ]
        }
    );
});


test('MarkdownUp.main', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
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
                null,
                [
                    {'html': 'h1', 'attr': {'id': 'hello'}, 'elem': [{'text': 'Hello'}]}
                ],
                [
                    menuBurgerElements(),
                    null
                ]
            ]
        }
    );
});


test('MarkdownUp.main, url', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchResolve = (url) => {
        t.is(url, 'sub/other.md');
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
    t.deepEqual(
        await app.main(),
        {
            'title': 'Hello',
            'elements': [
                {'html': 'div', 'attr': {'id': 'url=sub%2Fother.md', 'style': 'display=none'}},
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
                ],
                [
                    menuBurgerElements({'menuURL': '#menu=1&url=sub%2Fother.md'}),
                    null
                ]
            ]
        }
    );
});


test('MarkdownUp.main, fontSize', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': `\
~~~ markdown-script
markdownPrint('fontSize = ' + numberToFixed(getDocumentFontSize()))
~~~
`});
    app.updateParams('fontSize=14');
    t.deepEqual(
        await app.main(),
        {
            'title': null,
            'elements': [
                {'html': 'div', 'attr': {'id': 'fontSize=14', 'style': 'display=none'}},
                [
                    [
                        [
                            {'html': 'p', 'elem': [{'text': 'fontSize = 18.67'}]}
                        ]
                    ]
                ],
                [
                    menuBurgerElements({'menuURL': '#fontSize=14&menu=1'}),
                    null
                ]
            ]
        }
    );
});


test('MarkdownUp.main, fetch script', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchResolve = (url) => {
        t.is(url, 'README.md');
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
markdownPrint(fetch('README.md', null, true))
~~~
`
    });
    app.updateParams('');
    t.deepEqual(
        await app.main(),
        {
            'title': null,
            'elements': [
                null,
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
                ],
                [
                    menuBurgerElements(),
                    null
                ]
            ]
        }
    );
});


test('MarkdownUp.main, fetch error', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchResolve = (url) => {
        t.is(url, 'README.md');
        return {'ok': false, 'statusText': 'Not Found'};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('');
    t.deepEqual(
        await app.main(),
        {
            'title': 'MarkdownUp',
            'elements': {
                'html': 'p',
                'elem': {'text': 'Error: Could not fetch "README.md" - "Not Found"'}
            }
        }
    );
});


test('MarkdownUp.main, fetch error no status text', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchResolve = (url) => {
        t.is(url, 'README.md');
        return {'ok': false, 'statusText': ''};
    };
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('');
    t.deepEqual(
        await app.main(),
        {
            'title': 'MarkdownUp',
            'elements': {
                'html': 'p',
                'elem': {'text': 'Error: Could not fetch "README.md"'}
            }
        }
    );
});


test('MarkdownUp.main, no title', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': 'Hello'});
    app.updateParams('');
    t.deepEqual(
        await app.main(),
        {
            'title': null,
            'elements': [
                null,
                [
                    {'html': 'p', 'elem': [{'text': 'Hello'}]}
                ],
                [
                    menuBurgerElements(),
                    null
                ]
            ]
        }
    );
});


test('MarkdownUp.main, menu', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': 'Hello'});
    app.updateParams('menu=1');
    t.deepEqual(
        await app.main(),
        {
            'title': null,
            'elements': [
                {'html': 'div', 'attr': {'id': 'menu=1', 'style': 'display=none'}},
                [
                    {'html': 'p', 'elem': [{'text': 'Hello'}]}
                ],
                [
                    menuBurgerElements({'menuURL': '#'}),
                    menuElements()
                ]
            ]
        }
    );
});


test('MarkdownUp.main, no menu', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': 'Hello', 'menu': false});
    app.updateParams('menu=1');
    t.deepEqual(
        await app.main(),
        {
            'title': null,
            'elements': [
                {'html': 'div', 'attr': {'id': 'menu=1', 'style': 'display=none'}},
                [
                    {'html': 'p', 'elem': [{'text': 'Hello'}]}
                ],
                null
            ]
        }
    );
});


test('MarkdownUp.main, menu cycle and toggle', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': 'Hello'});
    app.updateParams('menu=1&fontSize=18&cmd.markdown=1');
    t.deepEqual(
        await app.main(),
        {
            'title': null,
            'elements': [
                {'html': 'div', 'attr': {'class': 'markdown'}, 'elem': {'text': 'Hello'}},
                [
                    menuBurgerElements({'menuURL': '#cmd.markdown=1&fontSize=18'}),
                    menuElements({
                        'fontSizeURL': '#cmd.markdown=1&fontSize=8&menu=1',
                        'lineHeightURL': '#cmd.markdown=1&fontSize=18&lineHeight=1.4&menu=1',
                        'markdownURL': '#fontSize=18&menu=1',
                        'helpURL': '#cmd.help=1&fontSize=18&menu=1'
                    })
                ]
            ]
        }
    );
});


test('MarkdownUp.main, markdown', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': 'Hello'});
    app.updateParams('cmd.markdown=1');
    t.deepEqual(
        await app.main(),
        {
            'title': null,
            'elements': [
                {'html': 'div', 'attr': {'class': 'markdown'}, 'elem': {'text': 'Hello'}},
                [
                    menuBurgerElements({'menuURL': '#cmd.markdown=1&menu=1'}),
                    null
                ]
            ]
        }
    );
});


test('MarkdownUp.main, markdown-script', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': `\
# markdown-script

~~~ markdown-script
markdownPrint('Hello')
~~~
`});
    app.updateParams('');
    t.deepEqual(
        await app.main(),
        {
            'title': 'markdown-script',
            'elements': [
                null,
                [
                    {'html': 'h1', 'attr': {'id': 'markdown-script'}, 'elem': [{'text': 'markdown-script'}]},
                    [
                        [
                            {'html': 'p', 'elem': [{'text': 'Hello'}]}
                        ]
                    ]
                ],
                [
                    menuBurgerElements(),
                    null
                ]
            ]
        }
    );
});


test('MarkdownUp.main, markdown-script debug', async (t) => {
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
debugLog('Hello')
~~~
`});
    app.updateParams('debug=1');
    t.deepEqual(
        await app.main(),
        {
            'title': 'markdown-script',
            'elements': [
                {'html': 'div', 'attr': {'id': 'debug=1', 'style': 'display=none'}},
                [
                    {'html': 'h1', 'attr': {'id': 'debug=1&markdown-script'}, 'elem': [{'text': 'markdown-script'}]},
                    null
                ],
                [
                    menuBurgerElements({'menuURL': '#debug=1&menu=1'}),
                    null
                ]
            ]
        }
    );
    t.is(logs.length, 2);
    t.deepEqual(logs.filter((message) => !message.startsWith('Script executed in ')), ['Hello']);
});


test('MarkdownUp.main, markdown-script debug warnings', async (t) => {
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
~~~
`});
    app.updateParams('debug=1');
    t.deepEqual(
        await app.main(),
        {
            'title': 'markdown-script',
            'elements': [
                {'html': 'div', 'attr': {'id': 'debug=1', 'style': 'display=none'}},
                [
                    {'html': 'h1', 'attr': {'id': 'debug=1&markdown-script'}, 'elem': [{'text': 'markdown-script'}]},
                    null,
                    null
                ],
                [
                    menuBurgerElements({'menuURL': '#debug=1&menu=1'}),
                    null
                ]
            ]
        }
    );
    t.is(logs.length, 6);
    t.deepEqual(logs.filter((message) => !message.startsWith('Script executed in ')), [
        'Warnings for the script at line number 4:',
        '    Empty script',
        'Warnings for the script at line number 7:',
        '    Empty script'
    ]);
});


test('MarkdownUp.main, markdown-script variables', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': `\
~~~ markdown-script
markdownPrint('varName = ' + varName)
~~~
`});
    app.updateParams('var.varName=5');
    t.deepEqual(
        await app.main(),
        {
            'title': null,
            'elements': [
                {'html': 'div', 'attr': {'id': 'var.varName=5', 'style': 'display=none'}},
                [
                    [
                        [
                            {'html': 'p', 'elem': [{'text': 'varName = 5'}]}
                        ]
                    ]
                ],
                [
                    menuBurgerElements({'menuURL': '#menu=1&var.varName=5'}),
                    null
                ]
            ]
        }
    );
});


test('MarkdownUp.main, markdown-script runtime error', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window, {'markdownText': `\
~~~ markdown-script
foobar()
~~~
`});
    app.updateParams('');
    t.deepEqual(
        await app.main(),
        {
            'title': null,
            'elements': [
                null,
                [
                    [
                        null,
                        {'html': 'pre', 'elem': {'text': 'Undefined function "foobar"'}}
                    ]
                ],
                [
                    menuBurgerElements(),
                    null
                ]
            ]
        }
    );
});
