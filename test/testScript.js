// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/* eslint-disable id-length */

import {MarkdownScriptRuntime, markdownScriptCodeBlock} from '../lib/script.js';
import test from 'ava';


test('testScript.js tests placeholder', (t) => {
    t.true(MarkdownScriptRuntime !== null);
    t.true(markdownScriptCodeBlock !== null);
});
