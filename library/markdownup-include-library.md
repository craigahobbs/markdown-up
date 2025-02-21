# The MarkdownUp Include Library

## Table of Contents

- [args.mds](#var.vPublish=true&var.vSingle=true&args-mds)
- [forms.mds](#var.vPublish=true&var.vSingle=true&forms-mds)
- [pager.mds](#var.vPublish=true&var.vSingle=true&pager-mds)
- [unittest.mds](#var.vPublish=true&var.vSingle=true&unittest-mds)
- [unittestMock.mds](#var.vPublish=true&var.vSingle=true&unittestmock-mds)

---

## args.mds

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

The "args.mds" include library contains functions for parsing/validating a MarkdownUp application's
URL arguments, and functions for creating MarkdownUp application URLs and links.

Consider the following example of an application that sums numbers. First, include the "args.mds"
library and define an [arguments model] with three floating point number URL arguments: "value1",
"value2" and "value3".

~~~ bare-script
include <args.mds>

arguments = arrayNew( \
    objectNew('name', 'value1', 'type', 'float', 'default', 0), \
    objectNew('name', 'value2', 'type', 'float', 'default', 0), \
    objectNew('name', 'value3', 'type', 'float', 'default', 0) \
)
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
    '', argsLink(arguments, 'Value1 Less', objectNew('value1', value1 - 1)), \
    '', argsLink(arguments, 'Value1 More', objectNew('value1', value1 + 1)), \
    '', argsLink(arguments, 'Value2 Less', objectNew('value2', value2 - 1)), \
    '', argsLink(arguments, 'Value2 More', objectNew('value2', value2 + 1)), \
    '', argsLink(arguments, 'Value3 Less', objectNew('value3', value3 - 1)), \
    '', argsLink(arguments, 'Value3 More', objectNew('value3', value3 + 1)) \
)
~~~

By default, any argument previously supplied to the application is included in the link (unless
overridden by null). All arguments are cleared by setting the [argsLink] "explicit" argument to
true. Arguments may also be marked "explicit" individually in the [arguments model].

~~~ bare-script
markdownPrint('', argsLink(arguments, 'Reset', null, true))
~~~


[argsLink]: include.html#var.vGroup='args.mds'&argslink
[argsParse]: include.html#var.vGroup='args.mds'&argsparse
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

## forms.mds

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


---

## pager.mds

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

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

## unittest.mds

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

The "unittest.mds" include library contains functions for unit testing code. The typical project
layout is as follows:

~~~
|-- code1.mds
`-- test
    |-- runTests.md
    |-- runTests.mds
    |-- testCode1.mds
~~~

**runTests.md**

The "runTests.md" file is a Markdown document that includes (and executes) the "runTests.mds" unit
test application.

``` bare-script
# Code Tests

~~~ markdown-script
include 'runTests.mds'
~~~
```

**runTests.mds**

The "runTests.mds" is the unit test application. It first includes the "unittest.mds" include
library and then includes (and executes) the unit test include files. There can be any number of
test include files. It then renders the unit test report using the [unittestReport](#unittestreport)
function and returns the number of unit test failures.

~~~ bare-script
include <unittest.mds>

# Test includes
include 'testCode1.mds'

# Test report
return unittestReport()
~~~

**testCode1.mds**

The test include files contain unit tests for each code include. The test include files execute
tests using the [unittestRunTest](#unittestruntest) and
[unittestRunTestAsync](#unittestruntestasync) functions. Individual tests assert success and failure
using the [unittestEqual](#unittestequal) and [unittestDeepEqual](#unittestdeepequal) functions.

~~~ bare-script
include '../code1.mds'

function testCode1SumNumbers():
    unittestEqual(sumNumbers(1, 2, 3), 6)
endfunction
unittestRunTest('testCode1SumNumbers')

function testCode1SumNumberArrays():
    unittestDeepEqual( \
        sumNumberArrays(arrayNew(1, 2, 3), arrayNew(4, 5, 6)), \
        arrayNew(6, 15) \
    )
endfunction
unittestRunTest('testCode1SumNumberArrays')
~~~

## Running Unit Tests on the Command Line

Unit tests may be run on the command line using the
[BareScript CLI](https://github.com/craigahobbs/bare-script#the-barescript-command-line-interface-cli)
and the [markdownUp.bare](#var.vGroup='markdownUp.bare') include library:

~~~
npx bare -c 'include <markdownUp.bare>' test/runTests.mds
~~~

The "runTests.mds" application returns an error status if there are any failures.


### Function Index

- [unittestDeepEqual](#var.vPublish=true&var.vSingle=true&unittestdeepequal)
- [unittestEqual](#var.vPublish=true&var.vSingle=true&unittestequal)
- [unittestReport](#var.vPublish=true&var.vSingle=true&unittestreport)
- [unittestRunTest](#var.vPublish=true&var.vSingle=true&unittestruntest)
- [unittestRunTestAsync](#var.vPublish=true&var.vSingle=true&unittestruntestasync)

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

None

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

### unittestRunTestAsync

Run an asyncronous unit test

#### Arguments

**testName -**
The test function name

#### Returns

Nothing

---

## unittestMock.mds

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

The "unittestMock.mds" include library contains functions for mocking functions for unit testing.
Consider the following MarkdownUp application:

**app.mds**

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
[unittestDeepEqual](#var.vGroup='unittest.mds'&unittestdeepequal) function.

**runTests.mds**

~~~ bare-script
include <unittest.mds>
include <unittestMock.mds>

# Test includes
include 'testApp.mds'

return unittestReport()
~~~

**testApp.mds**

~~~ bare-script
include 'app.mds'

function testApp():
    unittestMockAll()

    # Run the application
    appMain(3)

    unittestDeepEqual( \
        unittestMockEnd(), \
        arrayNew( \
            arrayNew('documentSetTitle', arrayNew('My Application')), \
            arrayNew('markdownPrint', arrayNew('# My Application')), \
            arrayNew('markdownPrint', arrayNew('','- 0')), \
            arrayNew('markdownPrint', arrayNew('','- 1')), \
            arrayNew('markdownPrint', arrayNew('','- 2')) \
        ) \
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
To stop mocking, call the [unittestMockEnd](#var.vGroup='unittestMock.mds'&unittestmockend) function.

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
To stop mocking, call the [unittestMockEnd](#var.vGroup='unittestMock.mds'&unittestmockend) function.

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
To stop mocking, call the [unittestMockEnd](#var.vGroup='unittestMock.mds'&unittestmockend) function.

#### Arguments

**funcName -**
The name of the function to mock

#### Returns

Nothing
