// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import {JSDOM} from 'jsdom/lib/api.js';
import {MarkdownScriptRuntime} from '../lib/script.js';
import test from 'ava';


/* eslint-disable id-length, max-len */


// Generic test runtime options
const testRuntimeOptions = () => {
    const {window} = new JSDOM('', {'url': 'https://github.com/craigahobbs/markdown-up'});
    return {
        'fontSize': 12,
        'urlFn': (url) => (url.startsWith('/') ? url : `/foo/${url}`),
        window
    };
};


test('script library, functions', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.deepEqual(
        Object.entries(globals).map(([fnName, fn]) => [fnName, typeof fn === 'function']),
        [
            ['documentReset', true],
            ['documentURL', true],
            ['getDocumentFontSize', true],
            ['getDocumentInputValue', true],
            ['getWindowHeight', true],
            ['getWindowWidth', true],
            ['setDocumentFocus', true],
            ['setDocumentTitle', true],
            ['setWindowLocation', true],
            ['setWindowResize', true],
            ['setWindowTimeout', true],
            ['drawArc', true],
            ['drawCircle', true],
            ['drawClose', true],
            ['drawEllipse', true],
            ['drawHLine', true],
            ['drawImage', true],
            ['drawLine', true],
            ['drawMove', true],
            ['drawOnClick', true],
            ['drawRect', true],
            ['drawStyle', true],
            ['drawText', true],
            ['drawTextStyle', true],
            ['drawVLine', true],
            ['getDrawingHeight', true],
            ['getDrawingWidth', true],
            ['getTextHeight', true],
            ['getTextWidth', true],
            ['setDrawingSize', true],
            ['elementModelRender', true],
            ['localStorageClear', true],
            ['localStorageGet', true],
            ['localStorageSet', true],
            ['localStorageRemove', true],
            ['markdownEscape', true],
            ['markdownHeaderId', true],
            ['markdownParse', true],
            ['markdownPrint', true],
            ['markdownTitle', true],
            ['schemaParse', true],
            ['schemaPrint', true],
            ['schemaTypeModel', true],
            ['schemaValidate', true],
            ['schemaValidateTypeModel', true],
            ['sessionStorageClear', true],
            ['sessionStorageGet', true],
            ['sessionStorageSet', true],
            ['sessionStorageRemove', true]
        ]
    );
});


//
// Document functions
//


test('script library, documentReset', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(runtime.isDocumentReset, false);
    t.is(globals.documentReset([], runtime.options), undefined);
    t.is(runtime.isDocumentReset, true);
});


test('script library, documentURL', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(globals.documentURL(['/foo/bar/'], runtime.options), '/foo/bar/');
    t.is(globals.documentURL(['bar/'], runtime.options), '/foo/bar/');
});


test('script library, getDocumentFontSize', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(globals.getDocumentFontSize([], runtime.options), 16);
});


test('script library, getDocumentInputValue', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(globals.getDocumentInputValue(['test-input'], runtime.options), null);
    runtime.options.window.document.body.innerHTML = '<div id="test-input"/>';
    t.is(globals.getDocumentInputValue(['test-input'], runtime.options), null);
    runtime.options.window.document.body.innerHTML = '<input id="test-input" type="text" value="The text"/>';
    t.is(globals.getDocumentInputValue(['test-input'], runtime.options), 'The text');
});


test('script library, getWindowHeight', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(globals.getWindowHeight([], runtime.options), 768);
});


test('script library, getWindowWidth', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(globals.getWindowWidth([], runtime.options), 1024);
});


test('script library, setDocumentFocus', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(runtime.documentFocus, null);
    globals.setDocumentFocus(['test-input'], runtime.options);
    t.is(runtime.documentFocus, 'test-input');
});


test('script library, setDocumentTitle', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(runtime.documentTitle, null);
    globals.setDocumentTitle(['The Title'], runtime.options);
    t.is(runtime.documentTitle, 'The Title');
});


test('script library, setWindowLocation', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(runtime.windowLocation, null);
    globals.setWindowLocation(['/other'], runtime.options);
    t.is(runtime.windowLocation, '/other');
    globals.setWindowLocation(['other'], runtime.options);
    t.is(runtime.windowLocation, '/foo/other');
});


