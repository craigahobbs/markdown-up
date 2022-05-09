// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/* eslint-disable id-length */

import {ElementApplication} from 'element-app/lib/app.js';
import {JSDOM} from 'jsdom/lib/api.js';
import {MarkdownUp} from '../lib/app.js';
import {encodeQueryString} from 'schema-markdown/lib/encode.js';
import {schemaMarkdownDoc} from 'schema-markdown-doc/lib/schemaMarkdownDoc.js';
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
    t.is(app.setNavigateTimeoutId, null);
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
    t.is(app.setNavigateTimeoutId, null);
});


test('MarkdownUp.preRender', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});

    const documentElementStyleSetPropertyCalls = [];
    window.document.documentElement.style.setProperty = (prop, val) => documentElementStyleSetPropertyCalls.push([prop, val]);

    window.location.hash = '#cmd.help=1';
    const app = new MarkdownUp(window);
    await app.render();
    t.is(window.document.title, '');
    t.true(window.document.body.innerHTML.startsWith(
        '<h1 id="cmd.help=1&amp;type_MarkdownUp">MarkdownUp</h1>'
    ));
    t.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-font-size', '12pt'],
        ['--markdown-model-line-height', `1.2em`]
    ]);

    window.location.hash = '#cmd.help=1&fontSize=14&lineHeight=1.4';
    documentElementStyleSetPropertyCalls.length = 0;
    await app.render();
    t.is(window.document.title, '');
    t.true(window.document.body.innerHTML.startsWith(
        '<h1 id="cmd.help=1&amp;fontSize=14&amp;lineHeight=1.4&amp;type_MarkdownUp">MarkdownUp</h1>'
    ));
    t.deepEqual(documentElementStyleSetPropertyCalls, [
        ['--markdown-model-font-size', '14pt'],
        ['--markdown-model-line-height', `1.4em`]
    ]);
});


