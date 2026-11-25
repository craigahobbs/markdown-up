// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

// The MarkdownUp voice playback - text read aloud with PicoVox speech synthesis and Web Audio. The playback's text may
// grow as it plays (e.g., a response that's still generating): the text's last sentence is held back until the text is
// final, and if playback reaches the end of the text before it's final, it pauses. Apart from the playback, there are
// the voice lines - text said aloud in a voice and a speaking style (e.g., a film's dialogue), each over any others.

import {speechText, splitSentences} from '../picovox/lib/sentences.js';


// The voice playback sample rate (Hz) - PicoVox's own. The audio context runs at it, so the blocks join exactly.
const voiceSampleRate = 24000;


// The playback timing (s) - how far ahead of the audio context's time a block starts, and how far ahead of playback
// synthesis runs
const playbackLead = 0.05;
const playbackAhead = 4;


// The noise seed of the text's first sentence (sentence i is rendered with seed + i)
const playbackSeed = 1000;


// Skip back goes to the previous section within this many seconds of a section's start (otherwise, to the section's start)
const skipBackSeconds = 2;


// How long a voice line waits for its audio context to run (ms) - a line that can't be heard (the browser hasn't let the
// audio start) is dropped
const lineStartMs = 250;


// The voice playback speaking rates
export const voiceRates = [0.8, 1, 1.1, 1.2, 1.5];


// The default speaking style
const voiceDefaultStyle = 'neutral';


// The default male voice (the default voice) and the default female voice
const voiceDefaultMale = 'michael';
const voiceDefaultFemale = 'sarah';


// The voice label overrides - PicoVox's "male" and "female" voices are named
const voiceLabels = {'male': 'John', 'female': 'Mary'};


// The element model HTML tags that continue a paragraph's text
const inlineTags = new Set([
    'a', 'abbr', 'b', 'bdi', 'bdo', 'cite', 'code', 'del', 'dfn', 'em', 'font', 'i', 'ins', 'kbd', 'label', 'mark', 'q', 's',
    'samp', 'small', 'span', 'strong', 'sub', 'sup', 'u', 'var'
]);


// The element model HTML tags that aren't read aloud - code blocks, images, and controls
const skipTags = new Set([
    'audio', 'button', 'canvas', 'iframe', 'img', 'input', 'object', 'option', 'pre', 'script', 'select', 'style', 'textarea',
    'video'
]);


// The element model HTML tags whose headers don't start a section
const nestedTags = new Set(['blockquote', 'li', 'td', 'th']);


// Matches a header tag
const rHeaderTag = /^h[1-6]$/;


// Matches text with something to read aloud - PicoVox speaks English text
const rSpeakable = /[A-Za-z0-9]/;


