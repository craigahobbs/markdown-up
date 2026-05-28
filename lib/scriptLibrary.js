// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import {valueArgsModel, valueArgsValidate} from '../bare-script/lib/value.js';
import {validateElements} from '../element-model/lib/elementModel.js';


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


// $function: windowKeyState
// $group: window
// $doc: Test whether a key combination is currently held down. Unlike `documentSetKeyDown`, which
// $doc: fires a callback once per key press, this polls the live keyboard state and is intended for
// $doc: game loops and animations. The modifier-key states must match exactly, so by default the key
// $doc: must be pressed with no modifier keys held. For example:
// $doc:
// $doc: ```barescript
// $doc: if windowKeyState('ArrowLeft'):
// $doc:     playerX = playerX - playerSpeed
// $doc: endif
// $doc: if windowKeyState('ArrowRight'):
// $doc:     playerX = playerX + playerSpeed
// $doc: endif
// $doc: ```
// $doc:
// $doc: The key is matched against the physical key code (e.g., "ArrowUp", "KeyW", "Space", "Enter").
// $arg key: The physical key code (e.g., "ArrowUp", "ArrowDown", "KeyA", "KeyW", "Space")
// $arg ctrl: If true, the control key must be down; if false (the default), it must be up
// $arg shift: If true, the shift key must be down; if false (the default), it must be up
// $arg alt: If true, the alt key must be down; if false (the default), it must be up
// $arg meta: If true, the meta (command) key must be down; if false (the default), it must be up
// $return: true if the key is down and all modifier-key states match, false otherwise
function windowKeyState(args, options) {
    const [key, ctrl, shift, alt, meta] = valueArgsValidate(windowKeyStateArgs, args);
    const keyState = options.keyStateFn();
    return !!keyState[key] &&
        !ctrl === !keyState.ctrl && !shift === !keyState.shift && !alt === !keyState.alt && !meta === !keyState.meta;
}

const windowKeyStateArgs = valueArgsModel([
    {'name': 'key', 'type': 'string'},
    {'name': 'ctrl', 'type': 'boolean'},
    {'name': 'shift', 'type': 'boolean'},
    {'name': 'alt', 'type': 'boolean'},
    {'name': 'meta', 'type': 'boolean'}
]);


// $function: windowPlaySound
// $group: window
// $doc: Play a generated sound effect. Unknown sounds are ignored. The sound name is one of:
// $doc:
// $doc: - **UI** - "beep", "click", "error", "success", "warning"
// $doc: - **Arcade** - "coin", "jump", "laser", "explosion", "powerup", "powerdown", "hit", "blip", "gameover"
// $doc: - **Notes** - "noteC4", "noteCs4", "noteD4", "noteDs4", "noteE4", "noteF4", "noteFs4", "noteG4",
// $doc:   "noteGs4", "noteA4", "noteAs4", "noteB4", "noteC5"
// $doc: - **Drums** - "drumKick", "drumSnare", "drumHihat", "drumOpenhat", "drumTomLow", "drumTomMid",
// $doc:   "drumTomHigh", "drumClap", "drumCrash", "drumRide"
// $arg sound: The sound name
function windowPlaySound(args, options) {
    const [sound] = valueArgsValidate(windowPlaySoundArgs, args);

    // Unknown sound? Debug-log and do nothing else.
    const tones = windowPlaySoundTones[sound] ?? null;
    if (tones === null) {
        if (options.debug) {
            options.logFn(`MarkdownUp: Unknown windowPlaySound sound "${sound}"`);
        }
        return;
    }

    // Get the audio context and resume it if suspended (required by most browsers)
    const audioContext = options.audioContextFn();
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // Gain envelope: a near-silent floor (exponential ramps cannot reach zero) and a short attack (seconds)
    const silence = 0.0001;
    const attack = 0.005;

    // Schedule each tone in the sound's sequence
    let startTime = audioContext.currentTime;
    for (const tone of tones) {
        const {type, frequency, duration, volume} = tone;
        const frequencyEnd = tone.frequencyEnd ?? null;
        const filter = tone.filter ?? null;
        startTime += (tone.gap ?? 0) / 1000;
        const stopTime = startTime + duration / 1000;

        // Create the source node - a white-noise burst (for drums and explosions) or an oscillator tone
        let source;
        if (type === 'noise') {
            source = audioContext.createBufferSource();
            source.buffer = options.audioNoiseBufferFn();
            // Loop the (one-second) noise buffer so tones longer than it still sustain
            source.loop = true;
        } else {
            source = audioContext.createOscillator();
            source.type = type;
            source.frequency.setValueAtTime(frequency, startTime);
            if (frequencyEnd !== null) {
                source.frequency.exponentialRampToValueAtTime(frequencyEnd, stopTime);
            }
        }

        // Optional band filter (e.g., the high frequencies of a cymbal or the low boom of an explosion)
        let output = source;
        if (filter !== null) {
            const filterNode = audioContext.createBiquadFilter();
            filterNode.type = filter.type;
            filterNode.frequency.value = filter.frequency;
            source.connect(filterNode);
            output = filterNode;
        }

        // Apply a percussive gain envelope, clamping the attack to the stop time so the ramp events
        // stay ordered even for very short tones
        const gain = audioContext.createGain();
        const attackTime = Math.min(startTime + attack, stopTime);
        gain.gain.setValueAtTime(silence, startTime);
        gain.gain.exponentialRampToValueAtTime(volume, attackTime);
        gain.gain.exponentialRampToValueAtTime(silence, stopTime);
        output.connect(gain);
        gain.connect(audioContext.destination);

        source.start(startTime);
        source.stop(stopTime);
        startTime = stopTime;
    }
}

