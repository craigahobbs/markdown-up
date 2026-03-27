// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import {JSDOM} from 'jsdom/lib/api.js';
import {MarkdownScriptRuntime} from '../lib/script.js';
import {strict as assert} from 'node:assert';
import {markdownScriptFunctions} from '../lib/scriptLibrary.js';
import test from 'node:test';


// Generic test runtime options
const testRuntime = () => {
    const {window} = new JSDOM('', {'url': 'https://github.com/craigahobbs/markdown-up'});
    const urlFn = (url) => (url.startsWith('/') ? url : `/foo/${url}`);
    const options = {
        'debug': true,
        'fontSize': 12,
        'markdownOptions': {
            'codeBlocks': {},
            urlFn,
            'headerIds': true,
            'usedHeaderIds': new Set()
        },
        urlFn,
        window
    };
    options.runtime = new MarkdownScriptRuntime(options);
    return options.runtime;
};


//
// Document functions
//


test('script library, documentFontSize', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.documentFontSize([], runtime.options), 16);
});


test('script library, documentInputValue', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.documentInputValue(['test-input'], runtime.options), null);
    runtime.options.window.document.body.innerHTML = '<div id="test-input"/>';
    assert.equal(markdownScriptFunctions.documentInputValue(['test-input'], runtime.options), null);
    runtime.options.window.document.body.innerHTML = '<input id="test-input" type="text" value="The text"/>';
    assert.equal(markdownScriptFunctions.documentInputValue(['test-input'], runtime.options), 'The text');
});


test('script library, documentSetFocus', () => {
    const runtime = testRuntime();
    assert.equal(runtime.documentFocus, null);
    markdownScriptFunctions.documentSetFocus(['test-input'], runtime.options);
    assert.equal(runtime.documentFocus, 'test-input');
});


test('script library, documentSetKeyDown', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    // Test keydown handler function
    const keyEvents = [];
    const keyHandler = ([event], options) => {
        assert.notEqual(options, null);
        keyEvents.push(event);
    };

    // Set the keydown handler
    assert.equal(runtime.documentKeyDown, null);
    markdownScriptFunctions.documentSetKeyDown([keyHandler], runtime.options);
    assert.equal(typeof runtime.documentKeyDown, 'function');
    assert.equal(runtime.documentKeyDown.constructor.name, 'AsyncFunction');

    // Create a mock event
    const mockEvent = {
        'key': 'a',
        'code': 'KeyA',
        'keyCode': 65,
        'ctrlKey': false,
        'altKey': false,
        'shiftKey': false,
        'metaKey': false,
        'repeat': false,
        'location': 0
    };

    // Trigger the keydown handler
    await runtime.documentKeyDown(mockEvent);
    assert.deepEqual(keyEvents, [
        {
            'key': 'a',
            'code': 'KeyA',
            'keyCode': 65,
            'ctrlKey': false,
            'altKey': false,
            'shiftKey': false,
            'metaKey': false,
            'repeat': false,
            'location': 0
        }
    ]);
    assert.equal(runtimeUpdateCount, 1);
});


test('script library, documentSetKeyDown async', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    // Test keydown handler function
    const keyEvents = [];
    // eslint-disable-next-line require-await
    const keyHandler = async ([event], options) => {
        assert.notEqual(options, null);
        keyEvents.push(event);
    };

    // Set the keydown handler
    assert.equal(runtime.documentKeyDown, null);
    markdownScriptFunctions.documentSetKeyDown([keyHandler], runtime.options);
    assert.equal(typeof runtime.documentKeyDown, 'function');
    assert.equal(runtime.documentKeyDown.constructor.name, 'AsyncFunction');

    // Create a mock event with different properties
    const mockEvent = {
        'key': 'Enter',
        'code': 'Enter',
        'keyCode': 13,
        'ctrlKey': true,
        'altKey': false,
        'shiftKey': true,
        'metaKey': false,
        'repeat': true,
        'location': 0
    };

    // Trigger the keydown handler
    await runtime.documentKeyDown(mockEvent);
    assert.deepEqual(keyEvents, [
        {
            'key': 'Enter',
            'code': 'Enter',
            'keyCode': 13,
            'ctrlKey': true,
            'altKey': false,
            'shiftKey': true,
            'metaKey': false,
            'repeat': true,
            'location': 0
        }
    ]);
    assert.equal(runtimeUpdateCount, 1);
});