// Matches text that ends with punctuation (closing quotes and parentheses allowed)
const rTextEnd = /[.!?:;,]["')”’]*$/;


/**
 * A paragraph of text to read aloud
 *
 * @typedef {Object} VoiceParagraph
 * @property {string} text - The paragraph's text
 * @property {boolean} section - If true, the paragraph starts a section (it's a top-level header)
 *
 * @ignore
 */


/**
 * Get an element model's paragraphs to read aloud. Code blocks, images, graphics, and controls are skipped. Each table
 * row is a paragraph of its cells' texts as sentences. A header that isn't within a list, a block quote, or a table
 * starts a section.
 *
 * @param {?(Object|Array)} elements - The element model
 * @param {boolean} [skipNavigation = false] - If true, skip the paragraphs above the first section whose text is all
 *     links (e.g., a page's navigation links)
 * @returns {Object[]} The array of [paragraphs]{@link module:lib/voice~VoiceParagraph}
 *
 * @ignore
 */
export function voiceElementsParagraphs(elements, skipNavigation = false) {
    const state = {'paragraphs': [], 'parts': [], 'linkOnly': true, 'section': false};
    elementsParagraphs(state, elements, false, false);
    paragraphEnd(state);

    // Skip the link-only paragraphs above the first section?
    const {paragraphs} = state;
    const ixSection = (skipNavigation ? paragraphs.findIndex((paragraph) => paragraph.section) : -1);
    return paragraphs.
        filter((paragraph, ixParagraph) => !(ixParagraph < ixSection && paragraph.linkOnly)).
        map(({text, section}) => ({text, section}));
}


// Helper to add an element model's text to its paragraphs
function elementsParagraphs(state, elements, inLink, nested) {
    // Ignore non-objects
    if (elements === null || typeof elements !== 'object') {
        return;
    }

    // Array?
    if (Array.isArray(elements)) {
        for (const childElements of elements) {
            elementsParagraphs(state, childElements, inLink, nested);
        }
        return;
    }

    // Text?
    if ('text' in elements) {
        const text = String(elements.text);
        state.parts.push(text);
        if (!inLink && rSpeakable.test(text)) {
            state.linkOnly = false;
        }
        return;
    }

    // Graphics (and anything else that isn't HTML) aren't read aloud
    if (typeof elements.html !== 'string') {
        return;
    }
    const tag = elements.html.toLowerCase();
    const elem = elements.elem ?? null;
    const href = (elements.attr ?? null) !== null ? (elements.attr.href ?? null) : null;

    // Code blocks, images, controls, and link buttons (links without a URL) aren't read aloud
    if (skipTags.has(tag) || (tag === 'a' && href === null)) {
        return;
    }

    // A line break is a space
    if (tag === 'br') {
        state.parts.push(' ');
        return;
    }

    // Inline elements continue the paragraph
    if (inlineTags.has(tag)) {
        elementsParagraphs(state, elem, inLink || tag === 'a', nested);
        return;
    }

    // A table cell is a sentence of its row's paragraph
    if (tag === 'td' || tag === 'th') {
        const ixCell = state.parts.length;
        elementsParagraphs(state, elem, inLink, true);
        const cellText = state.parts.slice(ixCell).join('').trim();
        if (cellText !== '') {
            state.parts.push(rTextEnd.test(cellText) ? ' ' : '. ');
        }
        return;
    }

    // Any other element is a paragraph (or contains paragraphs) - a top-level header starts a section
    paragraphEnd(state);
    elementsParagraphs(state, elem, inLink, nested || nestedTags.has(tag));
    state.section = !nested && rHeaderTag.test(tag);
    paragraphEnd(state);
}


// Helper to end the paragraph being added, if any
function paragraphEnd(state) {
    const text = state.parts.join('').replace(/\s+/g, ' ').trim();
    if (rSpeakable.test(text)) {
        state.paragraphs.push({text, 'section': state.section, 'linkOnly': state.linkOnly});
    }
    state.parts = [];
    state.linkOnly = true;
    state.section = false;
}


// Load PicoVox - its synthesis module and its models - on first use
async function loadPicovox() {
    const synthesis = await import('../picovox/lib/synthesis.js');
    const loadModel = synthesis.modelLoader(
        () => import('../picovox/lib/models/g2pModel.js'),
        () => import('../picovox/lib/models/voiceModel.js')
    );
    const model = await loadModel();
    return {
        'voices': synthesis.voiceTable.map(({key, label, sex}) => ({key, label, sex})),
        'styles': synthesis.styleTable.map(({key}) => key),
        'paragraphPause': synthesis.paragraphPause,
        'sentencePause': synthesis.sentencePause,
        'sentenceBlocks': (text, options) => synthesis.sentenceBlocks(model, text, options)
    };
}


// Get the voices in the playback's order - male and female interleaved, the default male voice first (the default
// voice), then the default female voice
function voicesInterleaved(voices) {
    // Split the voices by sex, each with its default voice first
    const defaults = [voiceDefaultMale, voiceDefaultFemale];
    const ordered = [
        ...defaults.flatMap((voiceKey) => voices.filter(({key}) => key === voiceKey)),
        ...voices.filter(({key}) => !defaults.includes(key))
    ];
    const females = ordered.filter(({sex}) => sex === 'female');
    const males = ordered.filter(({sex}) => sex !== 'female');

    // Interleave the male and female voices
    const interleaved = [];
    for (let ixVoice = 0; ixVoice < males.length || ixVoice < females.length; ixVoice++) {
        interleaved.push(...males.slice(ixVoice, ixVoice + 1), ...females.slice(ixVoice, ixVoice + 1));
    }
    return interleaved;
}


// The paragraphs' sentences to speak - until the text is final, its last sentence may be incomplete, so it's held back
function playbackSentences(paragraphs, final) {
    const sentences = [];
    for (const paragraph of paragraphs) {
        let sectionStart = paragraph.section;
        for (const {text, paragraphStart} of splitSentences(paragraph.text)) {
            sentences.push({text, paragraphStart, sectionStart});
            sectionStart = false;
        }
    }
    return final ? sentences : sentences.slice(0, -1);
}


// The pause before a sentence (s) - none before the first sentence played, so that speech starts at once
function sentencePause(picovox, sentence, isFirst) {
    if (isFirst) {
        return 0;
    }
    return sentence.paragraphStart ? picovox.paragraphPause : picovox.sentencePause;
}


// A sentence's words, for comparing sentences - a sentence's punctuation may change as its text grows (e.g., Markdown
// emphasis spanning sentences is literal until it's closed)
function sentenceWords(sentence) {
    return sentence.text.replace(/[^\p{L}\p{N}]+/gu, '');
}


// The sentence indexes that skip back and skip forward move to - the sections' first sentences (the text's first
// sentence starts one) or, if the text isn't in sections, the paragraphs' first sentences
function skipStarts(sentences) {
    const sectionStarts = sentences.flatMap(({sectionStart}, ixSentence) => (ixSentence === 0 || sectionStart ? [ixSentence] : []));
    if (sectionStarts.length > 1) {
        return sectionStarts;
    }
    return sentences.flatMap(({paragraphStart}, ixSentence) => (paragraphStart ? [ixSentence] : []));
}


// Create a voice audio context. Where the browser has audio sessions (Safari), the page's audio is first declared
// playback audio (like a podcast's) - Web Audio is otherwise ambient audio, which an iPhone in silent mode mutes on its
// speaker.
function createAudioContext(window) {
    const audioSession = (window.navigator ?? {}).audioSession ?? null;
    if (audioSession !== null) {
        audioSession.type = 'playback';
    }
    return new window.AudioContext({'sampleRate': voiceSampleRate});
}


// The next task - a promise resolved by a message to the page itself (a timer would be throttled in background tabs)
function nextTask() {
    return new Promise((resolve) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = () => {
            channel.port1.close();
            resolve();
        };
        channel.port2.postMessage(null);
    });
}


