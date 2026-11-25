// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import {MarkdownUpVoice, voiceElementsParagraphs, voiceRates} from '../lib/voice.js';
import {MockAudioContext, flushTasks, mockPicovox} from './voiceMock.js';
import {markdownElements, markdownParse} from 'bare-script/lib/include.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';


// Helper to create a test voice playback - with a mock audio context and a mock PicoVox
function testVoice(blocks = 1) {
    const errors = [];
    const listeners = {};
    const window = {
        'AudioContext': MockAudioContext,
        'addEventListener': (type, listener) => {
            listeners[type] = listener;
        },
        'console': {
            'error': (message) => {
                errors.push(message);
            }
        },
        'setTimeout': (callback) => setTimeout(callback, 0)
    };
    const changes = [];
    const voice = new MarkdownUpVoice(window, () => {
        changes.push(voice.state());
    });
    const picovox = mockPicovox(blocks);
    voice.loadFn = () => Promise.resolve(picovox);
    return {voice, changes, errors, listeners, picovox};
}


// Helper to end the audio of an audio context's sources that are playing
function endSources(audioContext, currentTime) {
    audioContext.currentTime = currentTime;
    for (const source of audioContext.sources) {
        if (source.onended !== null && !source.stopped && source.startTime < currentTime) {
            const {onended} = source;
            source.onended = null;
            onended();
        }
    }
}


// The test text in sections - the sentence indexes 0 and 1, 2 (a section), 3 and 4, 5 (a section), and 6
const sectionParagraphs = [
    {'text': 'Intro one. Intro two.', 'section': false},
    {'text': 'First Section', 'section': true},
    {'text': 'Body one. Body two.', 'section': false},
    {'text': 'Second Section', 'section': true},
    {'text': 'Body three.', 'section': false}
];


//
// voiceElementsParagraphs
//


test('voiceElementsParagraphs, markdown', () => {
    const elements = markdownElements(markdownParse(`\
[Home](#home) | [Docs](#docs)

# The Title

Some *text* with a [link](#link) and \`code\`.

## The Sub-Title

- item one
- item two

  ### Not a section

> A quote

| A | B |
|---|---|
| 1 | two. |
|   | three |

~~~
code block
~~~

![alt text](image.png)

Line one\\
line two
`));
    assert.deepEqual(voiceElementsParagraphs(elements), [
        {'text': 'Home | Docs', 'section': false},
        {'text': 'The Title', 'section': true},
        {'text': 'Some text with a link and code.', 'section': false},
        {'text': 'The Sub-Title', 'section': true},
        {'text': 'item one', 'section': false},
        {'text': 'item two', 'section': false},
        {'text': 'Not a section', 'section': false},
        {'text': 'A quote', 'section': false},
        {'text': 'A. B.', 'section': false},
        {'text': '1. two.', 'section': false},
        {'text': 'three.', 'section': false},
        {'text': 'Line one line two', 'section': false}
    ]);
    assert.deepEqual(voiceElementsParagraphs(elements, true).slice(0, 2), [
        {'text': 'The Title', 'section': true},
        {'text': 'Some text with a link and code.', 'section': false}
    ]);
});


test('voiceElementsParagraphs, element model', () => {
    const elements = [
        null,
        'ignored',
        {'text': 7},
        {'text': ' days'},
        {'html': 'div', 'elem': [
            {'html': 'a', 'attr': {'href': '#next'}, 'elem': {'text': 'Next'}},
            {'text': ' - '},
            {'html': 'A', 'attr': {'href': '#prev'}, 'elem': {'html': 'b', 'elem': {'text': 'Previous'}}}
        ]},
        {'html': 'p', 'elem': [
            {'html': 'a', 'attr': {'href': '#more'}, 'elem': {'text': 'More'}},
            {'text': ' text'}
        ]},
        {'html': 'p', 'elem': [
            {'text': 'Click '},
            {'html': 'a', 'elem': {'text': 'the link button'}},
            {'html': 'a', 'attr': {'style': 'cursor: pointer;'}, 'elem': {'text': 'the other link button'}},
            {'html': 'button', 'elem': {'text': 'the button'}},
            {'html': 'input', 'attr': {'value': 'the input'}},
            {'text': 'here'},
            {'svg': 'svg', 'elem': {'svg': 'text', 'elem': {'text': 'the drawing'}}},
            {'html': 'br'},
            {'text': 'now'}
        ]},
        {'html': 'p', 'elem': {'text': ' ... '}},
        {'html': 'p', 'elem': {'text': '\u041f\u0440\u0438\u0432\u0435\u0442, \u043c\u0438\u0440'}},
        {'html': 'p'},
        {'html': 'h2', 'attr': null, 'elem': {'text': 'Header'}},
        {'html': 'p', 'elem': {'html': 'a', 'attr': {'href': '#after'}, 'elem': {'text': 'After'}}}
    ];
    assert.deepEqual(voiceElementsParagraphs(elements), [
        {'text': '7 days', 'section': false},
        {'text': 'Next - Previous', 'section': false},
        {'text': 'More text', 'section': false},
        {'text': 'Click here now', 'section': false},
        {'text': 'Header', 'section': true},
        {'text': 'After', 'section': false}
    ]);
    assert.deepEqual(voiceElementsParagraphs(elements, true), [
        {'text': '7 days', 'section': false},
        {'text': 'More text', 'section': false},
        {'text': 'Click here now', 'section': false},
        {'text': 'Header', 'section': true},
        {'text': 'After', 'section': false}
    ]);
});


