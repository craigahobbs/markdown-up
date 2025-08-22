# MarkdownUp

[![npm](https://img.shields.io/npm/v/markdown-up)](https://www.npmjs.com/package/markdown-up)
[![GitHub](https://img.shields.io/github/license/craigahobbs/markdown-up)](https://github.com/craigahobbs/markdown-up/blob/main/LICENSE)

MarkdownUp is a Markdown viewer. This is the MarkdownUp frontend application.


## Links

- [MarkdownUp Application](https://craigahobbs.github.io/markdown-up/)
- [Source code](https://github.com/craigahobbs/markdown-up)


## View Local Markdown Files

To view local Markdown files, use the
[MarkdownUp backend application](https://github.com/craigahobbs/markdown-up-py#readme)
from a terminal prompt:

~~~
pip install markdown-up
markdown-up
~~~


## Host Markdown Web Pages

To host a Markdown resource, download the MarkdownUp application HTML stub to the directory
containing your Markdown files:

~~~
curl -O https://craigahobbs.github.io/markdown-up/extra/index.html
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

To view a different Markdown resource, set the application's "url" hash parameter (i.e.,
"http://127.0.0.1:8000#url=other.md").


## MarkdownUp Applications

With MarkdownUp, you can write client-rendered frontend applications and backend APIs using
[BareScript](https://craigahobbs.github.io/bare-script/language/).
These applications are called *MarkdownUp Applications*. You can learn more from the
[MarkdownUp backend application's README](https://craigahobbs.github.io/markdown-up-py/#markdownup-applications).


### Debug Mode

Debug mode logs the script runtime duration and runs the BareScript linter, which performs static
code analysis on your code and reports warnings for any issues found.

To turn on debug mode, click the debug button in the MarkdownUp menu in the upper-right of the page.


## The MarkdownUp Package

The [markdown-up package](https://www.npmjs.com/package/markdown-up)
exposes various functionality of the MarkdownUp application, such as rendering data tables and
charts. For more information, refer to the
[MarkdownUp package documentation](https://craigahobbs.github.io/markdown-up/doc/).


## Development

This package is developed using [javascript-build](https://github.com/craigahobbs/javascript-build#readme).
It was started using [javascript-template](https://github.com/craigahobbs/javascript-template#readme) as follows:

~~~
template-specialize javascript-template/template/ markdown-up/ -k package markdown-up -k name 'Craig A. Hobbs' -k email 'craigahobbs@gmail.com' -k github 'craigahobbs'
~~~
