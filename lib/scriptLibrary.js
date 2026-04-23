// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import {valueArgsModel, valueArgsValidate} from 'bare-script/lib/value.js';
import {validateElements} from 'element-model/lib/elementModel.js';


// Constants
const pixelsPerPoint = 4 / 3;


//
// Document functions
//


// $function: documentFontSize
// $group: document
// $doc: Get the document font size
// $return: The document font size, in pixels
function documentFontSize(unusedArgs, options) {
    return options.fontSize * pixelsPerPoint;
}


// $function: documentInputValue
// $group: document
// $doc: Get an input element's value
// $arg id: The input element ID
// $return: The input element value or null if the element does not exist
function documentInputValue(args, options) {
    const [id] = valueArgsValidate(documentInputValueArgs, args);
    const element = options.window.document.getElementById(id) ?? null;
    return (element !== null ? (element.value ?? null) : null);
}

const documentInputValueArgs = valueArgsModel([
    {'name': 'id', 'type': 'string'}
]);


// $function: documentSetFocus
// $group: document
// $doc: Set focus to an element
// $arg id: The element ID
function documentSetFocus(args, options) {
    const [id] = valueArgsValidate(documentSetFocusArgs, args);
    const {runtime} = options;
    runtime.documentFocus = id;
}

const documentSetFocusArgs = valueArgsModel([
    {'name': 'id', 'type': 'string'}
]);


// $function: documentSetKeyDown
// $group: document
// $doc: Set the document keydown event handler. For example:
// $doc:
// $doc: ```barescript
// $doc: function myAppMain():
// $doc:     myAppRender()
// $doc:     documentSetKeyDown(myAppKeyDown)
// $doc: endfunction
// $doc:
// $doc: function myAppRender(key):
// $doc:     markdownPrint( \
// $doc:         '# KeyDown Test', \
// $doc:         '', \
// $doc:         if(key, '**Key pressed:** "' + key + '"', '*No key pressed yet.*') \
// $doc:     )
// $doc: endfunction
// $doc:
// $doc: function myAppKeyDown(event):
// $doc:     key = objectGet(event, 'key')
// $doc:     myAppRender(key)
// $doc: endfunction
// $doc:
// $doc: myAppMain()
// $doc: ```
// $arg callback: The keydown event callback function, which takes a single `event` object that has
// $arg callback: the following attributes:
// $arg callback: - `key` - The key value (e.g., "a", "Enter", "ArrowUp")
// $arg callback: - `code` - The physical key code (e.g., "KeyA", "Enter")
// $arg callback: - `keyCode` - The legacy numeric code (e.g., 65 for 'a')
// $arg callback: - `ctrlKey` - If true, the control key is pressed
// $arg callback: - `altKey` - If true, the alt key is pressed
// $arg callback: - `shiftKey` - If true, the shift key is pressed
// $arg callback: - `metaKey` - If true, the cmd key is pressed
// $arg callback: - `repeat` - If true, the key is held down
// $arg callback: - `location` - 0=standard, 1=left, 2=right
function documentSetKeyDown(args, options) {
    const [callback] = valueArgsValidate(documentSetKeyDownArgs, args);
    const {runtime} = options;
    runtime.documentKeyDown = async (event) => {
        await runtime.eventHandle(async () => {
            // Create the event callback object
            const eventObj = {
                'key': event.key,
                'code': event.code,
                'keyCode': event.keyCode,
                'ctrlKey': event.ctrlKey,
                'altKey': event.altKey,
                'shiftKey': event.shiftKey,
                'metaKey': event.metaKey,
                'repeat': event.repeat,
                'location': event.location
            };

            // Call the event callback function
            options.statementCount = 0;
            try {
                await callback([eventObj], options);
            } catch ({message}) {
                if (options.debug) {
                    options.logFn(`MarkdownUp: Error executing documentSetKeyDown callback: ${message}`);
                }
            }
            options.runtimeUpdateFn();
        });
    };
}

