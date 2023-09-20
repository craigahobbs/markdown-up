"markdownUp.mds" contains minimalist implementations of the
[MarkdownUp Library](https://craigahobbs.github.io/markdown-up/library/)
functions, which allows some
[MarkdownUp](https://github.com/craigahobbs/markdown-up#readme)
applications to function running with plain
[BareScript](https://github.com/craigahobbs/bare-script#readme).

Consider the following MarkdownUp application:

**app.md**

``` markdown
~~~ markdown-script
include 'app.mds'
~~~
```

**app.mds:**

~~~ bare-script
function appMain():
    markdownPrint('# Hello!', '')
    i = 0
    while i < 10:
        markdownPrint('- ' + (i + 1))
        i = i + 1
    endwhile
endfunction

appMain()
~~~

**Note:** BareScript files that use functions from the
[MarkdownUp Library](https://craigahobbs.github.io/markdown-up/library/)
use the ".mds" file extension.

The application runs as expected within
[MarkdownUp](https://github.com/craigahobbs/markdown-up#readme).
However, when running in plain BareScript, the `markdownPrint` function is not defined, and the
application fails:

~~~ sh
$ npx bare app.mds
app.mds:
Undefined function "markdownPrint"
~~~

However, if we first include "markdownUp.bare", the application works and outputs the generated
Markdown to the terminal:

~~~ sh
$ npx bare -c 'include <markdownUp.bare>' app.mds
# Hello!

- 1
- 2
- 3
- 4
- 5
- 6
- 7
- 8
- 9
- 10
~~~