// Wait for a run's event - a scheduled block ending, the text changing, or the run stopping
function runWait(run) {
    return new Promise((resolve) => {
        run.waiting.push(resolve);
    });
}


// Wake a run's waiters
function runWake(run) {
    for (const resolve of run.waiting.splice(0)) {
        resolve();
    }
}


/**
 * The MarkdownUp voice playback - at most one playback at a time
 *
 * @property {Object} window - The web browser window object
 * @property {function} onChange - The playback change callback, called when the playback's state changes
 * @property {?string} voice - The preferred voice key (null is the default voice)
 * @property {number} rate - The speaking rate, from 0.5 to 2 (1 is normal)
 *
 * @ignore
 */
export class MarkdownUpVoice {
    /**
     * @param {Object} window - The web browser window object
     * @param {function} onChange - The playback change callback, called when the playback's state changes
     */
    constructor(window, onChange) {
        this.window = window;
        this.onChange = onChange;
        this.voice = null;
        this.rate = 1;

        // PicoVox, loaded on first use - {voices, styles, paragraphPause, sentencePause, sentenceBlocks}
        this.loadFn = loadPicovox;
        this.loading = null;
        this.picovox = null;
        this.voicesOrdered = null;

        // The audio context, created on first playback (from a user gesture, so the browser lets the audio start)
        this.audioContext = null;

        // The playback, if any - {key, final, sentences, position (the sentence index to play from), playing,
        // run (the active synthesis run, or null)}
        this.playback = null;

        // The voice lines that are playing - each {sources, done, stopped} - and their audio context (the playback's is
        // suspended when the playback is paused), created on first use
        this.lines = new Set();
        this.lineAudioContext = null;
    }


    // Load PicoVox, once - a failed load is retried on the next call
    load() {
        if (this.loading === null) {
            this.loading = this.loadFn().then((picovox) => {
                this.picovox = picovox;
                this.voicesOrdered = voicesInterleaved(picovox.voices);
                this.onChange();
                return picovox;
            });
            this.loading.catch(() => {
                this.loading = null;
            });
        }
        return this.loading;
    }


    // Get the playback's voice key - the preferred voice, if it's a voice (it's unknown until PicoVox loads)
    voiceKey() {
        const {voice, voicesOrdered} = this;
        if (voicesOrdered === null) {
            return voice ?? voiceDefaultMale;
        }
        return (voicesOrdered.find(({key}) => key === voice) ?? voicesOrdered[0]).key;
    }