const documentSetKeyDownArgs = valueArgsModel([
    {'name': 'callback', 'type': 'function'}
]);


// $function: documentSetReset
// $group: document
// $doc: Set the document reset element
// $arg id: The element ID
function documentSetReset(args, options) {
    const [id] = valueArgsValidate(documentSetResetArgs, args);
    const {runtime} = options;
    runtime.documentReset = id;
}

const documentSetResetArgs = valueArgsModel([
    {'name': 'id', 'type': 'string'}
]);


// $function: documentSetTitle
// $group: document
// $doc: Set the document title
// $arg title: The document title string
function documentSetTitle(args, options) {
    const [title] = valueArgsValidate(documentSetTitleArgs, args);
    const {runtime} = options;
    runtime.documentTitle = title;
}

const documentSetTitleArgs = valueArgsModel([
    {'name': 'title', 'type': 'string'}
]);


// $function: documentURL
// $group: document
// $doc: Fix-up relative URLs
// $arg url: The URL
// $return: The fixed-up URL
function documentURL(args, options) {
    const [url] = valueArgsValidate(documentURLArgs, args);
    return options.urlFn(url);
}

const documentURLArgs = valueArgsModel([
    {'name': 'url', 'type': 'string'}
]);


//
// Element Model functions
//


// $function: elementModelRender
// $group: elementModel
// $doc: Render an [element model](https://github.com/craigahobbs/element-model#readme)
// $doc:
// $doc: **Note:** Element model "callback" members are a map of event name (e.g., "click") to
// $doc: event callback function. The following events have callback arguments:
// $doc: - **keydown** - keyCode
// $doc: - **keypress** - keyCode
// $doc: - **keyup** - keyCode
// $arg element: The [element model](https://github.com/craigahobbs/element-model#readme)
function elementModelRender([elements = null], options) {
    const {runtime} = options;
    runtime.setElements();
    elementModelWrapCallbacks(elements, options);
    runtime.addElements(validateElements(elements));
}


export function elementModelWrapCallbacks(elements, options) {
    // Ignore non-objects
    if (elements === null || typeof elements !== 'object') {
        return;
    }

    // Array?
    if (Array.isArray(elements)) {
        for (const childElements of elements) {
            elementModelWrapCallbacks(childElements, options);
        }
        return;
    }

    // Wrap child elements
    const elementsElem = elements.elem ?? null;
    if (elementsElem !== null) {
        elementModelWrapCallbacks(elementsElem, options);
    }

    // Element callback attribute must be map of event => callback
    const elementEvents = elements.callback ?? null;
    if (elementEvents !== null && typeof elementEvents === 'object') {
        // Wrap the event handler function
        elements.callback = (element) => {
            // On element render, add a listener for each event
            for (const [elementEvent, elementEventCallback] of Object.entries(elementEvents)) {
                element.addEventListener(elementEvent, async (event) => {
                    // Determine the event callback args
                    const eventArgs = [];
                    if (elementEvent === 'click' && event.target?.namespaceURI === 'http://www.w3.org/2000/svg') {
                        const svg = event.target.ownerSVGElement || event.target;
                        const boundingRect = svg.getBoundingClientRect();
                        eventArgs.push(event.clientX - boundingRect.left);
                        eventArgs.push(event.clientY - boundingRect.top);
                        eventArgs.push(boundingRect.width);
                        eventArgs.push(boundingRect.height);
                    } else if (elementEvent === 'keydown' || elementEvent === 'keypress' || elementEvent === 'keyup') {
                        eventArgs.push(event.keyCode);
                    }

                    // Call the event handler
                    options.statementCount = 0;
                    try {
                        await elementEventCallback(eventArgs, options);
                    } catch ({message}) {
                        if ('logFn' in options && options.debug) {
                            options.logFn(`MarkdownUp: Error executing elementModelRender callback: ${message}`);
                        }
                    }
                    options.runtimeUpdateFn();
                });
            }
        };
    }
}


//
// Local storage functions
//


