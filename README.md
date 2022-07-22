# MarkdownUp

[![npm](https://img.shields.io/npm/v/markdown-up)](https://www.npmjs.com/package/markdown-up)
[![GitHub](https://img.shields.io/github/license/craigahobbs/markdown-up)](https://github.com/craigahobbs/markdown-up/blob/main/LICENSE)

[MarkdownUp](https://craigahobbs.github.io/markdown-up/)
is a Markdown viewer.


## View Local Markdown Files

To view local Markdown files, use the
[MarkdownUp launcher](https://pypi.org/project/markdown-up/)
from a terminal prompt:

~~~
pip install markdown-up
markdown-up
~~~


## Host Markdown Web Pages

To host a Markdown resource, download the MarkdownUp application stub to the directory containing
your Markdown files:

~~~
curl -O https://craigahobbs.github.io/markdown-up/static/index.html
~~~

To test your Markdown page, start a local static web server:

~~~
python3 -m http.server
~~~

By default, MarkdownUp fetches the "README.md" resource. To change the default resource, update the
application stub file, index.html. For example:

~~~
    ...
    <script type="module">
        import {MarkdownUp} from 'https://craigahobbs.github.io/markdown-up/lib/app.js';
        const app = new MarkdownUp(window, {'url': 'other.md'});
        app.run();
    </script>
    ...
~~~

To view a different Markdown resource, set the application's
["url" hash parameter](https://craigahobbs.github.io/markdown-up/#cmd.help=1)
(i.e., "http://127.0.0.1:8000#url=other.md").


## MarkdownUp Application Options

The MarkdownUp application supports the following options:

- **fontSize** - The default font size, in points

- **lineHeight** - The default line height, in em

- **menu** - If false, the application menu is hidden

- **url** - The default Markdown resource URL


## Development

MarkdownUp is developed using [javascript-build](https://github.com/craigahobbs/javascript-build#readme)
and it was started using [javascript-template](https://github.com/craigahobbs/javascript-template#readme):

~~~
template-specialize javascript-template/template/ markdown-up/ -k package markdown-up -k name 'Craig A. Hobbs' -k email 'craigahobbs@gmail.com' -k github 'craigahobbs'
~~~