const windowPlaySoundArgs = valueArgsModel([
    {'name': 'sound', 'type': 'string'}
]);


// The generated sounds, each a sequence of tones. A tone is one of an oscillator ("sine", "square",
// "triangle", "sawtooth") or a "noise" burst. "frequencyEnd" ramps the oscillator pitch for sweeps,
// "filter" band-passes the source (e.g. cymbals), and "gap" is the silence, in milliseconds, before it.
const windowPlaySoundTones = {
    // UI
    'beep': [
        {'type': 'sine', 'frequency': 880, 'duration': 180, 'volume': 0.3}
    ],
    'click': [
        {'type': 'square', 'frequency': 1200, 'duration': 40, 'volume': 0.2}
    ],
    'error': [
        {'type': 'square', 'frequency': 350, 'duration': 250, 'volume': 0.4}
    ],
    'success': [
        {'type': 'sine', 'frequency': 660, 'duration': 120, 'volume': 0.3},
        {'type': 'sine', 'frequency': 990, 'duration': 200, 'volume': 0.3}
    ],
    'warning': [
        {'type': 'triangle', 'frequency': 440, 'duration': 160, 'volume': 0.4},
        {'type': 'triangle', 'frequency': 440, 'duration': 160, 'volume': 0.4, 'gap': 80}
    ],

    // Arcade
    'coin': [
        {'type': 'square', 'frequency': 988, 'duration': 80, 'volume': 0.3},
        {'type': 'square', 'frequency': 1319, 'duration': 200, 'volume': 0.3}
    ],
    'jump': [
        {'type': 'square', 'frequency': 300, 'frequencyEnd': 800, 'duration': 150, 'volume': 0.3}
    ],
    'laser': [
        {'type': 'sawtooth', 'frequency': 1200, 'frequencyEnd': 200, 'duration': 250, 'volume': 0.4}
    ],
    'explosion': [
        {'type': 'noise', 'duration': 1600, 'volume': 0.9, 'filter': {'type': 'lowpass', 'frequency': 800}}
    ],
    'powerup': [
        {'type': 'square', 'frequency': 523, 'duration': 80, 'volume': 0.3},
        {'type': 'square', 'frequency': 659, 'duration': 80, 'volume': 0.3},
        {'type': 'square', 'frequency': 784, 'duration': 80, 'volume': 0.3},
        {'type': 'square', 'frequency': 1047, 'duration': 160, 'volume': 0.3}
    ],
    'powerdown': [
        {'type': 'square', 'frequency': 1047, 'duration': 80, 'volume': 0.3},
        {'type': 'square', 'frequency': 784, 'duration': 80, 'volume': 0.3},
        {'type': 'square', 'frequency': 659, 'duration': 80, 'volume': 0.3},
        {'type': 'square', 'frequency': 523, 'duration': 160, 'volume': 0.3}
    ],
    'hit': [
        {'type': 'square', 'frequency': 400, 'frequencyEnd': 100, 'duration': 120, 'volume': 0.3}
    ],
    'blip': [
        {'type': 'square', 'frequency': 1000, 'duration': 40, 'volume': 0.25}
    ],
    'gameover': [
        {'type': 'square', 'frequency': 392, 'duration': 180, 'volume': 0.3},
        {'type': 'square', 'frequency': 330, 'duration': 180, 'volume': 0.3},
        {'type': 'square', 'frequency': 262, 'duration': 320, 'volume': 0.3}
    ],

    // Musical notes (one chromatic octave, C4 - C5, equal temperament)
    'noteC4': [
        {'type': 'triangle', 'frequency': 261.63, 'duration': 400, 'volume': 0.3}
    ],
    'noteCs4': [
        {'type': 'triangle', 'frequency': 277.18, 'duration': 400, 'volume': 0.3}
    ],
    'noteD4': [
        {'type': 'triangle', 'frequency': 293.66, 'duration': 400, 'volume': 0.3}
    ],
    'noteDs4': [
        {'type': 'triangle', 'frequency': 311.13, 'duration': 400, 'volume': 0.3}
    ],
    'noteE4': [
        {'type': 'triangle', 'frequency': 329.63, 'duration': 400, 'volume': 0.3}
    ],
    'noteF4': [
        {'type': 'triangle', 'frequency': 349.23, 'duration': 400, 'volume': 0.3}
    ],
    'noteFs4': [
        {'type': 'triangle', 'frequency': 369.99, 'duration': 400, 'volume': 0.3}
    ],
    'noteG4': [
        {'type': 'triangle', 'frequency': 392.00, 'duration': 400, 'volume': 0.3}
    ],
    'noteGs4': [
        {'type': 'triangle', 'frequency': 415.30, 'duration': 400, 'volume': 0.3}
    ],
    'noteA4': [
        {'type': 'triangle', 'frequency': 440.00, 'duration': 400, 'volume': 0.3}
    ],
    'noteAs4': [
        {'type': 'triangle', 'frequency': 466.16, 'duration': 400, 'volume': 0.3}
    ],
    'noteB4': [
        {'type': 'triangle', 'frequency': 493.88, 'duration': 400, 'volume': 0.3}
    ],
    'noteC5': [
        {'type': 'triangle', 'frequency': 523.25, 'duration': 400, 'volume': 0.3}
    ],

    // Drum set
    'drumKick': [
        {'type': 'sine', 'frequency': 150, 'frequencyEnd': 50, 'duration': 180, 'volume': 0.9}
    ],
    'drumSnare': [
        {'type': 'noise', 'duration': 200, 'volume': 0.6, 'filter': {'type': 'highpass', 'frequency': 1500}}
    ],
    'drumHihat': [
        {'type': 'noise', 'duration': 50, 'volume': 0.4, 'filter': {'type': 'highpass', 'frequency': 7000}}
    ],
    'drumOpenhat': [
        {'type': 'noise', 'duration': 300, 'volume': 0.4, 'filter': {'type': 'highpass', 'frequency': 7000}}
    ],
    'drumTomLow': [
        {'type': 'sine', 'frequency': 160, 'frequencyEnd': 80, 'duration': 260, 'volume': 0.7}
    ],
    'drumTomMid': [
        {'type': 'sine', 'frequency': 220, 'frequencyEnd': 110, 'duration': 220, 'volume': 0.7}
    ],
    'drumTomHigh': [
        {'type': 'sine', 'frequency': 300, 'frequencyEnd': 150, 'duration': 200, 'volume': 0.7}
    ],
    'drumClap': [
        {'type': 'noise', 'duration': 120, 'volume': 0.5, 'filter': {'type': 'highpass', 'frequency': 1000}}
    ],
    'drumCrash': [
        {'type': 'noise', 'duration': 800, 'volume': 0.5, 'filter': {'type': 'highpass', 'frequency': 5000}}
    ],
    'drumRide': [
        {'type': 'noise', 'duration': 500, 'volume': 0.35, 'filter': {'type': 'highpass', 'frequency': 8000}}
    ]
};


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
    windowKeyState,
    windowPlaySound,
    windowSetLocation,
    windowSetResize,
    windowSetTimeout,
    windowURLObject,
    windowWidth
};