// $function: localStorageClear
// $group: localStorage
// $doc: Clear all keys from the browser's local storage
function localStorageClear(unusedArgs, options) {
    options.window.localStorage.clear();
}


// $function: localStorageGet
// $group: localStorage
// $doc: Get a browser local storage key's value
// $arg key: The key string
// $return: The local storage value string or null if the key does not exist
function localStorageGet(args, options) {
    const [key] = valueArgsValidate(localStorageGetArgs, args);
    return options.window.localStorage.getItem(key);
}

const localStorageGetArgs = valueArgsModel([
    {'name': 'key', 'type': 'string'}
]);


// $function: localStorageRemove
// $group: localStorage
// $doc: Remove a browser local storage key
// $arg key: The key string
function localStorageRemove(args, options) {
    const [key] = valueArgsValidate(localStorageRemoveArgs, args);
    return options.window.localStorage.removeItem(key);
}

const localStorageRemoveArgs = valueArgsModel([
    {'name': 'key', 'type': 'string'}
]);


// $function: localStorageSet
// $group: localStorage
// $doc: Set a browser local storage key's value
// $arg key: The key string
// $arg value: The value string
function localStorageSet(args, options) {
    const [key, value] = valueArgsValidate(localStorageSetArgs, args);
    return options.window.localStorage.setItem(key, value);
}

const localStorageSetArgs = valueArgsModel([
    {'name': 'key', 'type': 'string'},
    {'name': 'value'}
]);


//
// Markdown functions
//


// $function: markdownPrint
// $group: markdown
// $doc: Render Markdown text
// $arg lines...: The Markdown text lines (may contain nested arrays of un-split lines)
function markdownPrint(lines, options) {
    const {runtime} = options;
    runtime.setMarkdown();
    runtime.addMarkdown(lines);
}


//
// Session storage functions
//


// $function: sessionStorageClear
// $group: sessionStorage
// $doc: Clear all keys from the browser's session storage
function sessionStorageClear(unusedArgs, options) {
    return options.window.sessionStorage.clear();
}


// $function: sessionStorageGet
// $group: sessionStorage
// $doc: Get a browser session storage key's value
// $arg key: The key string
// $return: The session storage value string or null if the key does not exist
function sessionStorageGet(args, options) {
    const [key] = valueArgsValidate(sessionStorageGetArgs, args);
    return options.window.sessionStorage.getItem(key);
}

const sessionStorageGetArgs = valueArgsModel([
    {'name': 'key', 'type': 'string'}
]);


// $function: sessionStorageRemove
// $group: sessionStorage
// $doc: Remove a browser session storage key
// $arg key: The key string
function sessionStorageRemove(args, options) {
    const [key] = valueArgsValidate(sessionStorageRemoveArgs, args);
    return options.window.sessionStorage.removeItem(key);
}

const sessionStorageRemoveArgs = valueArgsModel([
    {'name': 'key', 'type': 'string'}
]);


// $function: sessionStorageSet
// $group: sessionStorage
// $doc: Set a browser session storage key's value
// $arg key: The key string
// $arg value: The value string
function sessionStorageSet(args, options) {
    const [key, value] = valueArgsValidate(sessionStorageSetArgs, args);
    return options.window.sessionStorage.setItem(key, value);
}

const sessionStorageSetArgs = valueArgsModel([
    {'name': 'key', 'type': 'string'},
    {'name': 'value'}
]);


//
// Window functions
//


// $function: windowClipboardRead
// $group: window
// $doc: Read text from the clipboard
// $return: The clipboard text
async function windowClipboardRead(args, options) {
    return await options.window.navigator.clipboard.readText();
}


// $function: windowClipboardWrite
// $group: window
// $doc: Write text to the clipboard
// $arg text: The text to write
// $arg type: The clipboard content type (default is "text/plain")
async function windowClipboardWrite(args, options) {
    const [text, type] = valueArgsValidate(windowClipboardWriteArgs, args);
    const blob = new Blob([text], {type});
    await options.window.navigator.clipboard.write([new options.window.ClipboardItem({[type]: blob})]);
}