test('script library, documentSetKeyDown callback error', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;
    const logs = [];
    runtime.options.logFn = (message) => logs.push(message);

    // Test keydown handler function that throws
    let keydownCount = 0;
    const keyHandler = ([_event], options) => {
        assert.notEqual(options, null);
        keydownCount += 1;
        throw new Error('BOOM!');
    };

    // Set the keydown handler
    assert.equal(runtime.documentKeyDown, null);
    markdownScriptFunctions.documentSetKeyDown([keyHandler], runtime.options);
    assert.equal(typeof runtime.documentKeyDown, 'function');
    assert.equal(runtime.documentKeyDown.constructor.name, 'AsyncFunction');

    // Create a mock event
    const mockEvent = {
        'key': 'a',
        'code': 'KeyA',
        'keyCode': 65,
        'ctrlKey': false,
        'altKey': false,
        'shiftKey': false,
        'metaKey': false,
        'repeat': false,
        'location': 0
    };

    // Trigger the keydown handler
    assert.equal(keydownCount, 0);
    assert.deepEqual(logs, []);
    await runtime.documentKeyDown(mockEvent);
    assert.equal(keydownCount, 1);
    assert.deepEqual(logs, ['MarkdownUp: Error executing documentSetKeyDown callback: BOOM!']);
    assert.equal(runtimeUpdateCount, 1);
});


test('script library, documentSetReset', () => {
    const runtime = testRuntime();
    assert.equal(runtime.documentReset, null);
    assert.equal(markdownScriptFunctions.documentSetReset(['resetID'], runtime.options), undefined);
    assert.equal(runtime.documentReset, 'resetID');
});


test('script library, documentSetTitle', () => {
    const runtime = testRuntime();
    assert.equal(runtime.documentTitle, null);
    markdownScriptFunctions.documentSetTitle(['The Title'], runtime.options);
    assert.equal(runtime.documentTitle, 'The Title');
});


test('script library, documentURL', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.documentURL(['/foo/bar/'], runtime.options), '/foo/bar/');
    assert.equal(markdownScriptFunctions.documentURL(['bar/'], runtime.options), '/foo/bar/');
});


//
// Element Model functions
//


test('script library, elementModelRender', () => {
    const runtime = testRuntime();
    const elements = [
        {'html': 'p', 'elem': {'text': 'Text 1'}},
        {'html': 'p', 'elem': {'text': 'Text 2'}}
    ];
    markdownScriptFunctions.elementModelRender([elements], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
        [
            {'html': 'p', 'elem': {'text': 'Text 1'}},
            {'html': 'p', 'elem': {'text': 'Text 2'}}
        ]
    ]);
});


test('script library, elementModelRender null', () => {
    const runtime = testRuntime();
    markdownScriptFunctions.elementModelRender([null], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
        null
    ]);
});


test('script library, elementModelRender callback null', () => {
    const runtime = testRuntime();
    const elements = [
        {'html': 'p', 'elem': {'text': 'Text 1'}, 'callback': null}
    ];
    markdownScriptFunctions.elementModelRender([elements], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
        [
            {'html': 'p', 'elem': {'text': 'Text 1'}, 'callback': null}
        ]
    ]);
});


test('script library, elementModelRender callback', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    // Event handler function
    const eventHandlerCodes = [];
    const eventHandler = ([keyCode], options) => {
        assert.notEqual(options, null);
        eventHandlerCodes.push(keyCode);
    };

    // Render the element model
    const elementModel = [
        {
            'html': 'input',
            'attr': {'id': 'test-input', 'type': 'text', 'value': 'The text'},
            'callback': {
                'keyup': eventHandler
            }
        }
    ];
    markdownScriptFunctions.elementModelRender([elementModel], runtime.options);
    const elements = runtime.resetElements();
    const elementCallback = elements[0][0].callback;
    assert.equal(typeof elementCallback, 'function');
    assert.equal(elementCallback.constructor.name, 'Function');
    delete elements[0][0].callback;
    assert.deepEqual(elements, [
        [
            {
                'html': 'input',
                'attr': {'id': 'test-input', 'type': 'text', 'value': 'The text'}
            }
        ]
    ]);
    assert.deepEqual(eventHandlerCodes, []);
    assert.equal(runtimeUpdateCount, 0);

    // Call the element callback
    const mockElementEvents = {};
    const mockElement = {
        'addEventListener': (eventType, eventCallback) => {
            mockElementEvents[eventType] = eventCallback;
        }
    };
    elementCallback(mockElement);
    assert.equal(typeof mockElementEvents.keyup, 'function');
    assert.equal(mockElementEvents.keyup.constructor.name, 'AsyncFunction');
    assert.deepEqual(eventHandlerCodes, []);
    assert.equal(runtimeUpdateCount, 0);

    // Call the element handler function
    const mockEvent = {'keyCode': 13};
    await mockElementEvents.keyup(mockEvent);
    assert.deepEqual(eventHandlerCodes, [13]);
    assert.equal(runtimeUpdateCount, 1);
});