test('script library, setWindowResize', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    t.is(runtime.windowResize, null);
    t.is(runtime.options.statementCount, undefined);

    let onsizeCount = 0;
    const onsize = () => ++onsizeCount;
    globals.setWindowResize([onsize], runtime.options);

    t.is(typeof runtime.windowResize, 'function');
    t.is(runtime.options.statementCount, undefined);
    t.is(runtimeUpdateCount, 0);
    t.is(onsizeCount, 0);

    runtime.windowResize();
    t.is(runtime.options.statementCount, 0);
    t.is(runtimeUpdateCount, 1);
    t.is(onsizeCount, 1);
});


test('script library, setWindowTimeout', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    t.is(runtime.windowTimeout, null);
    t.is(runtime.options.statementCount, undefined);

    let ontimeCount = 0;
    const ontime = () => ++ontimeCount;
    globals.setWindowTimeout([ontime, 1000], runtime.options);

    t.is(typeof runtime.windowTimeout[0], 'function');
    t.is(runtime.windowTimeout[1], 1000);
    t.is(runtime.options.statementCount, undefined);
    t.is(runtimeUpdateCount, 0);
    t.is(ontimeCount, 0);

    runtime.windowTimeout[0]();
    t.is(runtime.options.statementCount, 0);
    t.is(runtimeUpdateCount, 1);
    t.is(ontimeCount, 1);
});


//
// Drawing functions
//


