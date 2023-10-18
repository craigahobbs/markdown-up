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