test('script library, elementModelRender callback async', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    // Event handler function
    let clickCount = 0;
    // eslint-disable-next-line require-await
    const eventHandler = async (args, options) => {
        assert.notEqual(options, null);
        clickCount += 1;
    };

    // Render the element model
    const elementModel = [
        {
            'html': 'a',
            'attr': {'style': 'cursor: pointer; user-select: none;'},
            'elem': {'text': 'Click Me'},
            'callback': {'click': eventHandler}
        }
    ];
    markdownScriptFunctions.elementModelRender([elementModel], runtime.options);
    const elements = runtime.resetElements();
    const elementCallback = elements[0][0].callback;
    assert.equal(typeof elementCallback, 'function');
    assert.equal(elementCallback.constructor.name, 'Function');
    delete elements[0][0].callback;
    assert.deepEqual(elements, [
        [
            {
                'html': 'a',
                'attr': {'style': 'cursor: pointer; user-select: none;'},
                'elem': {'text': 'Click Me'}
            }
        ]
    ]);
    assert.deepEqual(clickCount, 0);
    assert.equal(runtimeUpdateCount, 0);

    // Call the element callback
    const mockElementEvents = {};
    const mockElement = {
        'addEventListener': (eventType, eventCallback) => {
            mockElementEvents[eventType] = eventCallback;
        }
    };
    elementCallback(mockElement);
    assert.equal(typeof mockElementEvents.click, 'function');
    assert.equal(mockElementEvents.click.constructor.name, 'AsyncFunction');
    assert.deepEqual(clickCount, 0);
    assert.equal(runtimeUpdateCount, 0);

    // Call the element handler function
    const mockEvent = {};
    await mockElementEvents.click(mockEvent);
    assert.deepEqual(clickCount, 1);
    assert.equal(runtimeUpdateCount, 1);
});


test('script library, elementModelRender callback error', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;
    const logs = [];
    runtime.options.logFn = (message) => logs.push(message);

    // Event handler function
    let clickCount = 0;
    const eventHandler = (args, options) => {
        assert.notEqual(options, null);
        clickCount += 1;
        throw new Error('BOOM!');
    };

    // Render the element model
    const elementModel = [
        {
            'html': 'a',
            'attr': {'style': 'cursor: pointer; user-select: none;'},
            'elem': {'text': 'Click Me'},
            'callback': {'click': eventHandler}
        }
    ];
    markdownScriptFunctions.elementModelRender([elementModel], runtime.options);
    const elements = runtime.resetElements();
    const elementCallback = elements[0][0].callback;
    assert.equal(typeof elementCallback, 'function');
    assert.equal(elementCallback.constructor.name, 'Function');
    delete elements[0][0].callback;
    assert.deepEqual(elements, [
        [
            {
                'html': 'a',
                'attr': {'style': 'cursor: pointer; user-select: none;'},
                'elem': {'text': 'Click Me'}
            }
        ]
    ]);
    assert.deepEqual(clickCount, 0);
    assert.equal(runtimeUpdateCount, 0);

    // Call the element callback
    const mockElementEvents = {};
    const mockElement = {
        'addEventListener': (eventType, eventCallback) => {
            mockElementEvents[eventType] = eventCallback;
        }
    };
    elementCallback(mockElement);
    assert.equal(typeof mockElementEvents.click, 'function');
    assert.equal(mockElementEvents.click.constructor.name, 'AsyncFunction');
    assert.deepEqual(clickCount, 0);
    assert.equal(runtimeUpdateCount, 0);
    assert.deepEqual(logs, []);

    // Call the element handler function
    const mockEvent = {};
    await mockElementEvents.click(mockEvent);
    assert.deepEqual(clickCount, 1);
    assert.equal(runtimeUpdateCount, 1);
    assert.deepEqual(logs, ['MarkdownUp: Error executing elementModelRender callback: BOOM!']);
});