test('voiceElementsParagraphs, no sections', () => {
    const elements = [
        {'html': 'p', 'elem': {'html': 'a', 'attr': {'href': '#next'}, 'elem': {'text': 'Next'}}},
        {'html': 'p', 'elem': {'text': 'Hello!'}}
    ];
    assert.deepEqual(voiceElementsParagraphs(elements, true), [
        {'text': 'Next', 'section': false},
        {'text': 'Hello!', 'section': false}
    ]);
    assert.deepEqual(voiceElementsParagraphs(null, true), []);
});


//
// MarkdownUpVoice
//


test('MarkdownUpVoice, speak', async () => {
    const {voice, changes, errors, picovox} = testVoice();
    assert.equal(voice.state(), null);
    assert.equal(voice.audioContext, null);

    // Start reading aloud
    voice.speak([{'text': 'Hello there. How are you?', 'section': false}, {'text': 'Good.', 'section': false}], true, 'key1');
    const {audioContext} = voice;
    assert.deepEqual(audioContext.options, {'sampleRate': 24000});
    assert.deepEqual(audioContext.calls, ['resume']);
    assert.deepEqual(voice.state(), {'key': 'key1', 'playing': true});
    assert.deepEqual(changes, [{'key': 'key1', 'playing': true}]);

    // The sentences are synthesized and scheduled
    await flushTasks();
    assert.deepEqual(changes, [{'key': 'key1', 'playing': true}, {'key': 'key1', 'playing': true}]);
    assert.deepEqual(picovox.calls, [
        ['Hello there.', {'voice': 'michael', 'rate': 1, 'seed': 1000, 'pause': 0, 'sampleRate': 24000}],
        ['How are you?', {'voice': 'michael', 'rate': 1, 'seed': 1001, 'pause': 0.24, 'sampleRate': 24000}],
        ['Good.', {'voice': 'michael', 'rate': 1, 'seed': 1002, 'pause': 0.4, 'sampleRate': 24000}]
    ]);
    assert.deepEqual(audioContext.sources.map((source) => source.startTime), [0.05, 1.05, 2.05]);
    assert.deepEqual(audioContext.sources.map((source) => source.buffer.block.length), [24000, 24000, 24000]);
    assert.deepEqual(voice.playback.run.starts, [[0, 0.05], [1, 1.05], [2, 2.05]]);
    assert.equal(voice.playbackSentence(), 0);
    audioContext.currentTime = 1.5;
    assert.equal(voice.playbackSentence(), 1);

    // The audio ends - the playback ends, back at the start
    endSources(audioContext, 3.5);
    await flushTasks();
    assert.deepEqual(voice.state(), {'key': 'key1', 'playing': false});
    assert.deepEqual(audioContext.calls, ['resume', 'suspend']);
    assert.equal(voice.playback.run, null);
    assert.equal(voice.playback.position, 0);
    assert.equal(voice.playbackSentence(), 0);
    assert.equal(changes.length, 3);

    // Play again
    voice.play();
    assert.deepEqual(voice.state(), {'key': 'key1', 'playing': true});
    assert.deepEqual(audioContext.calls, ['resume', 'suspend', 'resume']);
    assert.equal(changes.length, 4);
    await flushTasks();
    assert.equal(audioContext.sources.length, 6);
    assert.equal(picovox.calls.length, 6);

    // Speak again - the playback is replaced
    voice.speak([{'text': 'Bye.', 'section': false}], true, null);
    assert.equal(voice.audioContext, audioContext);
    assert.deepEqual(audioContext.sources.map((source) => source.stopped), [false, false, false, true, true, true]);
    assert.deepEqual(voice.state(), {'key': null, 'playing': true});
    await flushTasks();
    assert.equal(picovox.calls.length, 7);
    assert.equal(picovox.calls[6][0], 'Bye.');

    // Close the playback
    voice.close();
    assert.equal(voice.state(), null);
    assert.equal(audioContext.sources[6].stopped, true);
    assert.equal(audioContext.calls[audioContext.calls.length - 1], 'suspend');
    assert.equal(changes[changes.length - 1], null);
    await flushTasks();
    assert.deepEqual(errors, []);
});