test('script library, drawArc', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    globals.setDrawingSize([100, 50], runtime.options);
    globals.drawMove([0, 25], runtime.options);
    globals.drawArc([25, 25, 0, 0, 0, 50, 25], runtime.options);
    globals.drawArc([25, 25, 0, 1, 1, 100, 25], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 100, 'height': 50},
                'elem': [
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 0.00000000 25.00000000 A 25.00000000 25.00000000 0.00000000 0 0 50.00000000 25.00000000 A 25.00000000 25.00000000 0.00000000 1 1 100.00000000 25.00000000',
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': 1
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawCircle', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    globals.setDrawingSize([50, 50], runtime.options);
    globals.drawCircle([25, 25, 25], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'circle',
                        'attr': {
                            'cx': 25,
                            'cy': 25,
                            'r': 25,
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': '1.00000000'
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawClose', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    globals.setDrawingSize([50, 50], runtime.options);
    globals.drawMove([0, 0], runtime.options);
    globals.drawLine([50, 0], runtime.options);
    globals.drawLine([50, 50], runtime.options);
    globals.drawClose([], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 0.00000000 0.00000000 L 50.00000000 0.00000000 L 50.00000000 50.00000000 Z',
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': 1
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawEllipse', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    globals.setDrawingSize([50, 40], runtime.options);
    globals.drawEllipse([25, 20, 25, 20], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 40},
                'elem': [
                    {
                        'svg': 'ellipse',
                        'attr': {
                            'cx': 25,
                            'cy': 20,
                            'rx': 25,
                            'ry': 20,
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': '1.00000000'
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawHLine', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    globals.setDrawingSize([50, 50], runtime.options);
    globals.drawMove([0, 25], runtime.options);
    globals.drawHLine([50], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 0.00000000 25.00000000 H 50.00000000',
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': 1
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawImage', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    globals.setDrawingSize([50, 50], runtime.options);
    globals.drawImage([15, 15, 25, 25, '/foo/bar.jpg'], runtime.options);
    globals.drawImage([35, 35, 25, 25, 'bar.jpg'], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'image',
                        'attr': {
                            'height': 25,
                            'href': '/foo/bar.jpg',
                            'width': 25,
                            'x': 15,
                            'y': 15
                        }
                    },
                    {
                        'svg': 'image',
                        'attr': {
                            'height': 25,
                            'href': '/foo/bar.jpg',
                            'width': 25,
                            'x': 35,
                            'y': 35
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawLine', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    globals.setDrawingSize([50, 50], runtime.options);
    globals.drawMove([0, 0], runtime.options);
    globals.drawLine([50, 0], runtime.options);
    globals.drawLine([50, 50], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 0.00000000 0.00000000 L 50.00000000 0.00000000 L 50.00000000 50.00000000',
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': 1
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawMove', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    globals.setDrawingSize([50, 50], runtime.options);
    globals.drawMove([0, 0], runtime.options);
    globals.drawLine([50, 0], runtime.options);
    globals.drawMove([0, 50], runtime.options);
    globals.drawLine([50, 50], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 0.00000000 0.00000000 L 50.00000000 0.00000000 M 0.00000000 50.00000000 L 50.00000000 50.00000000',
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': 1
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawOnClick', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    // Test click handler function
    let clickCount = 0;
    const clickHandler = ([x, y], options) => {
        t.is(x, 5);
        t.is(y, 10);
        t.is(options.fontSize, 12);
        clickCount += 1;
    };

    // Mock element
    const elementEvents = {};
    const element = {
        'addEventListener': (eventType, eventCallback) => {
            elementEvents[eventType] = eventCallback;
        }
    };

    // Mock event
    const event = {
        'target': {
            'ownerSVGElement': {
                'getBoundingClientRect': () => ({'left': 0, 'top': 0})
            }
        },
        'clientX': 5,
        'clientY': 10
    };

    globals.setDrawingSize([50, 50], runtime.options);
    globals.drawRect([0, 0, 50, 50], runtime.options);
    globals.drawOnClick([clickHandler], runtime.options);

    const elements = runtime.resetElements();
    t.is(typeof elements[0].elem.elem[0].callback, 'function');
    elements[0].elem.elem[0].callback(element);
    t.is(typeof elementEvents.click, 'function');
    elementEvents.click(event);
    t.is(clickCount, 1);
    t.is(runtimeUpdateCount, 1);

    delete elements[0].elem.elem[0].callback;
    t.deepEqual(elements, [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': 0,
                            'y': 0,
                            'width': 50,
                            'height': 50,
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': '1.00000000'
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawOnClick drawing click', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    globals.setDrawingSize([50, 50], runtime.options);
    globals.drawOnClick([null], runtime.options);
    const elements = runtime.resetElements();
    t.is(typeof elements[0].elem.callback, 'function');
    delete elements[0].elem.callback;
    t.deepEqual(elements, [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': []
            }
        }
    ]);
});


test('script library, drawRect', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    globals.setDrawingSize([50, 50], runtime.options);
    globals.drawRect([0, 0, 50, 50, 5, 5], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'rect',
                        'attr': {
                            'x': 0,
                            'y': 0,
                            'width': 50,
                            'height': 50,
                            'rx': 5,
                            'ry': 5,
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': '1.00000000'
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawStyle', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();

    globals.setDrawingSize([50, 50], runtime.options);
    globals.drawMove([0, 0], runtime.options);
    globals.drawLine([50, 0], runtime.options);
    globals.drawStyle(['red'], runtime.options);
    globals.drawMove([50, 0], runtime.options);
    globals.drawLine([50, 50], runtime.options);
    globals.drawStyle(['red', 2], runtime.options);
    globals.drawMove([50, 50], runtime.options);
    globals.drawLine([0, 50], runtime.options);
    globals.drawStyle(['red', 2, 'blue'], runtime.options);
    globals.drawMove([0, 50], runtime.options);
    globals.drawLine([0, 0], runtime.options);
    globals.drawStyle(['red', 2, 'blue', '4 1'], runtime.options);
    globals.drawMove([0, 0], runtime.options);
    globals.drawLine([50, 50], runtime.options);

    t.is(runtime.drawingPathStroke, 'red');
    t.is(runtime.drawingPathStrokeWidth, 2);
    t.is(runtime.drawingPathFill, 'blue');
    t.is(runtime.drawingPathStrokeDashArray, '4 1');

    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 0.00000000 0.00000000 L 50.00000000 0.00000000',
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': 1
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 50.00000000 0.00000000 L 50.00000000 50.00000000',
                            'fill': 'none',
                            'stroke': 'red',
                            'stroke-dasharray': 'none',
                            'stroke-width': 1
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 50.00000000 50.00000000 L 0.00000000 50.00000000',
                            'fill': 'none',
                            'stroke': 'red',
                            'stroke-dasharray': 'none',
                            'stroke-width': 2
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 0.00000000 50.00000000 L 0.00000000 0.00000000',
                            'fill': 'blue',
                            'stroke': 'red',
                            'stroke-dasharray': 'none',
                            'stroke-width': 2
                        }
                    },
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 0.00000000 0.00000000 L 50.00000000 50.00000000',
                            'fill': 'blue',
                            'stroke': 'red',
                            'stroke-dasharray': '4 1',
                            'stroke-width': 2
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, drawStyle no drawing', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();

    t.is(runtime.drawingPathStroke, 'black');
    t.is(runtime.drawingPathStrokeWidth, 1);
    t.is(runtime.drawingPathFill, 'none');
    t.is(runtime.drawingPathStrokeDashArray, 'none');

    globals.drawStyle(['red', 2, 'blue', '4 1'], runtime.options);

    t.is(runtime.drawingPathStroke, 'red');
    t.is(runtime.drawingPathStrokeWidth, 2);
    t.is(runtime.drawingPathFill, 'blue');
    t.is(runtime.drawingPathStrokeDashArray, '4 1');

    globals.drawStyle([], runtime.options);

    t.is(runtime.drawingPathStroke, 'black');
    t.is(runtime.drawingPathStrokeWidth, 1);
    t.is(runtime.drawingPathFill, 'none');
    t.is(runtime.drawingPathStrokeDashArray, 'none');

    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 300, 'height': 200},
                'elem': []
            }
        }
    ]);
});


test('script library, drawText', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    globals.setDrawingSize([50, 50], runtime.options);
    globals.drawText(['Hello', 25, 15], runtime.options);
    globals.drawTextStyle([null, 'black', true, true], runtime.options);
    globals.drawText(['World!', 25, 35], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'text',
                        'attr': {
                            'x': 25,
                            'y': 15,
                            'dominant-baseline': 'middle',
                            'fill': 'black',
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.00000000',
                            'font-style': 'normal',
                            'font-weight': 'normal',
                            'text-anchor': 'middle'
                        },
                        'elem': {'text': 'Hello'}
                    },
                    {
                        'svg': 'text',
                        'attr': {
                            'x': 25,
                            'y': 35,
                            'dominant-baseline': 'middle',
                            'fill': 'black',
                            'font-family': 'Arial, Helvetica, sans-serif',
                            'font-size': '16.00000000',
                            'font-style': 'italic',
                            'font-weight': 'bold',
                            'text-anchor': 'middle'
                        },
                        'elem': {'text': 'World!'}
                    }
                ]
            }
        }
    ]);
});


