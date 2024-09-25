# MarkdownUp

[![npm](https://img.shields.io/npm/v/markdown-up)](https://www.npmjs.com/package/markdown-up)
[![GitHub](https://img.shields.io/github/license/craigahobbs/markdown-up)](https://github.com/craigahobbs/markdown-up/blob/main/LICENSE)

[MarkdownUp](https://craigahobbs.github.io/markdown-up/) is a Markdown viewer.


## Links

- [MarkdownUp Application](https://craigahobbs.github.io/markdown-up/)
- [Source code](https://github.com/craigahobbs/markdown-up)


## View Local Markdown Files

To view local Markdown files, use the
[MarkdownUp launcher](https://github.com/craigahobbs/markdown-up-py#readme)
from a terminal prompt:

~~~
pip install markdown-up
markdown-up
~~~


## Host Markdown Web Pages

To host a Markdown resource, download the MarkdownUp application stub to the directory containing
your Markdown files:

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

To view a different Markdown resource, set the application's
["url" hash parameter](https://craigahobbs.github.io/markdown-up/#cmd.help=1)
(i.e., "http://127.0.0.1:8000#url=other.md").


## Dynamic Markdown Applications

Using MarkdownUp's "markdown-script" fenced code blocks, you can dynamically generate Markdown,
allowing you to build lightweight, client-rendered web applications with no HTML, no CSS, and a
single dependency (MarkdownUp). The "markdown-script" fenced code blocks are interpreted as the
[BareScript programming language](https://craigahobbs.github.io/bare-script/language/).
In addition to generating Markdown, you can fetch text and JSON resources, create SVG drawings,
parse CSV, render data tables, draw line charts, and more. For more information, see the
[MarkdownUp Library](https://craigahobbs.github.io/markdown-up/library/).

For example:

``` markdown
# Dynamic Markdown Example

~~~ markdown-script
# Variable arguments
helloCount = if(vCount != null, vCount, 3)

# Constants
width = 200
height = 60
borderSize = 5

# Render the more/less menu
markdownPrint( \
    '', \
    if(helloCount <= 1, 'Less', '[Less](#var.vCount=' + (helloCount - 1) + ')') + ' | ', \
    '[More](#var.vCount=' + (helloCount + 1) + ')' \
)

# Render many hellos
ixHello = 0
while ixHello < helloCount:
    # Render the hello title
    helloTitle = 'Hello #' + (ixHello + 1)
    markdownPrint('', '## ' + helloTitle)

    # Render the hello drawing
    drawNew(width, height)
    drawStyle('red', borderSize, 'blue')
    drawRect(0.5 * borderSize, 0.5 * borderSize, width - borderSize, height - borderSize)
    drawTextStyle(0.67 * height, 'white', true)
    drawText(helloTitle, 0.5 * width, 0.55 * height)

    ixHello = ixHello + 1
endwhile
~~~
```

Click here to [see the example in action](https://craigahobbs.github.io/markdown-up/#url=DynamicMarkdownExample.md).


### The MarkdownUp Include Library

MarkdownUp provides some additional functionality that can be included at runtime. Consider the
following example that uses the
[unittest.mds](https://craigahobbs.github.io/markdown-up/library/include.html#var.vGroup='unittest.mds')
system library:

~~~ barescript
include <unittest.mds>

function testSanity():
    unittestEqual(1 + 1, 2)
endfunction
unittestRunTest('testSanity')

unittestReport()
~~~

See the
[MarkdownUp Include Library](https://craigahobbs.github.io/markdown-up/library/include.html)
documentation for more information on the available include libraries.


### Debug Mode

Debug mode logs the script runtime duration and runs the BareScript linter, which performs static
code analysis on your code and reports warnings for any issues found.

Debug mode also enables debug logging using the
[systemLogDebug function](https://craigahobbs.github.io/bare-script/library/#var.vGroup='System'&systemlogdebug).
For example:

~~~ barescript
systemLogDebug('Hello debug')
~~~

To turn on debug mode, click the debug button in the MarkdownUp menu in the upper-right of the page.


### Links

- [MarkdownUp Application Examples](https://craigahobbs.github.io/#url=MarkdownUpApplications.md)
- [The BareScript Language](https://craigahobbs.github.io/bare-script/language/)
- [The MarkdownUp Library](https://craigahobbs.github.io/markdown-up/library/)
- [The MarkdownUp Include Library](https://craigahobbs.github.io/markdown-up/library/include.html)


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
