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

# Test includes
include 'testApp.bare'

return unittestReport()
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
