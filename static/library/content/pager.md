The "pager.mds" include library is a simple, configurable, paged MarkdownUp application. The pager
renders a menu of links to your pages and navigation links (start, next, previous). The pager
supports three page types: function pages, Markdown pages, and external links.

You execute the pager by defining a [pager model] and calling the [pagerMain] function.

~~~ bare-script
include <pager.mds>

function funcPage(args):
    markdownPrint('This is page "' + objectGet(args, 'page') + '"')
endfunction

pagerModel = objectNew( \
    'pages', arrayNew( \
        objectNew('name', 'Function Page', 'type', objectNew('function', objectNew( \
            'function', funcPage, 'title', 'The Function Page'))), \
        objectNew('name', 'Markdown Page', 'type', objectNew('markdown', objectNew( \
            'url', 'README.md'))), \
        objectNew('name', 'Link Page', 'type', objectNew('link', objectNew( \
            'url', 'external.html'))) \
    ) \
)
pagerMain(pagerModel)
~~~

By default, the pager application defines a single URL argument, "page", to track the currently
selected page. You can pass the "arguments" option with a custom [arguments model] if you need
additional URL arguments for your application. Note that you must define a string argument named
"page".

~~~ bare-script
arguments = arrayNew( \
    objectNew('name', 'page', 'default', 'Function Page'), \
    objectNew('name', 'value', 'type', 'float', 'default', 0) \
)
pagerMain(pagerModel, objectNew('arguments', arguments))
~~~

You can hide the navigation links using the "hideNav" option.

~~~ bare-script
pagerMain(pagerModel, objectNew('hideNav', true))
~~~

You can hide the menu links using the "hideMenu" option.

~~~ bare-script
pagerMain(pagerModel, objectNew('hideMenu', true))
~~~

The default page is the first non-hidden page. To show a different page by default, use the "start"
option. If you provide the "arguments" option, be sure to set the "page" argument's default to be
the same as the "start" option.

~~~ bare-script
pagerMain(pagerModel, objectNew('start', 'Markdown Page'))
~~~


[arguments model]: includeModel.html#var.vName='ArgsArguments'
[pager model]: includeModel.html#var.vName='Pager'
[pagerMain]: include.html#var.vGroup='pager.mds'&pagermain