test('MarkdownUpVoice, no playback', () => {
    const {voice, changes} = testVoice();
    voice.setText([{'text': 'Hello.', 'section': false}], true);
    voice.close();
    voice.play();
    voice.pause();
    voice.rewind();
    voice.skipBack();
    voice.skipForward();
    assert.equal(voice.state(), null);
    assert.equal(voice.audioContext, null);
    assert.deepEqual(changes, []);

    // Setting the voice and the speaking rate
    voice.setVoice(null);
    voice.setRate(1);
    assert.deepEqual(changes, []);
    voice.setVoice('sarah');
    voice.setRate(1.5);
    assert.equal(voice.voice, 'sarah');
    assert.equal(voice.rate, 1.5);
    assert.deepEqual(changes, [null, null]);
});


test('MarkdownUpVoice, voices', async () => {
    const {voice} = testVoice();

    // Before PicoVox loads
    assert.equal(voice.voiceKey(), 'michael');
    assert.equal(voice.voiceLabel(), 'Michael');
    assert.equal(voice.voiceNext(), null);
    voice.voice = 'female';
    assert.equal(voice.voiceKey(), 'female');
    assert.equal(voice.voiceLabel(), 'Mary');

    // After PicoVox loads - the voices are male and female interleaved, the default voices first
    await voice.load();
    assert.deepEqual(voice.voicesOrdered.map(({key}) => key), ['michael', 'sarah', 'male', 'female', 'james']);
    assert.equal(voice.voiceKey(), 'female');
    assert.equal(voice.voiceLabel(), 'Mary');
    assert.equal(voice.voiceNext(), 'james');
    voice.voice = 'james';
    assert.equal(voice.voiceLabel(), 'James');
    assert.equal(voice.voiceNext(), 'michael');
    voice.voice = 'male';
    assert.equal(voice.voiceLabel(), 'John');
    assert.equal(voice.voiceNext(), 'female');

    // An unknown voice is the default voice
    voice.voice = 'unknown';
    assert.equal(voice.voiceKey(), 'michael');
    assert.equal(voice.voiceLabel(), 'Michael');
    assert.equal(voice.voiceNext(), 'sarah');
    voice.voice = null;
    assert.equal(voice.voiceKey(), 'michael');

    // The speaking rates
    assert.deepEqual(voiceRates, [0.8, 1, 1.1, 1.2, 1.5]);
    assert.equal(voice.rateNext(), 1.1);
    voice.rate = 1.5;
    assert.equal(voice.rateNext(), 0.8);
    voice.rate = 0.9;
    assert.equal(voice.rateNext(), 0.8);
});


test('MarkdownUpVoice, synthesis ahead of playback', async () => {
    const {voice, picovox} = testVoice();
    const paragraphs = [{'text': 'One. Two. Three. Four. Five. Six. Seven.', 'section': false}];
    voice.speak(paragraphs, true, null);
    const {audioContext} = voice;

    // Synthesis runs at most a few seconds ahead of playback
    await flushTasks();
    assert.equal(picovox.calls.length, 4);
    assert.deepEqual(audioContext.sources.map((source) => source.startTime), [0.05, 1.05, 2.05, 3.05]);

    // As the audio plays, more is synthesized
    endSources(audioContext, 1.1);
    await flushTasks();
    assert.equal(picovox.calls.length, 6);
    endSources(audioContext, 3.1);
    await flushTasks();
    assert.equal(picovox.calls.length, 7);
    assert.equal(voice.playbackSentence(), 3);

    // Pause and play
    voice.pause();
    assert.deepEqual(voice.state(), {'key': null, 'playing': false});
    assert.deepEqual(audioContext.calls, ['resume', 'suspend']);
    voice.pause();
    assert.deepEqual(audioContext.calls, ['resume', 'suspend']);
    voice.play();
    assert.deepEqual(voice.state(), {'key': null, 'playing': true});
    assert.deepEqual(audioContext.calls, ['resume', 'suspend', 'resume']);
    voice.play();
    assert.deepEqual(audioContext.calls, ['resume', 'suspend', 'resume']);
    assert.equal(picovox.calls.length, 7);

    // Set the speaking rate - the playback continues at it
    voice.setRate(1.5);
    await flushTasks();
    assert.equal(voice.playback.run.position, 3);
    assert.deepEqual(picovox.calls[7], ['Four.', {'voice': 'michael', 'rate': 1.5, 'seed': 1003, 'pause': 0, 'sampleRate': 24000}]);

    // Set the voice - the playback continues with it
    voice.setVoice('sarah');
    await flushTasks();
    assert.equal(voice.playback.run.position, 3);
    const {calls} = picovox;
    assert.deepEqual(calls[calls.length - 1][1], {'voice': 'sarah', 'rate': 1.5, 'seed': 1006, 'pause': 0.24, 'sampleRate': 24000});

    // Rewind
    voice.rewind();
    assert.equal(voice.playback.run.position, 0);
    voice.close();
    await flushTasks();
});