test('script library, drawTextStyle', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();

    t.is(runtime.drawingFontSizePx, 16);
    t.is(runtime.drawingFontFill, 'black');
    t.is(runtime.drawingFontBold, false);
    t.is(runtime.drawingFontItalic, false);
    t.is(runtime.drawingFontFamily, 'Arial, Helvetica, sans-serif');

    globals.drawTextStyle([10, 'red', true, true, 'Comic Sans'], runtime.options);

    t.is(runtime.drawingFontSizePx, 10);
    t.is(runtime.drawingFontFill, 'red');
    t.is(runtime.drawingFontBold, true);
    t.is(runtime.drawingFontItalic, true);
    t.is(runtime.drawingFontFamily, 'Comic Sans');

    globals.drawTextStyle([], runtime.options);

    t.is(runtime.drawingFontSizePx, 16);
    t.is(runtime.drawingFontFill, 'black');
    t.is(runtime.drawingFontBold, false);
    t.is(runtime.drawingFontItalic, false);
    t.is(runtime.drawingFontFamily, 'Arial, Helvetica, sans-serif');

    t.deepEqual(runtime.resetElements(), null);
});


test('script library, drawVLine', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    globals.setDrawingSize([50, 50], runtime.options);
    globals.drawMove([25, 0], runtime.options);
    globals.drawVLine([50], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': [
                    {
                        'svg': 'path',
                        'attr': {
                            'd': 'M 25.00000000 0.00000000 V 50.00000000',
                            'fill': 'none',
                            'stroke': 'black',
                            'stroke-dasharray': 'none',
                            'stroke-width': 1
                        }
                    }
                ]
            }
        }
    ]);
});


test('script library, getDrawingHeight', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(globals.getDrawingHeight([], runtime.options), 200);
});


test('script library, getDrawingWidth', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(globals.getDrawingWidth([], runtime.options), 300);
});


test('script library, getTextHeight', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(Math.round(globals.getTextHeight(['Hello', 50], runtime.options) * 1000) / 1000, 16.667);
    t.is(globals.getTextHeight(['', 0], runtime.options), 16);
});


test('script library, getTextWidth', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(globals.getTextWidth(['Hello', 16], runtime.options), 48);
});


