// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

// Voice playback test mocks - a mock Web Audio context and a mock PicoVox


// A mock Web Audio context - its time is set by the test, and a test ends a source's audio by calling its "onended".
// Unless it's "allowed", it doesn't run (as when the browser hasn't let the audio start) - a new context is allowed
// if the class is.
export class MockAudioContext {
    static allowed = true;

    constructor(options) {
        this.options = options;
        this.allowed = MockAudioContext.allowed;
        this.state = 'suspended';
        this.currentTime = 0;
        this.destination = {};
        this.calls = [];
        this.buffers = [];
        this.sources = [];
    }

    resume() {
        this.calls.push('resume');
        if (!this.allowed) {
            return new Promise(() => {
                // Never resolved
            });
        }
        this.state = 'running';
        return Promise.resolve();
    }

    suspend() {
        this.calls.push('suspend');
        this.state = 'suspended';
    }

    createBuffer(channels, length, sampleRate) {
        const buffer = {
            channels,
            length,
            sampleRate,
            'block': null,
            copyToChannel(block) {
                this.block = block;
            }
        };
        this.buffers.push(buffer);
        return buffer;
    }

    createBufferSource() {
        const source = {
            'buffer': null,
            'onended': null,
            'startTime': null,
            'stopped': false,
            connect() {
                // Do nothing
            },
            start(time) {
                this.startTime = time;
            },
            stop() {
                this.stopped = true;
            }
        };
        this.sources.push(source);
        return source;
    }
}


// The mock PicoVox voices
export const mockVoices = [
    {'key': 'male', 'label': 'Male', 'sex': 'male'},
    {'key': 'female', 'label': 'Female', 'sex': 'female'},
    {'key': 'sarah', 'label': 'Sarah', 'sex': 'female'},
    {'key': 'james', 'label': 'James', 'sex': 'male'},
    {'key': 'michael', 'label': 'Michael', 'sex': 'male'}
];


// Create a mock PicoVox - each sentence is a number of one-second blocks, and its "calls" are its sentenceBlocks calls
export function mockPicovox(blocks = 1) {
    const picovox = {
        'voices': mockVoices,
        'styles': ['neutral', 'angry', 'shouting'],
        'paragraphPause': 0.4,
        'sentencePause': 0.24,
        'calls': [],
        'sentenceBlocks': (text, options) => {
            picovox.calls.push([text, options]);
            return Array.from({'length': blocks}, () => new Float32Array(24000));
        }
    };
    return picovox;
}


// Drain the event loop (macrotasks and microtasks) so the voice playback's synthesis has time to run
export async function flushTasks() {
    for (let ix = 0; ix < 20; ix++) {
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 0));
        await Promise.resolve();
    }
}