test('MarkdownUpVoice, skip by section', async () => {
    const {voice, picovox} = testVoice();
    voice.speak(sectionParagraphs, true, null);
    const {audioContext} = voice;
    await flushTasks();
    assert.equal(picovox.calls.length, 4);
    assert.deepEqual(voice.playback.sentences, [
        {'text': 'Intro one.', 'paragraphStart': true, 'sectionStart': false},
        {'text': 'Intro two.', 'paragraphStart': false, 'sectionStart': false},
        {'text': 'First Section', 'paragraphStart': true, 'sectionStart': true},
        {'text': 'Body one.', 'paragraphStart': true, 'sectionStart': false},
        {'text': 'Body two.', 'paragraphStart': false, 'sectionStart': false},
        {'text': 'Second Section', 'paragraphStart': true, 'sectionStart': true},
        {'text': 'Body three.', 'paragraphStart': true, 'sectionStart': false}
    ]);

    // Skip forward to the first section
    voice.skipForward();
    assert.equal(voice.playback.run.position, 2);
    assert.deepEqual(audioContext.sources.map((source) => source.stopped), [true, true, true, true]);

    // Skip back before the section's audio is scheduled - back to the previous section
    voice.skipBack();
    assert.equal(voice.playback.run.position, 0);
    voice.skipForward();
    await flushTasks();
    assert.equal(voice.playback.run.position, 2);
    assert.equal(picovox.calls[picovox.calls.length - 4][0], 'First Section');

    // Skip back near the section's start - back to the previous section
    assert.deepEqual(voice.playback.run.starts[0], [2, 0.05]);
    audioContext.currentTime = 0.5;
    voice.skipBack();
    assert.equal(voice.playback.run.position, 0);

    // Skip back at the text's start - back to the text's start
    voice.skipBack();
    assert.equal(voice.playback.run.position, 0);

    // Skip back within a section - back to the section's start
    voice.skipForward();
    await flushTasks();
    assert.deepEqual(voice.playback.run.starts, [[2, 0.55], [3, 1.55], [4, 2.55], [5, 3.55]]);
    audioContext.currentTime = 2;
    assert.equal(voice.playbackSentence(), 3);
    voice.skipBack();
    assert.equal(voice.playback.run.position, 2);

    // Skip forward to the last section - there's no section to skip forward to
    voice.skipForward();
    assert.equal(voice.playback.run.position, 5);
    voice.skipForward();
    assert.equal(voice.playback.run.position, 5);

    // Skip while paused
    voice.pause();
    voice.skipBack();
    assert.equal(voice.playback.run, null);
    assert.equal(voice.playback.position, 2);
    voice.skipBack();
    assert.equal(voice.playback.position, 0);
    voice.skipForward();
    assert.equal(voice.playback.position, 2);
    voice.close();
    await flushTasks();
});


test('MarkdownUpVoice, skip back long after the section start', async () => {
    const {voice} = testVoice(3);
    voice.speak(sectionParagraphs, true, null);
    const {audioContext} = voice;
    voice.skipForward();
    await flushTasks();
    assert.deepEqual(voice.playback.run.starts, [[2, 0.05], [3, 3.05]]);

    // Skip back long after the section's start - back to the section's start
    audioContext.currentTime = 2.5;
    assert.equal(voice.playbackSentence(), 2);
    voice.skipBack();
    assert.equal(voice.playback.run.position, 2);
    voice.close();
    await flushTasks();
});


test('MarkdownUpVoice, skip by paragraph', async () => {
    const {voice} = testVoice();
    const paragraphs = [
        {'text': 'The Title', 'section': true},
        {'text': 'One one. One two.', 'section': false},
        {'text': 'Two one. Two two.', 'section': false}
    ];
    voice.speak(paragraphs, true, null);
    await flushTasks();

    // Text with fewer than two sections is skipped by paragraph
    voice.skipForward();
    assert.equal(voice.playback.run.position, 1);
    voice.skipForward();
    assert.equal(voice.playback.run.position, 3);
    voice.skipForward();
    assert.equal(voice.playback.run.position, 3);
    voice.skipBack();
    assert.equal(voice.playback.run.position, 1);
    voice.close();
    await flushTasks();
});