//
// Local storage functions
//


test('script library, localStorageClear', () => {
    const runtime = testRuntime();
    runtime.options.window.localStorage.setItem('foo', 'bar');
    assert.equal(runtime.options.window.localStorage.getItem('foo'), 'bar');
    markdownScriptFunctions.localStorageClear([], runtime.options);
    assert.equal(runtime.options.window.localStorage.getItem('foo'), null);
});


test('script library, localStorageGet', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.localStorageGet(['foo'], runtime.options), null);
    runtime.options.window.localStorage.setItem('foo', 'bar');
    assert.equal(markdownScriptFunctions.localStorageGet(['foo'], runtime.options), 'bar');
});


test('script library, localStorageSet', () => {
    const runtime = testRuntime();
    assert.equal(runtime.options.window.localStorage.getItem('foo'), null);
    markdownScriptFunctions.localStorageSet(['foo', 'bar'], runtime.options);
    assert.equal(runtime.options.window.localStorage.getItem('foo'), 'bar');
});


test('script library, localStorageRemove', () => {
    const runtime = testRuntime();
    runtime.options.window.localStorage.setItem('foo', 'bar');
    assert.equal(runtime.options.window.localStorage.getItem('foo'), 'bar');
    markdownScriptFunctions.localStorageRemove(['foo'], runtime.options);
    assert.equal(runtime.options.window.localStorage.getItem('foo'), null);
});


//
// Markdown functions
//


test('script library, markdownPrint', () => {
    const runtime = testRuntime();
    markdownScriptFunctions.markdownPrint(['# Title', ['', 'Hello\n\nWorld!']], runtime.options);
    assert.deepEqual(runtime.resetElements(), [
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


//
// Session storage functions
//


test('script library, sessionStorageClear', () => {
    const runtime = testRuntime();
    runtime.options.window.sessionStorage.setItem('foo', 'bar');
    assert.equal(runtime.options.window.sessionStorage.getItem('foo'), 'bar');
    markdownScriptFunctions.sessionStorageClear([], runtime.options);
    assert.equal(runtime.options.window.sessionStorage.getItem('foo'), null);
});


test('script library, sessionStorageGet', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.sessionStorageGet(['foo'], runtime.options), null);
    runtime.options.window.sessionStorage.setItem('foo', 'bar');
    assert.equal(markdownScriptFunctions.sessionStorageGet(['foo'], runtime.options), 'bar');
});


test('script library, sessionStorageSet', () => {
    const runtime = testRuntime();
    assert.equal(runtime.options.window.sessionStorage.getItem('foo'), null);
    markdownScriptFunctions.sessionStorageSet(['foo', 'bar'], runtime.options);
    assert.equal(runtime.options.window.sessionStorage.getItem('foo'), 'bar');
});


test('script library, sessionStorageRemove', () => {
    const runtime = testRuntime();
    runtime.options.window.sessionStorage.setItem('foo', 'bar');
    assert.equal(runtime.options.window.sessionStorage.getItem('foo'), 'bar');
    markdownScriptFunctions.sessionStorageRemove(['foo'], runtime.options);
    assert.equal(runtime.options.window.sessionStorage.getItem('foo'), null);
});


//
// URL functions
//


test('script library, urlObjectCreate', async () => {
    const runtime = testRuntime();

    runtime.options.window.URL.createObjectURL = (blob) => {
        createObjectURLCalls.unshift(blob);
        return `<obj>`;
    };
    const createObjectURLCalls = [];

    // Default content type
    assert.equal(markdownScriptFunctions.urlObjectCreate(['The file text'], runtime.options), '<obj>');
    let [blob] = createObjectURLCalls;
    assert.equal(await blob.text(), 'The file text');
    assert.equal(await blob.type, 'text/plain');

    // With content type
    assert.equal(markdownScriptFunctions.urlObjectCreate(['The file text', 'text/markdown'], runtime.options), '<obj>');
    [blob] = createObjectURLCalls;
    assert.equal(await blob.text(), 'The file text');
    assert.equal(await blob.type, 'text/markdown');
});


//
// Window functions
//


test('script library, windowClipboardRead', async () => {
    const runtime = testRuntime();
    runtime.options.window.navigator.clipboard = {
        'readText': () => 'Hello!'
    };
    assert.equal(await markdownScriptFunctions.windowClipboardRead([], runtime.options), 'Hello!');
});


test('script library, windowClipboardWrite', async () => {
    const runtime = testRuntime();
    const writeCalls = [];
    runtime.options.window.navigator.clipboard = {
        'write': (clipboardItems) => {
            writeCalls.push(clipboardItems[0].types);
        }
    };

    class MockClipboardItem {
        constructor(data) {
            this.types = Object.keys(data);
        }
    };
    runtime.options.window.ClipboardItem = MockClipboardItem;

    assert.equal(await markdownScriptFunctions.windowClipboardWrite(['Hello!'], runtime.options), undefined);
    assert.deepEqual(writeCalls, [['text/plain']]);
});


test('script library, windowClipboardWrite SVG', async () => {
    const runtime = testRuntime();
    const writeCalls = [];
    runtime.options.window.navigator.clipboard = {
        'write': (clipboardItems) => {
            writeCalls.push(clipboardItems[0].types);
        }
    };

    class MockClipboardItem {
        constructor(data) {
            this.types = Object.keys(data);
        }
    };
    runtime.options.window.ClipboardItem = MockClipboardItem;

    assert.equal(await markdownScriptFunctions.windowClipboardWrite(['<svg>', 'image/svg+xml'], runtime.options), undefined);
    assert.deepEqual(writeCalls, [['image/svg+xml']]);
});


test('script library, windowHeight', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.windowHeight([], runtime.options), 768);
});