test('script library, setDrawingSize', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(globals.getDrawingWidth([], runtime.options), 300);
    t.is(globals.getDrawingHeight([], runtime.options), 200);
    t.is(runtime.resetElements(), null);
    globals.setDrawingSize([50, 50], runtime.options);
    t.is(globals.getDrawingWidth([], runtime.options), 50);
    t.is(globals.getDrawingHeight([], runtime.options), 50);
    t.deepEqual(runtime.resetElements(), [
        {
            'html': 'p',
            'elem': {
                'svg': 'svg',
                'attr': {'width': 50, 'height': 50},
                'elem': []
            }
        }
    ]);
});


//
// Element Model functions
//


test('script library, elementModelRender', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    const elements = [
        {'html': 'p', 'elem': {'text': 'Text 1'}},
        {'html': 'p', 'elem': {'text': 'Text 2'}}
    ];
    globals.elementModelRender([elements], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        [
            {'html': 'p', 'elem': {'text': 'Text 1'}},
            {'html': 'p', 'elem': {'text': 'Text 2'}}
        ]
    ]);
});


test('script library, elementModelRender callback', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    // Event handler function
    const eventHandlerCodes = [];
    const eventHandler = ([keyCode], options) => {
        t.not(options, null);
        eventHandlerCodes.push(keyCode);
    };

    const elementModel = [
        {
            'html': 'input',
            'attr': {
                'id': 'test-input',
                'type': 'text',
                'value': 'The text'
            },
            'callback': {
                'keyup': eventHandler
            }
        }
    ];
    globals.elementModelRender([elementModel], runtime.options);

    const elements = runtime.resetElements();
    const elementCallback = elements[0][0].callback;
    t.is(typeof elementCallback, 'function');
    delete elements[0][0].callback;
    t.deepEqual(elements, [
        [
            {
                'html': 'input',
                'attr': {
                    'id': 'test-input',
                    'type': 'text',
                    'value': 'The text'
                }
            }
        ]
    ]);

    // Mock element
    const mockElementEvents = {};
    const mockElement = {
        'addEventListener': (eventType, eventCallback) => {
            mockElementEvents[eventType] = eventCallback;
        }
    };

    elementCallback(mockElement);
    t.is(typeof mockElementEvents.keyup, 'function');

    // Mock event
    const mockEvent = {'keyCode': 13};

    mockElementEvents.keyup(mockEvent);

    t.deepEqual(eventHandlerCodes, [13]);
});


//
// Local storage functions
//


test('script library, localStorageClear', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    runtime.options.window.localStorage.setItem('foo', 'bar');
    t.is(runtime.options.window.localStorage.getItem('foo'), 'bar');
    globals.localStorageClear([], runtime.options);
    t.is(runtime.options.window.localStorage.getItem('foo'), null);
});


test('script library, localStorageGet', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(globals.localStorageGet(['foo'], runtime.options), null);
    runtime.options.window.localStorage.setItem('foo', 'bar');
    t.is(globals.localStorageGet(['foo'], runtime.options), 'bar');
});


test('script library, localStorageSet', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(runtime.options.window.localStorage.getItem('foo'), null);
    globals.localStorageSet(['foo', 'bar'], runtime.options);
    t.is(runtime.options.window.localStorage.getItem('foo'), 'bar');
});


test('script library, localStorageRemove', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    runtime.options.window.localStorage.setItem('foo', 'bar');
    t.is(runtime.options.window.localStorage.getItem('foo'), 'bar');
    globals.localStorageRemove(['foo'], runtime.options);
    t.is(runtime.options.window.localStorage.getItem('foo'), null);
});


//
// Markdown functions
//


test('script library, markdownEscape', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(globals.markdownEscape(['Hello*World!'], runtime.options), 'Hello\\*World!');
});


test('script library, markdownHeaderId', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(globals.markdownHeaderId(['Hello*World!'], runtime.options), 'hello-world');
});


test('script library, markdownParse', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.deepEqual(globals.markdownParse(['# Title', '', 'Hello'], runtime.options), {
        'parts': [
            {'paragraph': {'style': 'h1', 'spans': [{'text': 'Title'}]}},
            {'paragraph': {'spans': [{'text': 'Hello'}]}}
        ]
    });
});