test('MarkdownUpVoice, growing text', async () => {
    const {voice, changes, picovox} = testVoice();

    // The text's last sentence is held back until the text is final
    voice.speak([{'text': 'One. Tw', 'section': false}], false, 'key');
    const {audioContext} = voice;
    await flushTasks();
    assert.deepEqual(picovox.calls.map(([text]) => text), ['One.']);

    // The text grows as it plays
    voice.setText([{'text': 'One. Two. Thr', 'section': false}], false);
    await flushTasks();
    assert.deepEqual(picovox.calls.map(([text]) => text), ['One.', 'Two.']);

    // Playback reaches the end of the text before it's final - it pauses
    endSources(audioContext, 2.5);
    await flushTasks();
    assert.deepEqual(voice.state(), {'key': 'key', 'playing': false});
    assert.equal(voice.playback.run, null);
    assert.equal(voice.playback.position, 2);
    assert.deepEqual(audioContext.calls, ['resume', 'suspend']);
    assert.deepEqual(changes[changes.length - 1], {'key': 'key', 'playing': false});

    // Skip back past the end of the text - back to the start of the last paragraph
    voice.setText([{'text': 'One. Two.', 'section': false}, {'text': 'Three. Fo', 'section': false}], false);
    assert.equal(voice.playbackSentence(), 2);
    voice.setText([{'text': 'One. Two.', 'section': false}, {'text': 'Thr', 'section': false}], false);
    voice.skipBack();
    assert.equal(voice.playback.position, 0);
    voice.setText([{'text': 'One. Two.', 'section': false}, {'text': 'Three. Fo', 'section': false}], false);
    voice.skipForward();
    assert.equal(voice.playback.position, 2);

    // Play - the playback waits for more text
    voice.setText([{'text': 'One. Two.', 'section': false}, {'text': 'Thr', 'section': false}], false);
    voice.play();
    await flushTasks();
    assert.deepEqual(picovox.calls.map(([text]) => text), ['One.', 'Two.']);
    assert.deepEqual(voice.state(), {'key': 'key', 'playing': true});
    voice.setText([{'text': 'One. Two.', 'section': false}, {'text': 'Three. Four.', 'section': false}], true);
    await flushTasks();
    assert.deepEqual(picovox.calls.map(([text]) => text), ['One.', 'Two.', 'Three.', 'Four.']);

    // The final text ends
    endSources(audioContext, 10);
    await flushTasks();
    assert.deepEqual(voice.state(), {'key': 'key', 'playing': false});
    assert.equal(voice.playback.position, 0);
});


test('MarkdownUpVoice, growing text changed', async () => {
    const {voice, picovox} = testVoice();
    voice.speak([{'text': 'One. Two. Three. Fo', 'section': false}], false, null);
    const {audioContext} = voice;
    await flushTasks();
    assert.deepEqual(picovox.calls.map(([text]) => text), ['One.', 'Two.', 'Three.']);

    // The punctuation of the text that's already played changes - the playback continues
    audioContext.currentTime = 2.5;
    assert.equal(voice.playbackSentence(), 2);
    voice.setText([{'text': 'One! Two. Three. Four. Fi', 'section': false}], false);
    await flushTasks();
    assert.deepEqual(picovox.calls.map(([text]) => text), ['One.', 'Two.', 'Three.', 'Four.']);

    // The words of the text that's already played change - the playback starts again from the beginning
    voice.setText([{'text': 'One. Too. Three. Four. Fi', 'section': false}], false);
    assert.equal(voice.playback.run.position, 0);
    await flushTasks();
    assert.deepEqual(picovox.calls.map(([text]) => text), ['One.', 'Two.', 'Three.', 'Four.', 'One.', 'Too.', 'Three.', 'Four.']);

    // The text that's already played is removed - the playback starts again from the beginning (when it's played)
    audioContext.currentTime = 5;
    assert.equal(voice.playbackSentence(), 2);
    voice.pause();
    voice.setText([{'text': 'One.', 'section': false}], true);
    assert.equal(voice.playback.run, null);
    assert.equal(voice.playback.position, 0);
    voice.close();
    await flushTasks();
});