    // Get the playback's voice label
    voiceLabel() {
        const voiceKey = this.voiceKey();
        const voiceInfo = (this.voicesOrdered ?? []).find(({key}) => key === voiceKey) ?? null;
        const voiceLabel = (voiceInfo !== null ? voiceInfo.label : `${voiceKey.slice(0, 1).toUpperCase()}${voiceKey.slice(1)}`);
        return voiceLabels[voiceKey] ?? voiceLabel;
    }


    // Get the voice key after the playback's voice (wraps to the first voice) - null until PicoVox loads
    voiceNext() {
        const {voicesOrdered} = this;
        if (voicesOrdered === null) {
            return null;
        }
        const voiceKey = this.voiceKey();
        const ixVoice = voicesOrdered.findIndex(({key}) => key === voiceKey);
        return voicesOrdered[(ixVoice + 1) % voicesOrdered.length].key;
    }


    // Get the speaking rate after the playback's rate (wraps to the first rate)
    rateNext() {
        return voiceRates[(voiceRates.indexOf(this.rate) + 1) % voiceRates.length];
    }


    // Get the playback state - {key, playing} - or null if there's no playback
    state() {
        const {playback} = this;
        return playback !== null ? {'key': playback.key, 'playing': playback.playing} : null;
    }


    // Start reading paragraphs aloud (from a user gesture, so the browser lets the audio start), closing any playback
    speak(paragraphs, final, key) {
        this.runStop();
        if (this.audioContext === null) {
            this.audioContext = createAudioContext(this.window);
        }
        this.audioContext.resume();
        this.playback = {key, final, 'sentences': playbackSentences(paragraphs, final), 'position': 0, 'playing': true, 'run': null};
        this.runStart();
        this.onChange();
    }


    // Set the playback's paragraphs - its text grows as it plays (if the words that have already played change, the
    // playback starts again from the beginning)
    setText(paragraphs, final) {
        const {playback} = this;
        if (playback === null) {
            return;
        }

        // Has the text that's already played changed? Has the text that's scheduled to play?
        const {run} = playback;
        const sentences = playbackSentences(paragraphs, final);
        const ixSentence = this.playbackSentence();
        const isChanged = (ix) => ix >= sentences.length || sentenceWords(sentences[ix]) !== sentenceWords(playback.sentences[ix]);
        let playedChanged = false;
        for (let ix = 0; ix < ixSentence && !playedChanged; ix++) {
            playedChanged = isChanged(ix);
        }
        const scheduledChanged = run !== null && run.starts.some(([ixStarted]) => ixStarted >= ixSentence && isChanged(ixStarted));

        // Update the text - if the text that's already played changed, start again from the beginning; if the text
        // that's scheduled to play changed, continue from the sentence that's playing
        playback.final = final;
        playback.sentences = sentences;
        if (playedChanged) {
            this.playbackSeek(0);
        } else if (scheduledChanged) {
            this.playbackSeek(ixSentence);
        } else if (run !== null) {
            runWake(run);
        }
    }


    // Close the playback, if any
    close() {
        if (this.playback !== null) {
            this.runStop();
            this.playback = null;
            this.audioContext.suspend();
            this.onChange();
        }
    }


    // Play (resume) the playback
    play() {
        const {playback} = this;
        if (playback !== null && !playback.playing) {
            playback.playing = true;
            this.audioContext.resume();
            if (playback.run === null) {
                this.runStart();
            }
            this.onChange();
        }
    }


    // Pause the playback
    pause() {
        const {playback} = this;
        if (playback !== null && playback.playing) {
            playback.playing = false;
            this.audioContext.suspend();
            this.onChange();
        }
    }


    // Move the playback back to the beginning
    rewind() {
        if (this.playback !== null) {
            this.playbackSeek(0);
        }
    }


    // Move the playback back to the start of the section - or, near the section's start, to the start of the previous
    // section
    skipBack() {
        const {playback} = this;
        if (playback === null || playback.sentences.length === 0) {
            return;
        }
        const {sentences, run} = playback;
        const starts = skipStarts(sentences);
        const ixSentence = this.playbackSentence();

        // Past the end of the text? Back to the start of the last section.
        if (ixSentence >= sentences.length) {
            this.playbackSeek(starts[starts.length - 1]);
            return;
        }

        // Near the start of the section? Back to the start of the previous section.
        const ixStart = starts.findLastIndex((start) => start <= ixSentence);
        const start = starts[ixStart];
        const startTime = run !== null ? (run.starts.find(([ixStarted]) => ixStarted === start) ?? [])[1] : undefined;
        const isNearStart = ixSentence === start &&
            (startTime === undefined || this.audioContext.currentTime - startTime < skipBackSeconds);
        this.playbackSeek(isNearStart && ixStart > 0 ? starts[ixStart - 1] : start);
    }