test('script library, markdownPrint', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    globals.markdownPrint(['# Title', ['', 'Hello\n\nWorld!']], runtime.options);
    t.deepEqual(runtime.resetElements(), [
        [
            {
                'html': 'h1',
                'attr': {'id': 'foo/#title'},
                'elem': [
                    {'text': 'Title'}
                ]
            },
            {
                'html': 'p',
                'elem': [{'text': 'Hello'}]
            },
            {
                'html': 'p',
                'elem': [{'text': 'World!'}]
            }
        ]
    ]);
});


test('script library, markdownTitle', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    const markdownModel = globals.markdownParse(['# Title', '', 'Hello'], runtime.options);
    t.is(globals.markdownTitle([markdownModel], runtime.options), 'Title');
});


//
// Schema functions
//


test('script library, schemaParse', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.deepEqual(globals.schemaParse(['# My struct', 'struct MyStruct', ['', '  # An integer\n  int a']], runtime.options), {
        'MyStruct': {
            'struct': {
                'name': 'MyStruct',
                'doc': ['My struct'],
                'members': [
                    {
                        'name': 'a',
                        'doc': ['An integer'],
                        'type': {'builtin': 'int'}
                    }
                ]
            }
        }
    });
});


test('script library, schemaPrint', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    runtime.options.params = '';
    const globals = runtime.createGlobals();
    const types = globals.schemaParse(['# My struct', 'struct MyStruct', ['', '  # An integer\n  int a']], runtime.options);
    globals.schemaPrint([types, 'MyStruct'], runtime.options);
    const elements = runtime.resetElements();
    t.deepEqual(elements[0][0][0], {
        'html': 'h1',
        'attr': {'id': 'type_MyStruct'},
        'elem': {'text': 'struct MyStruct'}
    });
});


test('script library, schemaPrint action URLs', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    runtime.options.params = '';
    const globals = runtime.createGlobals();
    const types = globals.schemaParse(['# My action', 'action MyAction', '  urls', '  GET /'], runtime.options);
    globals.schemaPrint([types, 'MyAction', [{'method': 'POST', 'path': '/foo'}]], runtime.options);
    const elements = runtime.resetElements();
    t.deepEqual(elements[0][0][2][1][0].elem[1], {
        'html': 'a',
        'attr': {'href': '/foo'},
        'elem': {'text': 'POST /foo'}
    });
});


test('script library, schemaTypeModel', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.true('Types' in globals.schemaTypeModel([], runtime.options));
});

test('script library, schemaValidate', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    const types = globals.schemaParse(['# My struct', 'struct MyStruct', ['', '  # An integer\n  int a']], runtime.options);
    t.deepEqual(globals.schemaValidate([types, 'MyStruct', {'a': 5}], runtime.options), {'a': 5});
});


test('script library, schemaValidateTypeModel', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    const typeModel = globals.schemaTypeModel([], runtime.options);
    t.deepEqual(globals.schemaValidateTypeModel([typeModel], runtime.options), typeModel);
});


//
// Session storage functions
//


test('script library, sessionStorageClear', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    runtime.options.window.sessionStorage.setItem('foo', 'bar');
    t.is(runtime.options.window.sessionStorage.getItem('foo'), 'bar');
    globals.sessionStorageClear([], runtime.options);
    t.is(runtime.options.window.sessionStorage.getItem('foo'), null);
});


test('script library, sessionStorageGet', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(globals.sessionStorageGet(['foo'], runtime.options), null);
    runtime.options.window.sessionStorage.setItem('foo', 'bar');
    t.is(globals.sessionStorageGet(['foo'], runtime.options), 'bar');
});


test('script library, sessionStorageSet', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    t.is(runtime.options.window.sessionStorage.getItem('foo'), null);
    globals.sessionStorageSet(['foo', 'bar'], runtime.options);
    t.is(runtime.options.window.sessionStorage.getItem('foo'), 'bar');
});


test('script library, sessionStorageRemove', (t) => {
    const runtime = new MarkdownScriptRuntime(testRuntimeOptions());
    const globals = runtime.createGlobals();
    runtime.options.window.sessionStorage.setItem('foo', 'bar');
    t.is(runtime.options.window.sessionStorage.getItem('foo'), 'bar');
    globals.sessionStorageRemove(['foo'], runtime.options);
    t.is(runtime.options.window.sessionStorage.getItem('foo'), null);
});