test('MarkdownUpVoice, scheduled text changed', async () => {
    const {voice, picovox} = testVoice();
    voice.speak([{'text': 'One. Two. Three. Four. Five. Six. Se', 'section': false}], false, null);
    const {audioContext} = voice;
    await flushTasks();
    assert.deepEqual(picovox.calls.map(([text]) => text), ['One.', 'Two.', 'Three.', 'Four.']);
    audioContext.currentTime = 1.5;
    assert.equal(voice.playbackSentence(), 1);

    // The words of a sentence that's scheduled to play change - the playback continues from the sentence that's playing
    voice.setText([{'text': 'One. Two. Three. Fore. Five. Six. Se', 'section': false}], false);
    assert.equal(voice.playback.run.position, 1);
    assert.deepEqual(audioContext.sources.map((source) => source.stopped), [true, true, true, true]);
    await flushTasks();
    assert.deepEqual(picovox.calls.slice(4).map(([text]) => text), ['Two.', 'Three.', 'Fore.', 'Five.']);
    assert.deepEqual(voice.playback.run.starts, [[1, 1.55], [2, 2.55], [3, 3.55], [4, 4.55]]);

    // The sentences that are scheduled to play are removed - their audio is stopped
    audioContext.currentTime = 3;
    assert.equal(voice.playbackSentence(), 2);
    voice.setText([{'text': 'One. Two. Three. Fo', 'section': false}], false);
    assert.equal(voice.playback.run.position, 2);
    assert.deepEqual(audioContext.sources.map((source) => source.stopped), [true, true, true, true, true, true, true, true]);
    await flushTasks();
    assert.deepEqual(picovox.calls.slice(8).map(([text]) => text), ['Three.']);

    // The text grows again
    voice.setText([{'text': 'One. Two. Three. Four. Five. Si', 'section': false}], false);
    await flushTasks();
    assert.deepEqual(picovox.calls.slice(8).map(([text]) => text), ['Three.', 'Four.', 'Five.']);

    // The sentence that's playing is removed - the playback waits for more text
    audioContext.currentTime = 3.5;
    assert.equal(voice.playbackSentence(), 2);
    voice.setText([{'text': 'One. Two. Th', 'section': false}], false);
    assert.equal(voice.playback.run.position, 2);
    await flushTasks();
    assert.deepEqual(voice.state(), {'key': null, 'playing': true});
    assert.equal(picovox.calls.length, 11);

    // The text is final - the playback ends
    voice.setText([{'text': 'One. Two.', 'section': false}], true);
    await flushTasks();
    assert.deepEqual(voice.state(), {'key': null, 'playing': false});
    assert.equal(voice.playback.position, 0);
});


test('MarkdownUpVoice, synthesis error', async () => {
    const {voice, changes, errors, picovox} = testVoice();
    picovox.sentenceBlocks = () => {
        throw new Error('Synthesis failed');
    };
    voice.speak([{'text': 'One.', 'section': false}], true, null);
    await flushTasks();
    assert.deepEqual(errors, ['MarkdownUp: Voice playback failed: Error: Synthesis failed']);
    assert.deepEqual(voice.state(), {'key': null, 'playing': false});
    assert.equal(voice.playback.run, null);
    assert.deepEqual(voice.audioContext.calls, ['resume', 'suspend']);
    assert.deepEqual(changes[changes.length - 1], {'key': null, 'playing': false});
});


test('MarkdownUpVoice, load error', async () => {
    const {voice, errors, picovox} = testVoice();
    let loadCount = 0;
    voice.loadFn = () => {
        loadCount += 1;
        return loadCount === 1 ? Promise.reject(new Error('Load failed')) : Promise.resolve(picovox);
    };
    voice.speak([{'text': 'One.', 'section': false}], true, null);
    await flushTasks();
    assert.deepEqual(errors, ['MarkdownUp: Voice playback failed: Error: Load failed']);
    assert.deepEqual(voice.state(), {'key': null, 'playing': false});
    assert.equal(voice.voicesOrdered, null);

    // A failed load is retried
    voice.play();
    await flushTasks();
    assert.equal(loadCount, 2);
    assert.deepEqual(errors, ['MarkdownUp: Voice playback failed: Error: Load failed']);
    assert.deepEqual(picovox.calls.map(([text]) => text), ['One.']);
    voice.close();
    await flushTasks();
});


test('MarkdownUpVoice, load error after close', async () => {
    const {voice, errors} = testVoice();
    voice.loadFn = () => Promise.reject(new Error('Load failed'));
    voice.speak([{'text': 'One.', 'section': false}], true, null);
    voice.close();
    await flushTasks();
    assert.deepEqual(errors, []);
    assert.equal(voice.state(), null);
});


test('MarkdownUpVoice, close while synthesizing', async () => {
    const {voice, errors, picovox} = testVoice(3);
    voice.speak([{'text': 'One. Two.', 'section': false}], true, null);
    await voice.load();

    // Close after the first sentence's first block is scheduled
    assert.equal(voice.audioContext.sources.length, 1);
    voice.close();
    await flushTasks();
    assert.equal(picovox.calls.length, 1);
    assert.equal(voice.audioContext.sources.length, 1);
    assert.deepEqual(errors, []);
});


test('MarkdownUpVoice, close while the audio ends', async () => {
    const {voice, changes} = testVoice();
    voice.speak([{'text': 'One.', 'section': false}], true, null);
    await flushTasks();
    const changeCount = changes.length;
    voice.close();
    await flushTasks();
    assert.equal(changes.length, changeCount + 1);
    assert.equal(voice.state(), null);
});