test('script library, windowSetLocation', () => {
    const runtime = testRuntime();
    assert.equal(runtime.windowLocation, null);
    markdownScriptFunctions.windowSetLocation(['/other'], runtime.options);
    assert.equal(runtime.windowLocation, '/other');
    markdownScriptFunctions.windowSetLocation(['other'], runtime.options);
    assert.equal(runtime.windowLocation, '/foo/other');
});


test('script library, windowSetResize', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    assert.equal(runtime.windowResize, null);
    assert.equal(runtime.options.statementCount, undefined);

    let onsizeCount = 0;
    const onsize = () => ++onsizeCount;
    markdownScriptFunctions.windowSetResize([onsize], runtime.options);

    assert.equal(typeof runtime.windowResize, 'function');
    assert.equal(runtime.windowResize.constructor.name, 'AsyncFunction');
    assert.equal(runtime.options.statementCount, undefined);
    assert.equal(runtimeUpdateCount, 0);
    assert.equal(onsizeCount, 0);

    await runtime.windowResize();
    assert.equal(runtime.options.statementCount, 0);
    assert.equal(runtimeUpdateCount, 1);
    assert.equal(onsizeCount, 1);
});


test('script library, windowSetResize async', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    assert.equal(runtime.windowResize, null);
    assert.equal(runtime.options.statementCount, undefined);

    let onsizeCount = 0;
    // eslint-disable-next-line require-await
    const onsize = async () => ++onsizeCount;
    markdownScriptFunctions.windowSetResize([onsize], runtime.options);

    assert.equal(typeof runtime.windowResize, 'function');
    assert.equal(runtime.windowResize.constructor.name, 'AsyncFunction');
    assert.equal(runtime.options.statementCount, undefined);
    assert.equal(runtimeUpdateCount, 0);
    assert.equal(onsizeCount, 0);

    await runtime.windowResize();
    assert.equal(runtime.options.statementCount, 0);
    assert.equal(runtimeUpdateCount, 1);
    assert.equal(onsizeCount, 1);
});


