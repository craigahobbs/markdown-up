// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/* eslint-disable id-length */

import {MarkdownApp} from '../markdown-up/markdownApp.js';
import Window from 'window';
import test from 'ava';


test('MarkdownApp, constructor', (t) => {
    const window = new Window();
    const markdownApp = new MarkdownApp(window, 'README.md');
    t.is(markdownApp.window, window);
    t.is(markdownApp.defaultMarkdownURL, 'README.md');
    t.is(markdownApp.params, null);
});


test('MarkdownApp.run, help command', async (t) => {
    const window = new Window();
    window.location.hash = '#cmd.help=1';
    const markdownApp = await MarkdownApp.run(window, 'README.md');
    t.is(markdownApp.window, window);
    t.is(markdownApp.defaultMarkdownURL, 'README.md');
    t.deepEqual(markdownApp.params, {'cmd': {'help': 1}});
    t.true(window.document.body.innerHTML.startsWith(
        '<h1 id="cmd.help=1&amp;type_MarkdownApp"><a class="linktarget">MarkdownApp</a></h1>'
    ));
});