test('MarkdownUpVoice, PicoVox', async () => {
    const window = {'AudioContext': MockAudioContext, 'console': {}};
    const voice = new MarkdownUpVoice(window, () => null);
    voice.speak([{'text': 'Hi.', 'section': false}], true, null);

    // PicoVox loads - its voices are male and female interleaved, the default voices first
    await voice.load();
    assert.deepEqual(voice.voicesOrdered.slice(0, 4).map(({key}) => key), ['michael', 'sarah', 'male', 'female']);
    assert.equal(voice.voicesOrdered.length, 12);
    assert.equal(voice.voiceLabel(), 'Michael');

    // The sentence is synthesized - its speech starts at once
    await flushTasks();
    const {sources} = voice.audioContext;
    const isSpeech = (source) => source.buffer.block.some((sample) => sample !== 0);
    assert(sources.some(isSpeech));
    assert(sources.every((source) => source.buffer.block instanceof Float32Array && source.buffer.block.length > 0));
    voice.close();
    await flushTasks();
});


test('MarkdownUpVoice, audio session', async () => {
    // Where the browser has audio sessions, the page's audio is playback audio (an iPhone in silent mode plays it)
    const {voice} = testVoice();
    const audioSession = {'type': 'auto'};
    voice.window.navigator = {audioSession};
    voice.speak([{'text': 'One.', 'section': false}], true, null);
    assert.equal(audioSession.type, 'playback');
    assert.deepEqual(voice.audioContext.options, {'sampleRate': 24000});
    voice.close();

    // The voice lines' audio is too
    const {voice: voice2} = testVoice();
    const audioSession2 = {'type': 'auto'};
    voice2.window.navigator = {'audioSession': audioSession2};
    voice2.prepare();
    assert.equal(audioSession2.type, 'playback');
    assert.deepEqual(voice2.lineAudioContext.options, {'sampleRate': 24000});

    // A browser without audio sessions
    const {voice: voice3} = testVoice();
    voice3.window.navigator = {};
    voice3.prepare();
    assert.deepEqual(voice3.lineAudioContext.options, {'sampleRate': 24000});
    await flushTasks();
});


//
// MarkdownUpVoice voice lines
//


test('MarkdownUpVoice, say', async () => {
    const {voice, changes, errors, listeners, picovox} = testVoice();
    assert.equal(voice.lineAudioContext, null);

    // Say a line
    voice.say('Hello there. How are you?', 'sarah', 'angry', 1.2);
    const audioContext = voice.lineAudioContext;
    assert.deepEqual(audioContext.options, {'sampleRate': 24000});
    assert.deepEqual(Object.keys(listeners), ['pointerdown', 'pointerup', 'keydown']);
    assert.equal(voice.lines.size, 1);
    await flushTasks();
    assert.deepEqual(picovox.calls, [
        ['Hello there.', {'voice': 'sarah', 'style': 'angry', 'rate': 1.2, 'seed': 1000, 'pause': 0, 'sampleRate': 24000}],
        ['How are you?', {'voice': 'sarah', 'style': 'angry', 'rate': 1.2, 'seed': 1001, 'pause': 0.24, 'sampleRate': 24000}]
    ]);
    assert.deepEqual(audioContext.calls, ['resume', 'resume']);
    assert.deepEqual(audioContext.sources.map((source) => source.startTime), [0.05, 1.05]);
    assert.equal(voice.lines.size, 1);
    assert.equal(voice.ready(), true);

    // The lines aren't the voice playback
    assert.equal(voice.state(), null);
    assert.equal(voice.audioContext, null);
    assert.deepEqual(changes, [null]);

    // Say another line, over the first - an unknown voice and an unknown style are the defaults
    audioContext.currentTime = 0.5;
    voice.say('Go.\n\nGo again.', 'unknown', 'unknown', 1);
    assert.equal(voice.lineAudioContext, audioContext);
    await flushTasks();
    assert.deepEqual(picovox.calls.slice(2), [
        ['Go.', {'voice': 'michael', 'style': 'neutral', 'rate': 1, 'seed': 1000, 'pause': 0, 'sampleRate': 24000}],
        ['Go again.', {'voice': 'michael', 'style': 'neutral', 'rate': 1, 'seed': 1001, 'pause': 0.4, 'sampleRate': 24000}]
    ]);
    assert.deepEqual(audioContext.sources.map((source) => source.startTime), [0.05, 1.05, 0.55, 1.55]);
    assert.equal(voice.lines.size, 2);

    // Say a line in the default voice
    voice.say('Three.', null, 'shouting', 1);
    await flushTasks();
    assert.deepEqual(
        picovox.calls[4],
        ['Three.', {'voice': 'michael', 'style': 'shouting', 'rate': 1, 'seed': 1000, 'pause': 0, 'sampleRate': 24000}]
    );
    assert.equal(voice.lines.size, 3);

    // The lines end as their audio ends - the second line's second sentence is still playing
    endSources(audioContext, 1.2);
    assert.equal(voice.lines.size, 1);
    endSources(audioContext, 3);
    assert.equal(voice.lines.size, 0);
    assert.deepEqual(errors, []);
});