test('script library, windowSetResize callback error', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;
    const logs = [];
    runtime.options.logFn = (message) => logs.push(message);

    assert.equal(runtime.windowResize, null);
    assert.equal(runtime.options.statementCount, undefined);

    let onsizeCount = 0;
    const onsize = () => {
        ++onsizeCount;
        throw new Error('BOOM!');
    };
    markdownScriptFunctions.windowSetResize([onsize], runtime.options);

    assert.equal(typeof runtime.windowResize, 'function');
    assert.equal(runtime.windowResize.constructor.name, 'AsyncFunction');
    assert.equal(runtime.options.statementCount, undefined);
    assert.equal(runtimeUpdateCount, 0);
    assert.deepEqual(logs, []);
    assert.equal(onsizeCount, 0);

    await runtime.windowResize();
    assert.equal(runtime.options.statementCount, 0);
    assert.equal(runtimeUpdateCount, 1);
    assert.deepEqual(logs, ['MarkdownUp: Error executing windowSetResize callback: BOOM!']);
    assert.equal(onsizeCount, 1);
});


test('script library, windowSetTimeout', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    assert.equal(runtime.windowTimeout, null);
    assert.equal(runtime.options.statementCount, undefined);

    let ontimeCount = 0;
    const ontime = () => ++ontimeCount;
    markdownScriptFunctions.windowSetTimeout([ontime, 1000], runtime.options);

    assert.equal(typeof runtime.windowTimeout[0], 'function');
    assert.equal(runtime.windowTimeout[0].constructor.name, 'AsyncFunction');
    assert.equal(runtime.windowTimeout[1], 1000);
    assert.equal(runtime.options.statementCount, undefined);
    assert.equal(runtimeUpdateCount, 0);
    assert.equal(ontimeCount, 0);

    await runtime.windowTimeout[0]();
    assert.equal(runtime.options.statementCount, 0);
    assert.equal(runtimeUpdateCount, 1);
    assert.equal(ontimeCount, 1);
});


test('script library, windowSetTimeout async', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;

    assert.equal(runtime.windowTimeout, null);
    assert.equal(runtime.options.statementCount, undefined);

    let ontimeCount = 0;
    // eslint-disable-next-line require-await
    const ontime = async () => ++ontimeCount;
    markdownScriptFunctions.windowSetTimeout([ontime, 1000], runtime.options);

    assert.equal(typeof runtime.windowTimeout[0], 'function');
    assert.equal(runtime.windowTimeout[0].constructor.name, 'AsyncFunction');
    assert.equal(runtime.windowTimeout[1], 1000);
    assert.equal(runtime.options.statementCount, undefined);
    assert.equal(runtimeUpdateCount, 0);
    assert.equal(ontimeCount, 0);

    await runtime.windowTimeout[0]();
    assert.equal(runtime.options.statementCount, 0);
    assert.equal(runtimeUpdateCount, 1);
    assert.equal(ontimeCount, 1);
});


test('script library, windowSetTimeout callback error', async () => {
    const runtime = testRuntime();
    let runtimeUpdateCount = 0;
    runtime.options.runtimeUpdateFn = () => ++runtimeUpdateCount;
    const logs = [];
    runtime.options.logFn = (message) => logs.push(message);

    assert.equal(runtime.windowTimeout, null);
    assert.equal(runtime.options.statementCount, undefined);

    let ontimeCount = 0;
    const ontime = () => {
        ++ontimeCount;
        throw new Error('BOOM!');
    };
    markdownScriptFunctions.windowSetTimeout([ontime, 1000], runtime.options);

    assert.equal(typeof runtime.windowTimeout[0], 'function');
    assert.equal(runtime.windowTimeout[0].constructor.name, 'AsyncFunction');
    assert.equal(runtime.windowTimeout[1], 1000);
    assert.equal(runtime.options.statementCount, undefined);
    assert.equal(runtimeUpdateCount, 0);
    assert.deepEqual(logs, []);
    assert.equal(ontimeCount, 0);

    await runtime.windowTimeout[0]();
    assert.equal(runtime.options.statementCount, 0);
    assert.equal(runtimeUpdateCount, 1);
    assert.deepEqual(logs, ['MarkdownUp: Error executing windowSetTimeout callback: BOOM!']);
    assert.equal(ontimeCount, 1);
});


test('script library, windowWidth', () => {
    const runtime = testRuntime();
    assert.equal(markdownScriptFunctions.windowWidth([], runtime.options), 1024);
});