    // Move the playback forward to the start of the next section, if there is one
    skipForward() {
        const {playback} = this;
        if (playback === null) {
            return;
        }
        const ixSentence = this.playbackSentence();
        const ixNext = skipStarts(playback.sentences).find((start) => start > ixSentence);
        if (ixNext !== undefined) {
            this.playbackSeek(ixNext);
        }
    }


    // Set the voice - the playback, if any, continues with it
    setVoice(voice) {
        if (voice !== this.voice) {
            this.voice = voice;
            if (this.playback !== null) {
                this.playbackSeek(this.playbackSentence());
            }
            this.onChange();
        }
    }


    // Set the speaking rate - the playback, if any, continues at it
    setRate(rate) {
        if (rate !== this.rate) {
            this.rate = rate;
            if (this.playback !== null) {
                this.playbackSeek(this.playbackSentence());
            }
            this.onChange();
        }
    }


    // Get the voice lines' audio context, creating (and starting) it on first use. A browser may not let audio start
    // until the user interacts with the page, so the context is resumed when they do.
    lineContext() {
        if (this.lineAudioContext === null) {
            const audioContext = createAudioContext(this.window);
            this.lineAudioContext = audioContext;
            const resume = () => {
                if (audioContext.state !== 'running') {
                    audioContext.resume();
                }
            };
            resume();
            for (const eventType of ['pointerdown', 'pointerup', 'keydown']) {
                this.window.addEventListener(eventType, resume);
            }
        }
        return this.lineAudioContext;
    }


    // Prepare for voice lines (and voice playback) - load PicoVox and start the voice lines' audio context - so that
    // the first line starts at once
    prepare() {
        this.lineContext();
        this.load().catch(() => null);
    }


    // Test whether voice lines can be heard - the browser has let their audio start
    ready() {
        return this.lineContext().state === 'running';
    }


    // Say a line of text aloud, over any other lines - in a voice (null is the default voice), a speaking style, and
    // at a speaking rate. An unknown voice is the default voice and an unknown style is the default style.
    say(text, voice, style, rate) {
        const line = {'sources': new Set(), 'done': false, 'stopped': false};
        this.lines.add(line);
        this.linePlay(line, this.lineContext(), text, voice, style, rate).catch((error) => {
            this.window.console.error(`MarkdownUp: Voice line failed: ${error}`);
        }).then(() => {
            // The line ends when its audio does
            line.done = true;
            if (line.sources.size === 0) {
                this.lines.delete(line);
            }
        });
    }


    // Stop the voice lines
    sayStop() {
        for (const line of this.lines) {
            line.stopped = true;
            for (const source of line.sources) {
                source.onended = null;
                source.stop();
            }
            line.sources.clear();
        }
        this.lines.clear();
    }