test('MarkdownUpVoice, say audio ends while synthesizing', async () => {
    const {voice} = testVoice(2);
    voice.say('One.', null, 'neutral', 1);
    await voice.load();

    // The first block's audio ends before the line is done
    for (let ix = 0; ix < 10 && voice.lineAudioContext.sources.length === 0; ix++) {
        await Promise.resolve();
    }
    assert.equal(voice.lineAudioContext.sources.length, 1);
    endSources(voice.lineAudioContext, 2);
    assert.equal(voice.lines.size, 1);
    await flushTasks();
    assert.equal(voice.lineAudioContext.sources.length, 2);
    assert.equal(voice.lines.size, 1);
    endSources(voice.lineAudioContext, 4);
    assert.equal(voice.lines.size, 0);
});


test('MarkdownUpVoice, sayStop', async () => {
    const {voice, errors, picovox} = testVoice(3);

    // Stop with no lines
    voice.sayStop();
    assert.equal(voice.lineAudioContext, null);

    // Stop the lines that are playing
    voice.say('One.', null, 'neutral', 1);
    voice.say('Two.', null, 'neutral', 1);
    await flushTasks();
    const audioContext = voice.lineAudioContext;
    assert.equal(audioContext.sources.length, 6);
    assert.equal(voice.lines.size, 2);
    voice.sayStop();
    assert.equal(voice.lines.size, 0);
    assert.deepEqual(audioContext.sources.map((source) => source.stopped), [true, true, true, true, true, true]);

    // Stop a line before it's synthesized
    voice.say('Three.', null, 'neutral', 1);
    voice.sayStop();
    await flushTasks();
    assert.equal(picovox.calls.length, 2);
    assert.equal(voice.lines.size, 0);

    // Stop a line while it's synthesized
    voice.say('Four.', null, 'neutral', 1);
    for (let ix = 0; ix < 10 && audioContext.sources.length === 6; ix++) {
        await Promise.resolve();
    }
    assert.equal(audioContext.sources.length, 7);
    voice.sayStop();
    await flushTasks();
    assert.equal(audioContext.sources.length, 7);
    assert.equal(voice.lines.size, 0);
    assert.deepEqual(errors, []);
});


test('MarkdownUpVoice, say audio not started', async () => {
    const {voice, errors, listeners, picovox} = testVoice();

    // The browser hasn't let the audio start - the line is dropped
    MockAudioContext.allowed = false;
    assert.equal(voice.ready(), false);
    MockAudioContext.allowed = true;
    const audioContext = voice.lineAudioContext;
    assert.deepEqual(audioContext.calls, ['resume']);
    assert.equal(audioContext.state, 'suspended');
    audioContext.allowed = false;
    voice.say('One.', null, 'neutral', 1);
    await flushTasks();
    assert.deepEqual(audioContext.calls, ['resume', 'resume']);
    assert.deepEqual(picovox.calls, []);
    assert.equal(voice.lines.size, 0);
    assert.equal(voice.ready(), false);

    // The user interacts with the page - the audio starts
    audioContext.allowed = true;
    listeners.pointerup();
    assert.deepEqual(audioContext.calls, ['resume', 'resume', 'resume']);
    assert.equal(audioContext.state, 'running');
    assert.equal(voice.ready(), true);
    listeners.keydown();
    listeners.pointerdown();
    assert.deepEqual(audioContext.calls, ['resume', 'resume', 'resume']);

    // The lines are heard
    voice.say('Two.', null, 'neutral', 1);
    await flushTasks();
    assert.deepEqual(picovox.calls.map(([text]) => text), ['Two.']);
    assert.deepEqual(errors, []);
    voice.sayStop();
});


test('MarkdownUpVoice, say error', async () => {
    const {voice, errors, picovox} = testVoice();
    picovox.sentenceBlocks = () => {
        throw new Error('Synthesis failed');
    };
    voice.say('One.', null, 'neutral', 1);
    await flushTasks();
    assert.deepEqual(errors, ['MarkdownUp: Voice line failed: Error: Synthesis failed']);
    assert.equal(voice.lines.size, 0);
});


test('MarkdownUpVoice, prepare', async () => {
    const {voice, picovox} = testVoice();
    voice.prepare();
    assert.deepEqual(voice.lineAudioContext.calls, ['resume']);
    assert.equal(voice.lineAudioContext.state, 'running');
    await flushTasks();
    assert.equal(voice.picovox, picovox);

    // A failed load is retried
    const {voice: voice2, errors} = testVoice();
    voice2.loadFn = () => Promise.reject(new Error('Load failed'));
    voice2.prepare();
    await flushTasks();
    assert.equal(voice2.picovox, null);
    assert.equal(voice2.loading, null);
    assert.deepEqual(errors, []);
});