const windowClipboardWriteArgs = valueArgsModel([
    {'name': 'text', 'type': 'string'},
    {'name': 'type', 'type': 'string', 'default': 'text/plain'}
]);


// $function: windowHeight
// $group: window
// $doc: Get the browser window's height
// $return: The browser window's height
function windowHeight(unusedArgs, options) {
    return options.window.innerHeight;
}


// $function: windowSetLocation
// $group: window
// $doc: Navigate the browser window to a location URL
// $arg url: The new location URL
function windowSetLocation(args, options) {
    const [location] = valueArgsValidate(windowSetLocationArgs, args);
    const {runtime} = options;
    runtime.windowLocation = options.urlFn(location);
}

const windowSetLocationArgs = valueArgsModel([
    {'name': 'url', 'type': 'string'}
]);


// $function: windowSetResize
// $group: window
// $doc: Set the browser window resize event handler
// $arg callback: The window resize callback function
function windowSetResize(args, options) {
    const [callback] = valueArgsValidate(windowSetResizeArgs, args);
    const {runtime} = options;
    runtime.windowResize = async () => {
        await runtime.eventHandle(async () => {
            options.statementCount = 0;
            try {
                await callback([], options);
            } catch ({message}) {
                if (options.debug) {
                    options.logFn(`MarkdownUp: Error executing windowSetResize callback: ${message}`);
                }
            }
            options.runtimeUpdateFn();
        });
    };
}

const windowSetResizeArgs = valueArgsModel([
    {'name': 'callback', 'type': 'function'}
]);


// $function: windowSetTimeout
// $group: window
// $doc: Set the browser window timeout event handler
// $arg callback: The window timeout callback function
// $arg delay: The delay, in milliseconds, to ellapse before calling the timeout
function windowSetTimeout(args, options) {
    const [callback, delay] = valueArgsValidate(windowSetTimeoutArgs, args);
    const {runtime} = options;
    runtime.windowTimeout = [
        async () => {
            await runtime.eventHandle(async () => {
                options.statementCount = 0;
                try {
                    await callback([], options);
                } catch ({message}) {
                    if (options.debug) {
                        options.logFn(`MarkdownUp: Error executing windowSetTimeout callback: ${message}`);
                    }
                }
                options.runtimeUpdateFn();
            });
        },
        delay
    ];
}

const windowSetTimeoutArgs = valueArgsModel([
    {'name': 'callback', 'type': 'function'},
    {'name': 'delay', 'type': 'number'}
]);


// $function: windowURLObject
// $group: window
// $doc: Create an object URL (i.e. a file download URL)
// $arg data: The object data string
// $arg contentType: Optional (default is "text/plain"). The object content type.
// $return: The object URL string
function windowURLObject(args, options) {
    const [data, contentType] = valueArgsValidate(windowURLObjectArgs, args);
    return options.window.URL.createObjectURL(new Blob([data], {'type': contentType}));
}

const windowURLObjectArgs = valueArgsModel([
    {'name': 'data', 'type': 'string'},
    {'name': 'contentType', 'type': 'string', 'default': 'text/plain'}
]);


// $function: windowWidth
// $group: window
// $doc: Get the browser window's width
// $return: The browser window's width
function windowWidth(unusedArgs, options) {
    return options.window.innerWidth;
}


// markdown-script library functions
export const markdownScriptFunctions = {
    documentFontSize,
    documentInputValue,
    documentSetFocus,
    documentSetKeyDown,
    documentSetReset,
    documentSetTitle,
    documentURL,
    elementModelRender,
    localStorageClear,
    localStorageGet,
    localStorageRemove,
    localStorageSet,
    markdownPrint,
    sessionStorageClear,
    sessionStorageGet,
    sessionStorageRemove,
    sessionStorageSet,
    windowClipboardRead,
    windowClipboardWrite,
    windowHeight,
    windowSetLocation,
    windowSetResize,
    windowSetTimeout,
    windowURLObject,
    windowWidth
};