    // Synthesize and schedule a voice line's sentences, a block at a time (yielding to the page after each)
    async linePlay(line, audioContext, text, voice, style, rate) {
        // Wait for the audio context to run - a line that can't be heard is dropped
        const picovox = await this.load();
        await Promise.race([
            audioContext.resume(),
            new Promise((resolve) => {
                this.window.setTimeout(resolve, lineStartMs);
            })
        ]);
        if (line.stopped || audioContext.state !== 'running') {
            return;
        }

        // Synthesize and schedule the sentences' blocks
        const {voicesOrdered} = this;
        const blockOptions = {
            'voice': (voicesOrdered.find(({key}) => key === voice) ?? voicesOrdered[0]).key,
            'style': picovox.styles.includes(style) ? style : voiceDefaultStyle,
            rate,
            'sampleRate': voiceSampleRate
        };
        let time = 0;
        for (const [ixSentence, sentence] of splitSentences(text).entries()) {
            blockOptions.seed = playbackSeed + ixSentence;
            blockOptions.pause = sentencePause(picovox, sentence, ixSentence === 0);
            for (const block of picovox.sentenceBlocks(speechText(sentence.text), {...blockOptions})) {
                if (line.stopped) {
                    return;
                }
                const buffer = audioContext.createBuffer(1, block.length, voiceSampleRate);
                buffer.copyToChannel(block, 0);
                const source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContext.destination);
                source.onended = () => {
                    line.sources.delete(source);
                    if (line.done && line.sources.size === 0) {
                        this.lines.delete(line);
                    }
                };
                time = Math.max(time, audioContext.currentTime + playbackLead);
                line.sources.add(source);
                source.start(time);
                time += block.length / voiceSampleRate;
                await nextTask();
            }
        }
    }


    // The index of the sentence that's playing (or that's next to play)
    playbackSentence() {
        const {run, position} = this.playback;
        if (run === null) {
            return position;
        }
        let sentence = run.position;
        for (const [ixSentence, startTime] of run.starts) {
            if (startTime <= this.audioContext.currentTime) {
                sentence = ixSentence;
            }
        }
        return sentence;
    }


    // Move the playback to a sentence - playing from there if it's playing, otherwise when it plays
    playbackSeek(position) {
        this.runStop();
        this.playback.position = position;
        if (this.playback.playing) {
            this.runStart();
        }
    }


    // Start a synthesis run at the playback's position
    runStart() {
        const {playback} = this;
        const run = {'position': playback.position, 'starts': [], 'sources': new Set(), 'waiting': [], 'stopped': false};
        playback.run = run;
        this.runPlay(playback, run).catch((error) => {
            // Synthesis failed - stop the playback
            if (!run.stopped) {
                this.window.console.error(`MarkdownUp: Voice playback failed: ${error}`);
                this.runStop();
                playback.playing = false;
                this.audioContext.suspend();
                this.onChange();
            }
        });
    }


    // Stop the playback's synthesis run, if any
    runStop() {
        const run = this.playback !== null ? this.playback.run : null;
        if (run !== null) {
            run.stopped = true;
            for (const source of run.sources) {
                source.onended = null;
                source.stop();
            }
            run.sources.clear();
            runWake(run);
            this.playback.run = null;
        }
    }


    // Synthesize and schedule the playback's sentences, a block at a time (yielding to the page after each), staying at
    // most a few seconds ahead of playback
    async runPlay(playback, run) {
        const {audioContext} = this;
        const picovox = await this.load();
        let time = 0;
        let ixSentence = run.position;
        while (!run.stopped) {
            // Wait for the sentence's text - while its earlier audio plays, or for the first sentence of the run
            while (!run.stopped && ixSentence >= playback.sentences.length && !playback.final &&
                   (run.sources.size > 0 || run.starts.length === 0)) {
                await runWait(run);
            }
            if (run.stopped || ixSentence >= playback.sentences.length) {
                break;
            }

            // Synthesize and schedule the sentence's blocks
            const sentence = playback.sentences[ixSentence];
            const blockOptions = {
                'voice': this.voiceKey(),
                'rate': this.rate,
                'seed': playbackSeed + ixSentence,
                'pause': sentencePause(picovox, sentence, ixSentence === run.position),
                'sampleRate': voiceSampleRate
            };
            let isFirstBlock = true;
            for (const block of picovox.sentenceBlocks(speechText(sentence.text), blockOptions)) {
                if (run.stopped) {
                    return;
                }
                const buffer = audioContext.createBuffer(1, block.length, voiceSampleRate);
                buffer.copyToChannel(block, 0);
                const source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContext.destination);
                source.onended = () => {
                    run.sources.delete(source);
                    runWake(run);
                };
                time = Math.max(time, audioContext.currentTime + playbackLead);
                if (isFirstBlock) {
                    run.starts.push([ixSentence, time]);
                    isFirstBlock = false;
                }
                run.sources.add(source);
                source.start(time);
                time += block.length / voiceSampleRate;
                await nextTask();
                while (!run.stopped && time - audioContext.currentTime > playbackAhead) {
                    await runWait(run);
                }
            }
            ixSentence += 1;
        }

        // Wait for the scheduled audio to end
        while (!run.stopped && run.sources.size > 0) {
            await runWait(run);
        }
        if (run.stopped) {
            return;
        }

        // The end of the text - if it's final, the playback ends (back at the start); otherwise, it pauses
        playback.run = null;
        playback.position = (playback.final ? 0 : ixSentence);
        playback.playing = false;
        audioContext.suspend();
        this.onChange();
    }
}