test('MarkdownUp.main, help', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const app = new MarkdownUp(window);
    app.updateParams('cmd.help=1');
    t.deepEqual(
        ElementApplication.validateMain(await app.main()),
        {
            'title': null,
            'elements': [
                schemaMarkdownDoc(app.hashTypes, app.hashType, {'params': encodeQueryString(app.params)}),
                null,
                null,
                menuBurgerElements({'menuURL': '#cmd.help=1&menu=1'}),
                null
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
        ElementApplication.validateMain(await app.main()),
        {
            'title': 'Hello',
            'elements': [
                null,
                null,
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
        ElementApplication.validateMain(await app.main()),
        {
            'title': 'Hello',
            'elements': [
                null,
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
                menuBurgerElements({'menuURL': '#menu=1&url=sub%2Fother.md'}),
                null
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
    let errorMessage = null;
    try {
        await app.main();
    } catch ({message}) { /* c8 ignore next */
        errorMessage = message;
    }
    t.is(errorMessage, 'Could not fetch "README.md", "Not Found"');
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
    let errorMessage = null;
    try {
        await app.main();
    } catch ({message}) { /* c8 ignore next */
        errorMessage = message;
    }
    t.is(errorMessage, 'Could not fetch "README.md"');
});


test('MarkdownUp.main, no title', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
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
        ElementApplication.validateMain(await app.main()),
        {
            'title': null,
            'elements': [
                null,
                null,
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
    const {window} = new JSDOM('', {'url': jsdomURL});
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
        ElementApplication.validateMain(await app.main()),
        {
            'title': null,
            'elements': [
                null,
                {'html': 'div', 'attr': {'id': 'menu=1', 'style': 'display=none'}},
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
    const {window} = new JSDOM('', {'url': jsdomURL});
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
        ElementApplication.validateMain(await app.main()),
        {
            'title': null,
            'elements': [
                null,
                {'html': 'div', 'attr': {'id': 'menu=1', 'style': 'display=none'}},
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
    const {window} = new JSDOM('', {'url': jsdomURL});
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
        ElementApplication.validateMain(await app.main()),
        {
            'title': null,
            'elements': [
                {'html': 'div', 'attr': {'class': 'markdown'}, 'elem': {'text': 'Hello'}},
                null,
                null,
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
    const {window} = new JSDOM('', {'url': jsdomURL});
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
        ElementApplication.validateMain(await app.main()),
        {
            'title': null,
            'elements': [
                {'html': 'div', 'attr': {'class': 'markdown'}, 'elem': {'text': 'Hello'}},
                null,
                null,
                menuBurgerElements({'menuURL': '#cmd.markdown=1&menu=1'}),
                null
            ]
        }
    );
});


test('markdown-bar-chart', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchResolve = () => ({'ok': true, 'text': () => new Promise((resolve) => {
        resolve(`\
# Bar Chart

~~~ bar-chart
~~~
`);
    })});
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('');
    t.deepEqual(
        ElementApplication.validateMain(await app.main()),
        {
            'title': 'Bar Chart',
            'elements': [
                null,
                null,
                [
                    {'html': 'h1', 'attr': {'id': 'bar-chart'}, 'elem': [{'text': 'Bar Chart'}]},
                    {'html': 'p', 'elem': {'html': 'pre', 'elem': {'text': "Error: Required member 'data' missing"}}}
                ],
                menuBurgerElements(),
                null
            ]
        }
    );
});


test('markdown-line-chart', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchResolve = () => ({'ok': true, 'text': () => new Promise((resolve) => {
        resolve(`\
# Line Chart

~~~ line-chart
~~~
`);
    })});
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('');
    t.deepEqual(
        ElementApplication.validateMain(await app.main()),
        {
            'title': 'Line Chart',
            'elements': [
                null,
                null,
                [
                    {'html': 'h1', 'attr': {'id': 'line-chart'}, 'elem': [{'text': 'Line Chart'}]},
                    {'html': 'p', 'elem': {'html': 'pre', 'elem': {'text': "Error: Required member 'data' missing"}}}
                ],
                menuBurgerElements(),
                null
            ]
        }
    );
});


test('markdown-data-table', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchResolve = () => ({'ok': true, 'text': () => new Promise((resolve) => {
        resolve(`\
# Data Table

~~~ data-table
~~~
`);
    })});
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('');
    t.deepEqual(
        ElementApplication.validateMain(await app.main()),
        {
            'title': 'Data Table',
            'elements': [
                null,
                null,
                [
                    {'html': 'h1', 'attr': {'id': 'data-table'}, 'elem': [{'text': 'Data Table'}]},
                    {'html': 'p', 'elem': {'html': 'pre', 'elem': {'text': "Error: Required member 'data' missing"}}}
                ],
                menuBurgerElements(),
                null
            ]
        }
    );
});


test('markdown-script', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchResolve = () => ({'ok': true, 'text': () => new Promise((resolve) => {
        resolve(`\
# markdown-script

~~~ markdown-script
log('Hello')
~~~
`);
    })});
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('');
    t.deepEqual(
        ElementApplication.validateMain(await app.main()),
        {
            'title': 'markdown-script',
            'elements': [
                null,
                null,
                [
                    {'html': 'h1', 'attr': {'id': 'markdown-script'}, 'elem': [{'text': 'markdown-script'}]},
                    []
                ],
                menuBurgerElements(),
                null
            ]
        }
    );
});


test('markdown-script debug', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchResolve = () => ({'ok': true, 'text': () => new Promise((resolve) => {
        resolve(`\
# markdown-script

~~~ markdown-script
log('Hello')
~~~
`);
    })});
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('debug=1');
    t.deepEqual(
        ElementApplication.validateMain(await app.main()),
        {
            'title': 'markdown-script',
            'elements': [
                null,
                {'html': 'div', 'attr': {'id': 'debug=1', 'style': 'display=none'}},
                [
                    {'html': 'h1', 'attr': {'id': 'debug=1&markdown-script'}, 'elem': [{'text': 'markdown-script'}]},
                    []
                ],
                menuBurgerElements({'menuURL': '#debug=1&menu=1'}),
                null
            ]
        }
    );
});


test('markdown-script variables', async (t) => {
    const {window} = new JSDOM('', {'url': jsdomURL});
    const fetchResolve = () => ({'ok': true, 'text': () => new Promise((resolve) => {
        resolve(`\
# Data Table

~~~ data-table
~~~
`);
    })});
    window.fetch = (url) => new Promise((resolve) => {
        resolve(fetchResolve(url));
    });
    const app = new MarkdownUp(window);
    app.updateParams('var.varName=5');
    t.deepEqual(
        ElementApplication.validateMain(await app.main()),
        {
            'title': 'Data Table',
            'elements': [
                null,
                {'html': 'div', 'attr': {'id': 'var.varName=5', 'style': 'display=none'}},
                [
                    {'html': 'h1', 'attr': {'id': 'var.varName=5&data-table'}, 'elem': [{'text': 'Data Table'}]},
                    {'html': 'p', 'elem': {'html': 'pre', 'elem': {'text': "Error: Required member 'data' missing"}}}
                ],
                menuBurgerElements({'menuURL': '#menu=1&var.varName=5'}),
                null
            ]
        }
    );
});
