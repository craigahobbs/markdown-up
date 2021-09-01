# markdown-up

[![npm](https://img.shields.io/npm/v/markdown-up)](https://www.npmjs.com/package/markdown-up)
[![GitHub](https://img.shields.io/github/license/craigahobbs/markdown-up)](https://github.com/craigahobbs/markdown-up/blob/main/LICENSE)

[markdown-up Application](https://craigahobbs.github.io/markdown-up/)

**markdown-up** is a JavaScript application that renders Markdown files in your web browser. To use markdown-up, first,
download the markdown-up application stub to the directory containing your Markdown files:

```
curl -O https://craigahobbs.github.io/markdown-up/index.html
```

To host your Markdown files locally, start a local static web server:

```
python3 -m http.server
```

By default, markdown-up opens the "README.md" file. To open another file, set the "url" hash parameter (i.e.
"http://127.0.0.1:8000#url=other.md").

Alternatively, you can change the default Markdown file by updating the markdown-up application stub. For example:

```
    <script type="module">
        import {MarkdownUp} from 'https://craigahobbs.github.io/markdown-up/markdown-up/index.js';
        MarkdownUp.run(window, 'other.md');
    </script>
```


## Viewing local Markdown files

To view local Markdown files using markdown-up, try the
[markdown-up command-line application](https://pypi.org/project/markdown-up/).


## Development

This project is developed using [javascript-build](https://github.com/craigahobbs/javascript-build#readme). It was started
using [javascript-template](https://github.com/craigahobbs/javascript-template#readme) as follows:

```
template-specialize javascript-template/template/ markdown-up/ -k package markdown-up -k name 'Craig A. Hobbs' -k email 'craigahobbs@gmail.com' -k github 'craigahobbs'
```
