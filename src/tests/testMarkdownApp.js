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
    t.is(markdownApp.windowHashChangeArgs, null);
    t.is(markdownApp.params, null);
});
