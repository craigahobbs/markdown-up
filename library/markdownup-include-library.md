# The MarkdownUp Include Library

## Table of Contents

- [args.bare](#var.vPublish=true&var.vSingle=true&args-bare)
- [dataTable.bare](#var.vPublish=true&var.vSingle=true&datatable-bare)
- [diff.bare](#var.vPublish=true&var.vSingle=true&diff-bare)
- [forms.bare](#var.vPublish=true&var.vSingle=true&forms-bare)
- [pager.bare](#var.vPublish=true&var.vSingle=true&pager-bare)
- [unittest.bare](#var.vPublish=true&var.vSingle=true&unittest-bare)
- [unittestMock.bare](#var.vPublish=true&var.vSingle=true&unittestmock-bare)

---

## args.bare

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

The "args.bare" include library contains functions for parsing/validating a MarkdownUp application's
URL arguments, and functions for creating MarkdownUp application URLs and links.

Consider the following example of an application that sums numbers. First, include the "args.bare"
library and define an [arguments model] with three floating point number URL arguments: "value1",
"value2" and "value3".

~~~ bare-script
include <args.bare>

arguments = [ \
    {'name': 'value1', 'type': 'float', 'default': 0}, \
    {'name': 'value2', 'type': 'float', 'default': 0}, \
    {'name': 'value3', 'type': 'float', 'default': 0} \
]
~~~

Next, parse the arguments with the [argsParse] function.

~~~ bare-script
args = argsParse(arguments)
~~~

You access arguments by name from the "args" object.

~~~ bare-script
value1 = objectGet(args, 'value1')
value2 = objectGet(args, 'value2')
value3 = objectGet(args, 'value3')
sum = value1 + value2 + value3
markdownPrint('The sum is: ' + sum)
~~~

You can create links to the application using the [argsLink] function.

~~~ bare-script
markdownPrint( \
    '', argsLink(arguments, 'Value1 Less', {'value1': value1 - 1}), \
    '', argsLink(arguments, 'Value1 More', {'value1': value1 + 1}), \
    '', argsLink(arguments, 'Value2 Less', {'value2': value2 - 1}), \
    '', argsLink(arguments, 'Value2 More', {'value2': value2 + 1}), \
    '', argsLink(arguments, 'Value3 Less', {'value3': value3 - 1}), \
    '', argsLink(arguments, 'Value3 More', {'value3': value3 + 1}) \
)
~~~

By default, any argument previously supplied to the application is included in the link (unless
overridden by null). All arguments are cleared by setting the [argsLink] "explicit" argument to
true. Arguments may also be marked "explicit" individually in the [arguments model].

~~~ bare-script
markdownPrint('', argsLink(arguments, 'Reset', null, true))
~~~


[argsLink]: include.html#var.vGroup='args.bare'&argslink
[argsParse]: include.html#var.vGroup='args.bare'&argsparse
[arguments model]: includeModel.html#var.vName='ArgsArguments'


### Function Index

- [argsHelp](#var.vPublish=true&var.vSingle=true&argshelp)
- [argsLink](#var.vPublish=true&var.vSingle=true&argslink)
- [argsParse](#var.vPublish=true&var.vSingle=true&argsparse)
- [argsURL](#var.vPublish=true&var.vSingle=true&argsurl)
- [argsValidate](#var.vPublish=true&var.vSingle=true&argsvalidate)

---

### argsHelp

Output the [arguments model's](includeModel.html#var.vName='ArgsArguments') help

#### Arguments

**arguments -**
The [arguments model](includeModel.html#var.vName='ArgsArguments')

#### Returns

Nothing

---

### argsLink

Create a Markdown link text to a MarkdownUp application URL

#### Arguments

**arguments -**
The [arguments model](includeModel.html#var.vName='ArgsArguments')

**text -**
The link text

**args -**
Optional (default is null). The arguments object.

**explicit -**
Optional (default is false). If true, arguments are only included in the URL if they are in the arguments object.

**headerText -**
Optional (default is null). If non-null, the URL's header text.
The special "_top" header ID scrolls to the top of the page.

**url -**
Optional (default is null). If non-null, the MarkdownUp URL hash parameter.

#### Returns

The Markdown link text

---

### argsParse

Parse an [arguments model](includeModel.html#var.vName='ArgsArguments').
Argument globals are validated and added to the arguments object using the argument name.

#### Arguments

**arguments -**
The [arguments model](includeModel.html#var.vName='ArgsArguments')

#### Returns

The arguments object

---

### argsURL

Create a MarkdownUp application URL

#### Arguments

**arguments -**
The [arguments model](includeModel.html#var.vName='ArgsArguments')

**args -**
Optional (default is null). The arguments object. Null argument values are excluded from the URL.

**explicit -**
Optional (default is false). If true, arguments are only included in the URL if they are in the arguments object.

**headerText -**
Optional (default is null). If non-null, the URL's header text.
The special "_top" header ID scrolls to the top of the page.

**url -**
Optional (default is null). If non-null, the MarkdownUp URL hash parameter.

#### Returns

The MarkdownUp application URL

---

### argsValidate

Validate an arguments model

#### Arguments

**arguments -**
The [arguments model](includeModel.html#var.vName='ArgsArguments')

#### Returns

The validated [arguments model](includeModel.html#var.vName='ArgsArguments') or null if validation fails

---

## dataTable.bare

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [dataTableMarkdown](#var.vPublish=true&var.vSingle=true&datatablemarkdown)

---

### dataTableMarkdown

Create the array of Markdown table line strings

#### Arguments

**data -**
The array of row objects

**model -**
The [data table model](includeModel.html#var.vName='DataTable')

#### Returns

The array of Markdown table line strings

---

## diff.bare

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [diffLines](#var.vPublish=true&var.vSingle=true&difflines)

---

### diffLines

Compute the line-differences of two strings or arrays of strings

#### Arguments

**left -**
The "left" string or array of strings

**right -**
The "right" string or array of strings

#### Returns

The array of [difference models](includeModel.html#var.vName='Differences')

---

## forms.bare

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [formsLinkButtonElements](#var.vPublish=true&var.vSingle=true&formslinkbuttonelements)
- [formsLinkElements](#var.vPublish=true&var.vSingle=true&formslinkelements)
- [formsTextElements](#var.vPublish=true&var.vSingle=true&formstextelements)

---

### formsLinkButtonElements

Create a link button [element model](https://github.com/craigahobbs/element-model#readme)

#### Arguments

**text -**
The link button's text

**onClick -**
The link button's click event handler

#### Returns

The link button [element model](https://github.com/craigahobbs/element-model#readme)

---

### formsLinkElements

Create a link [element model](https://github.com/craigahobbs/element-model#readme)

#### Arguments

**text -**
The link's text

**url -**
The link's URL. If null, the link is rendered as text.

#### Returns

The link [element model](https://github.com/craigahobbs/element-model#readme)

---

### formsTextElements

Create a text input [element model](https://github.com/craigahobbs/element-model#readme)

#### Arguments

**id -**
The text input element ID

**text -**
The initial text of the text input element

**size -**
Optional (default is null). The size, in characters, of the text input element

**onEnter -**
Optional (default is null). The text input element on-enter event handler

#### Returns

The text input [element model](https://github.com/craigahobbs/element-model#readme)

---

## markdownUp.bare

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

"markdownUp.bare" contains minimalist implementations of the
[MarkdownUp Library](https://craigahobbs.github.io/markdown-up/library/)
functions, which allows some
[MarkdownUp](https://github.com/craigahobbs/markdown-up#readme)
applications to function running with plain
[BareScript](https://github.com/craigahobbs/bare-script#readme).

Consider the following MarkdownUp application:

**app.md**

``` markdown
~~~ markdown-script
include 'app.bare'
~~~
```

**app.bare:**

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

The application runs as expected within
[MarkdownUp](https://github.com/craigahobbs/markdown-up#readme).
However, when running in plain BareScript, the `markdownPrint` function is not defined, and the
application fails:

~~~ sh
$ npx bare app.bare
app.bare:
Undefined function "markdownPrint"
~~~

However, if we first include "markdownUp.bare" using the "-m" argument, the application works and
outputs the generated Markdown to the terminal:

~~~ sh
$ npx bare -m app.bare
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


---

## pager.bare

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

The "pager.bare" include library is a simple, configurable, paged MarkdownUp application. The pager
renders a menu of links to your pages and navigation links (start, next, previous). The pager
supports three page types: function pages, Markdown pages, and external links.

You execute the pager by defining a [pager model] and calling the [pagerMain] function.

~~~ bare-script
include <pager.bare>

function funcPage(args):
    markdownPrint('This is page "' + objectGet(args, 'page') + '"')
endfunction

pagerModel = { \
    'pages': [ \
        {'name': 'Function Page', 'type': {'function': { \
            'function': funcPage, 'title': 'The Function Page'}}}, \
        {'name': 'Markdown Page', 'type': {'markdown': { \
            'url': 'README.md'}}}, \
        {'name': 'Link Page', 'type': {'link': { \
            'url': 'external.html'}}} \
    ] \
}
pagerMain(pagerModel)
~~~

By default, the pager application defines a single URL argument, "page", to track the currently
selected page. You can pass the "arguments" option with a custom [arguments model] if you need
additional URL arguments for your application. Note that you must define a string argument named
"page".

~~~ bare-script
arguments = [ \
    {'name': 'page', 'default': 'Function Page'}, \
    {'name': 'value', 'type': 'float', 'default': 0} \
]
pagerMain(pagerModel, {'arguments': arguments})
~~~

You can hide the navigation links using the "hideNav" option.

~~~ bare-script
pagerMain(pagerModel, {'hideNav': true})
~~~

You can hide the menu links using the "hideMenu" option.

~~~ bare-script
pagerMain(pagerModel, {'hideMenu': true})
~~~

The default page is the first non-hidden page. To show a different page by default, use the "start"
option. If you provide the "arguments" option, be sure to set the "page" argument's default to be
the same as the "start" option.

~~~ bare-script
pagerMain(pagerModel, {'start': 'Markdown Page'})
~~~


[arguments model]: includeModel.html#var.vName='ArgsArguments'
[pager model]: includeModel.html#var.vName='Pager'
[pagerMain]: include.html#var.vGroup='pager.bare'&pagermain


### Function Index

- [pagerMain](#var.vPublish=true&var.vSingle=true&pagermain)
- [pagerValidate](#var.vPublish=true&var.vSingle=true&pagervalidate)

---

### pagerMain

The pager application main entry point

#### Arguments

**pagerModel -**
The [pager model](includeModel.html#var.vName='Pager')

**options -**
The pager application options. The following options are available:
- **arguments** - The [arguments model](includeModel.html#var.vName='ArgsArguments').
  Must contain a string argument named "page".
- **hideMenu** - Hide the menu links
- **hideNav** - Hide the navigation links
- **start** - The start page name
- **keyboard** - Enable keyboard commands ('n' for next, 'p' for previous, 's' for start, 'e' for end)

#### Returns

Nothing

---

### pagerValidate

Validate a pager model

#### Arguments

**pagerModel -**
The [pager model](includeModel.html#var.vName='Pager')

#### Returns

The validated [pager model](includeModel.html#var.vName='Pager') or null if validation fails

---

## unittest.bare

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

The "unittest.bare" include library contains functions for unit testing code. The typical project
layout is as follows:

~~~
|-- code1.bare
`-- test
    |-- runTests.md
    |-- runTests.bare
    |-- testCode1.bare
~~~

**runTests.md**

The "runTests.md" file is a Markdown document that includes (and executes) the "runTests.bare" unit
test application.

``` bare-script
~~~ markdown-script
include 'runTests.bare'
~~~
```

**runTests.bare**

The "runTests.bare" is the unit test application. It first includes the "unittest.bare" include
library and then includes (and executes) the unit test include files. There can be any number of
test include files. It then renders the unit test report using the [unittestReport](#unittestreport)
function and returns the number of unit test failures.

~~~ bare-script
include <unittest.bare>

# Start coverage
coverageStart()

# Test includes
include 'testCode1.bare'

# Stop coverage
coverageStop()

# Test report
return unittestReport({'minCoverage': 100})
~~~

**testCode1.bare**

The test include files contain unit tests for each code include. The test include files execute
tests using the [unittestRunTest](#unittestruntest) function. Individual tests assert success and
failure using the [unittestEqual](#unittestequal) and [unittestDeepEqual](#unittestdeepequal)
functions.

~~~ bare-script
include '../code1.bare'

function testCode1SumNumbers():
    unittestEqual(sumNumbers(1, 2, 3), 6)
endfunction
unittestRunTest('testCode1SumNumbers')

function testCode1SumNumberArrays():
    unittestDeepEqual( \
        sumNumberArrays([1, 2, 3], [4, 5, 6]), \
        [6, 15] \
    )
endfunction
unittestRunTest('testCode1SumNumberArrays')
~~~

## Running Unit Tests on the Command Line

Unit tests may be run on the command line using the
[BareScript CLI](https://github.com/craigahobbs/bare-script#the-barescript-command-line-interface-cli)
and its `-m` argument.

~~~
npx bare -m test/runTests.bare
~~~

The "runTests.bare" application returns an error status if there are any failures.


### Function Index

- [unittestDeepEqual](#var.vPublish=true&var.vSingle=true&unittestdeepequal)
- [unittestEqual](#var.vPublish=true&var.vSingle=true&unittestequal)
- [unittestReport](#var.vPublish=true&var.vSingle=true&unittestreport)
- [unittestRunTest](#var.vPublish=true&var.vSingle=true&unittestruntest)

---

### unittestDeepEqual

Assert an actual value is *deeply* equal to the expected value

#### Arguments

**actual -**
The actual value

**expected -**
The expected value

**description -**
The description of the assertion

#### Returns

Nothing

---

### unittestEqual

Assert an actual value is equal to the expected value

#### Arguments

**actual -**
The actual value

**expected -**
The expected value

**description -**
The description of the assertion

#### Returns

Nothing

---

### unittestReport

Render the unit test report

#### Arguments

**options -**
Optional unittest report options object. The following options are available:
- **coverageExclude** - array of script names to exclude from coverage
- **coverageMin** - verify minimum coverage percent (0 - 100)
- **links** - the array of page links
- **title** - the page title

#### Returns

The number of unit test failures

---

### unittestRunTest

Run a unit test

#### Arguments

**testName -**
The test function name

#### Returns

Nothing

---

## unittestMock.bare

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

The "unittestMock.bare" include library contains functions for mocking functions for unit testing.
Consider the following MarkdownUp application:

**app.bare**

~~~ bare-script
function appMain(count):
    title = 'My Application'
    documentSetTitle(title)
    markdownPrint('# ' + markdownEscape(title))
    i = 0
    while i < count:
        markdownPrint('', '- ' + i)
        i = i + 1
    endwhile
endfunction
~~~

The
[documentSetTitle](https://craigahobbs.github.io/markdown-up/library/#var.vGroup='Document'&documentsettitle)
function and the
[markdownPrint](https://craigahobbs.github.io/markdown-up/library/#var.vGroup='Markdown'&markdownprint)
function have external side-effects that will interfere with running our unit tests.

To test this code, first call the [unittestMockAll](#unittestmockall) function at the beginning of
your test function to mock all
[MarkdownUp library](https://craigahobbs.github.io/markdown-up/library/)
functions. At the end of the test function, we stop mocking by calling the
[unittestMockEnd](#unittestmockend) function and check the mocked function calls using the
[unittestDeepEqual](#var.vGroup='unittest.bare'&unittestdeepequal) function.

**runTests.bare**

~~~ bare-script
include <unittest.bare>
include <unittestMock.bare>

# Start coverage
coverageStart()

# Test includes
include 'testApp.bare'

# Stop coverage
coverageStop()

return unittestReport({'coverageMin': 100})
~~~

**testApp.bare**

~~~ bare-script
include 'app.bare'

function testApp():
    unittestMockAll()

    # Run the application
    appMain(3)

    unittestDeepEqual( \
        unittestMockEnd(), \
        [ \
            ['documentSetTitle', ['My Application']], \
            ['markdownPrint', ['# My Application']], \
            ['markdownPrint', ['','- 0']], \
            ['markdownPrint', ['','- 1']], \
            ['markdownPrint', ['','- 2']] \
        ] \
    )
endfunction
unittestRunTest('testApp')
~~~


### Function Index

- [unittestMockAll](#var.vPublish=true&var.vSingle=true&unittestmockall)
- [unittestMockEnd](#var.vPublish=true&var.vSingle=true&unittestmockend)
- [unittestMockOne](#var.vPublish=true&var.vSingle=true&unittestmockone)
- [unittestMockOneGeneric](#var.vPublish=true&var.vSingle=true&unittestmockonegeneric)

---

### unittestMockAll

Start mocking all BareScript and MarkdownUp library functions with externalities.
To stop mocking, call the [unittestMockEnd](#var.vGroup='unittestMock.bare'&unittestmockend) function.

#### Arguments

**data -**
Optional (default is null). The map of function name to mock function data.
The following functions make use of mock data:
- **documentInputValue** - map of id to return value
- **markdownParse** - array of return values
- **markdownTitle** - array of return values
- **systemFetch** - map of URL to response text

#### Returns

Nothing

---

### unittestMockEnd

Stop all function mocks

#### Arguments

None

#### Returns

The array of mock function call tuples of the form (function name, function argument array)

---

### unittestMockOne

Start a function mock.
To stop mocking, call the [unittestMockEnd](#var.vGroup='unittestMock.bare'&unittestmockend) function.

#### Arguments

**funcName -**
The name of the function to mock

**mockFunc -**
The mock function

#### Returns

Nothing

---

### unittestMockOneGeneric

Start a generic function mock.
To stop mocking, call the [unittestMockEnd](#var.vGroup='unittestMock.bare'&unittestmockend) function.

#### Arguments

**funcName -**
The name of the function to mock

#### Returns

Nothing
