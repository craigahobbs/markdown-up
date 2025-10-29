# The MarkdownUp Library

## Table of Contents

- [Array](#var.vPublish=true&var.vSingle=true&array)
- [Coverage](#var.vPublish=true&var.vSingle=true&coverage)
- [Data](#var.vPublish=true&var.vSingle=true&data)
- [Datetime](#var.vPublish=true&var.vSingle=true&datetime)
- [Document](#var.vPublish=true&var.vSingle=true&document)
- [Drawing](#var.vPublish=true&var.vSingle=true&drawing)
- [Element Model](#var.vPublish=true&var.vSingle=true&element-model)
- [JSON](#var.vPublish=true&var.vSingle=true&json)
- [Local Storage](#var.vPublish=true&var.vSingle=true&local-storage)
- [Markdown](#var.vPublish=true&var.vSingle=true&markdown)
- [Math](#var.vPublish=true&var.vSingle=true&math)
- [Number](#var.vPublish=true&var.vSingle=true&number)
- [Object](#var.vPublish=true&var.vSingle=true&object)
- [Regex](#var.vPublish=true&var.vSingle=true&regex)
- [Schema](#var.vPublish=true&var.vSingle=true&schema)
- [Session Storage](#var.vPublish=true&var.vSingle=true&session-storage)
- [String](#var.vPublish=true&var.vSingle=true&string)
- [System](#var.vPublish=true&var.vSingle=true&system)
- [URL](#var.vPublish=true&var.vSingle=true&url)
- [Window](#var.vPublish=true&var.vSingle=true&window)

---

## Array

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [arrayCopy](#var.vPublish=true&var.vSingle=true&arraycopy)
- [arrayDelete](#var.vPublish=true&var.vSingle=true&arraydelete)
- [arrayExtend](#var.vPublish=true&var.vSingle=true&arrayextend)
- [arrayFlat](#var.vPublish=true&var.vSingle=true&arrayflat)
- [arrayGet](#var.vPublish=true&var.vSingle=true&arrayget)
- [arrayIndexOf](#var.vPublish=true&var.vSingle=true&arrayindexof)
- [arrayJoin](#var.vPublish=true&var.vSingle=true&arrayjoin)
- [arrayLastIndexOf](#var.vPublish=true&var.vSingle=true&arraylastindexof)
- [arrayLength](#var.vPublish=true&var.vSingle=true&arraylength)
- [arrayNew](#var.vPublish=true&var.vSingle=true&arraynew)
- [arrayNewSize](#var.vPublish=true&var.vSingle=true&arraynewsize)
- [arrayPop](#var.vPublish=true&var.vSingle=true&arraypop)
- [arrayPush](#var.vPublish=true&var.vSingle=true&arraypush)
- [arraySet](#var.vPublish=true&var.vSingle=true&arrayset)
- [arrayShift](#var.vPublish=true&var.vSingle=true&arrayshift)
- [arraySlice](#var.vPublish=true&var.vSingle=true&arrayslice)
- [arraySort](#var.vPublish=true&var.vSingle=true&arraysort)

---

### arrayCopy

Create a copy of an array

#### Arguments

**array -**
The array to copy

#### Returns

The array copy

---

### arrayDelete

Delete an array element

#### Arguments

**array -**
The array

**index -**
The index of the element to delete

#### Returns

Nothing

---

### arrayExtend

Extend one array with another

#### Arguments

**array -**
The array to extend

**array2 -**
The array to extend with

#### Returns

The extended array

---

### arrayFlat

Flat an array hierarchy

#### Arguments

**array -**
The array to flat

#### Returns

The flated array

---

### arrayGet

Get an array element

#### Arguments

**array -**
The array

**index -**
The array element's index

#### Returns

The array element

---

### arrayIndexOf

Find the index of a value in an array

#### Arguments

**array -**
The array

**value -**
The value to find in the array, or a match function, f(value) -> bool

**index -**
Optional (default is 0). The index at which to start the search.

#### Returns

The first index of the value in the array; -1 if not found.

---

### arrayJoin

Join an array with a separator string

#### Arguments

**array -**
The array

**separator -**
The separator string

#### Returns

The joined string

---

### arrayLastIndexOf

Find the last index of a value in an array

#### Arguments

**array -**
The array

**value -**
The value to find in the array, or a match function, f(value) -> bool

**index -**
Optional (default is the end of the array). The index at which to start the search.

#### Returns

The last index of the value in the array; -1 if not found.

---

### arrayLength

Get the length of an array

#### Arguments

**array -**
The array

#### Returns

The array's length; zero if not an array

---

### arrayNew

Create a new array

#### Arguments

**values... -**
The new array's values

#### Returns

The new array

---

### arrayNewSize

Create a new array of a specific size

#### Arguments

**size -**
Optional (default is 0). The new array's size.

**value -**
Optional (default is 0). The value with which to fill the new array.

#### Returns

The new array

---

### arrayPop

Remove the last element of the array and return it

#### Arguments

**array -**
The array

#### Returns

The last element of the array; null if the array is empty.

---

### arrayPush

Add one or more values to the end of the array

#### Arguments

**array -**
The array

**values... -**
The values to add to the end of the array

#### Returns

The array

---

### arraySet

Set an array element value

#### Arguments

**array -**
The array

**index -**
The index of the element to set

**value -**
The value to set

#### Returns

The value

---

### arrayShift

Remove the first element of the array and return it

#### Arguments

**array -**
The array

#### Returns

The first element of the array; null if the array is empty.

---

### arraySlice

Copy a portion of an array

#### Arguments

**array -**
The array

**start -**
Optional (default is 0). The start index of the slice.

**end -**
Optional (default is the end of the array). The end index of the slice.

#### Returns

The new array slice

---

### arraySort

Sort an array

#### Arguments

**array -**
The array

**compareFn -**
Optional (default is null). The comparison function.

#### Returns

The sorted array

---

## Coverage

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [coverageGlobalGet](#var.vPublish=true&var.vSingle=true&coverageglobalget)
- [coverageGlobalName](#var.vPublish=true&var.vSingle=true&coverageglobalname)
- [coverageStart](#var.vPublish=true&var.vSingle=true&coveragestart)
- [coverageStop](#var.vPublish=true&var.vSingle=true&coveragestop)

---

### coverageGlobalGet

Get the coverage global object

#### Arguments

None

#### Returns

The [coverage global object](https://craigahobbs.github.io/bare-script/model/#var.vName='CoverageGlobal')

---

### coverageGlobalName

Get the coverage global variable name

#### Arguments

None

#### Returns

The coverage global variable name

---

### coverageStart

Start coverage data collection

#### Arguments

None

#### Returns

Nothing

---

### coverageStop

Stop coverage data collection

#### Arguments

None

#### Returns

Nothing

---

## Data

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [dataAggregate](#var.vPublish=true&var.vSingle=true&dataaggregate)
- [dataCalculatedField](#var.vPublish=true&var.vSingle=true&datacalculatedfield)
- [dataFilter](#var.vPublish=true&var.vSingle=true&datafilter)
- [dataJoin](#var.vPublish=true&var.vSingle=true&datajoin)
- [dataLineChart](#var.vPublish=true&var.vSingle=true&datalinechart)
- [dataParseCSV](#var.vPublish=true&var.vSingle=true&dataparsecsv)
- [dataSort](#var.vPublish=true&var.vSingle=true&datasort)
- [dataTable](#var.vPublish=true&var.vSingle=true&datatable)
- [dataTop](#var.vPublish=true&var.vSingle=true&datatop)
- [dataValidate](#var.vPublish=true&var.vSingle=true&datavalidate)

---

### dataAggregate

Aggregate a data array

#### Arguments

**data -**
The data array

**aggregation -**
The [aggregation model](https://craigahobbs.github.io/bare-script/library/model.html#var.vName='Aggregation')

#### Returns

The aggregated data array

---

### dataCalculatedField

Add a calculated field to a data array

#### Arguments

**data -**
The data array

**fieldName -**
The calculated field name

**expr -**
The calculated field expression

**variables -**
Optional (default is null). A variables object the expression evaluation.

#### Returns

The updated data array

---

### dataFilter

Filter a data array

#### Arguments

**data -**
The data array

**expr -**
The filter expression

**variables -**
Optional (default is null). A variables object the expression evaluation.

#### Returns

The filtered data array

---

### dataJoin

Join two data arrays

#### Arguments

**leftData -**
The left data array

**rightData -**
The right data array

**joinExpr -**
The [join expression](https://craigahobbs.github.io/bare-script/language/#expressions)

**rightExpr -**
Optional (default is null).
The right [join expression](https://craigahobbs.github.io/bare-script/language/#expressions)

**isLeftJoin -**
Optional (default is false). If true, perform a left join (always include left row).

**variables -**
Optional (default is null). A variables object for join expression evaluation.

#### Returns

The joined data array

---

### dataLineChart

Draw a line chart

#### Arguments

**data -**
The data array

**lineChart -**
The [line chart model](model.html#var.vName='LineChart')

#### Returns

Nothing

---

### dataParseCSV

Parse CSV text to a data array

#### Arguments

**text... -**
The CSV text

#### Returns

The data array

---

### dataSort

Sort a data array

#### Arguments

**data -**
The data array

**sorts -**
The sort field-name/descending-sort tuples

#### Returns

The sorted data array

---

### dataTable

Draw a data table

#### Arguments

**data -**
The data array

**dataTable -**
Optional (default is null). The [data table model](model.html#var.vName='DataTable').

#### Returns

Nothing

---

### dataTop

Keep the top rows for each category

#### Arguments

**data -**
The data array

**count -**
The number of rows to keep (default is 1)

**categoryFields -**
Optional (default is null). The category fields.

#### Returns

The top data array

---

### dataValidate

Validate a data array

#### Arguments

**data -**
The data array

**csv -**
Optional (default is false). If true, parse value strings.

#### Returns

The validated data array

---

## Datetime

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [datetimeDay](#var.vPublish=true&var.vSingle=true&datetimeday)
- [datetimeHour](#var.vPublish=true&var.vSingle=true&datetimehour)
- [datetimeISOFormat](#var.vPublish=true&var.vSingle=true&datetimeisoformat)
- [datetimeISOParse](#var.vPublish=true&var.vSingle=true&datetimeisoparse)
- [datetimeMillisecond](#var.vPublish=true&var.vSingle=true&datetimemillisecond)
- [datetimeMinute](#var.vPublish=true&var.vSingle=true&datetimeminute)
- [datetimeMonth](#var.vPublish=true&var.vSingle=true&datetimemonth)
- [datetimeNew](#var.vPublish=true&var.vSingle=true&datetimenew)
- [datetimeNow](#var.vPublish=true&var.vSingle=true&datetimenow)
- [datetimeSecond](#var.vPublish=true&var.vSingle=true&datetimesecond)
- [datetimeToday](#var.vPublish=true&var.vSingle=true&datetimetoday)
- [datetimeYear](#var.vPublish=true&var.vSingle=true&datetimeyear)

---

### datetimeDay

Get the day of the month of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The day of the month

---

### datetimeHour

Get the hour of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The hour

---

### datetimeISOFormat

Format the datetime as an ISO date/time string

#### Arguments

**datetime -**
The datetime

**isDate -**
If true, format the datetime as an ISO date

#### Returns

The formatted datetime string

---

### datetimeISOParse

Parse an ISO date/time string

#### Arguments

**string -**
The ISO date/time string

#### Returns

The datetime, or null if parsing fails

---

### datetimeMillisecond

Get the millisecond of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The millisecond

---

### datetimeMinute

Get the minute of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The minute

---

### datetimeMonth

Get the month (1-12) of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The month

---

### datetimeNew

Create a new datetime

#### Arguments

**year -**
The full year

**month -**
The month (1-12)

**day -**
The day of the month

**hour -**
Optional (default is 0). The hour (0-23).

**minute -**
Optional (default is 0). The minute.

**second -**
Optional (default is 0). The second.

**millisecond -**
Optional (default is 0). The millisecond.

#### Returns

The new datetime

---

### datetimeNow

Get the current datetime

#### Arguments

None

#### Returns

The current datetime

---

### datetimeSecond

Get the second of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The second

---

### datetimeToday

Get today's datetime

#### Arguments

None

#### Returns

Today's datetime

---

### datetimeYear

Get the full year of a datetime

#### Arguments

**datetime -**
The datetime

#### Returns

The full year

---

## Document

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [documentFontSize](#var.vPublish=true&var.vSingle=true&documentfontsize)
- [documentInputValue](#var.vPublish=true&var.vSingle=true&documentinputvalue)
- [documentSetFocus](#var.vPublish=true&var.vSingle=true&documentsetfocus)
- [documentSetKeyDown](#var.vPublish=true&var.vSingle=true&documentsetkeydown)
- [documentSetReset](#var.vPublish=true&var.vSingle=true&documentsetreset)
- [documentSetTitle](#var.vPublish=true&var.vSingle=true&documentsettitle)
- [documentURL](#var.vPublish=true&var.vSingle=true&documenturl)

---

### documentFontSize

Get the document font size

#### Arguments

None

#### Returns

The document font size, in pixels

---

### documentInputValue

Get an input element's value

#### Arguments

**id -**
The input element ID

#### Returns

The input element value or null if the element does not exist

---

### documentSetFocus

Set focus to an element

#### Arguments

**id -**
The element ID

#### Returns

Nothing

---

### documentSetKeyDown

Set the document keydown event handler. For example:

```barescript
function myAppMain():
    myAppRender()
    documentSetKeyDown(myAppKeyDown)
endfunction

function myAppRender(key):
    markdownPrint( \
        '# KeyDown Test', \
        '', \
        if(key, '**Key pressed:** "' + key + '"', '*No key pressed yet.*') \
    )
endfunction

function myAppKeyDown(event):
    key = objectGet(event, 'key')
    myAppRender(key)
endfunction

myAppMain()
```

#### Arguments

**callback -**
The keydown event callback function that takes a single
[key event object](model.html#var.vName='DocumentKeyEvent') argument, `event`.

#### Returns

Nothing

---

### documentSetReset

Set the document reset element

#### Arguments

**id -**
The element ID

#### Returns

Nothing

---

### documentSetTitle

Set the document title

#### Arguments

**title -**
The document title string

#### Returns

Nothing

---

### documentURL

Fix-up relative URLs

#### Arguments

**url -**
The URL

#### Returns

The fixed-up URL

---

## Drawing

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [drawArc](#var.vPublish=true&var.vSingle=true&drawarc)
- [drawCircle](#var.vPublish=true&var.vSingle=true&drawcircle)
- [drawClose](#var.vPublish=true&var.vSingle=true&drawclose)
- [drawEllipse](#var.vPublish=true&var.vSingle=true&drawellipse)
- [drawHLine](#var.vPublish=true&var.vSingle=true&drawhline)
- [drawHeight](#var.vPublish=true&var.vSingle=true&drawheight)
- [drawImage](#var.vPublish=true&var.vSingle=true&drawimage)
- [drawLine](#var.vPublish=true&var.vSingle=true&drawline)
- [drawMove](#var.vPublish=true&var.vSingle=true&drawmove)
- [drawNew](#var.vPublish=true&var.vSingle=true&drawnew)
- [drawOnClick](#var.vPublish=true&var.vSingle=true&drawonclick)
- [drawPathRect](#var.vPublish=true&var.vSingle=true&drawpathrect)
- [drawRect](#var.vPublish=true&var.vSingle=true&drawrect)
- [drawStyle](#var.vPublish=true&var.vSingle=true&drawstyle)
- [drawText](#var.vPublish=true&var.vSingle=true&drawtext)
- [drawTextHeight](#var.vPublish=true&var.vSingle=true&drawtextheight)
- [drawTextStyle](#var.vPublish=true&var.vSingle=true&drawtextstyle)
- [drawTextWidth](#var.vPublish=true&var.vSingle=true&drawtextwidth)
- [drawVLine](#var.vPublish=true&var.vSingle=true&drawvline)
- [drawWidth](#var.vPublish=true&var.vSingle=true&drawwidth)

---

### drawArc

Draw an arc curve from the current point to the end point

#### Arguments

**rx -**
The arc ellipse's x-radius

**ry -**
The arc ellipse's y-radius

**angle -**
The rotation (in degrees) of the ellipse relative to the x-axis

**largeArcFlag -**
Either large arc (1) or small arc (0)

**sweepFlag -**
Either clockwise turning arc (1) or counterclockwise turning arc (0)

**x -**
The x-coordinate of the end point

**y -**
The y-coordinate of the end point

#### Returns

Nothing

---

### drawCircle

Draw a circle

#### Arguments

**cx -**
The x-coordinate of the center of the circle

**cy -**
The y-coordinate of the center of the circle

**r -**
The radius of the circle

#### Returns

Nothing

---

### drawClose

Close the current drawing path

#### Arguments

None

#### Returns

Nothing

---

### drawEllipse

Draw an ellipse

#### Arguments

**cx -**
The x-coordinate of the center of the ellipse

**cy -**
The y-coordinate of the center of the ellipse

**rx -**
The x-radius of the ellipse

**ry -**
The y-radius of the ellipse

#### Returns

Nothing

---

### drawHLine

Draw a horizontal line from the current point to the end point

#### Arguments

**x -**
The x-coordinate of the end point

#### Returns

Nothing

---

### drawHeight

Get the current drawing's height

#### Arguments

None

#### Returns

The current drawing's height

---

### drawImage

Draw an image

#### Arguments

**x -**
The x-coordinate of the center of the image

**y -**
The y-coordinate of the center of the image

**width -**
The width of the image

**height -**
The height of the image

**href -**
The image resource URL

#### Returns

Nothing

---

### drawLine

Draw a line from the current point to the end point

#### Arguments

**x -**
The x-coordinate of the end point

**y -**
The y-coordinate of the end point

#### Returns

Nothing

---

### drawMove

Move the path's drawing point

#### Arguments

**x -**
The x-coordinate of the new drawing point

**y -**
The y-coordinate of the new drawing point

#### Returns

Nothing

---

### drawNew

Create a new drawing

#### Arguments

**width -**
The width of the drawing

**height -**
The height of the drawing

#### Returns

Nothing

---

### drawOnClick

Set the most recent drawing object's on-click event handler

#### Arguments

**callback -**
The on-click event callback function (x, y)

#### Returns

Nothing

---

### drawPathRect

Draw a rectangle as a path

#### Arguments

**x -**
The x-coordinate of the top-left of the rectangle

**y -**
The y-coordinate of the top-left of the rectangle

**width -**
The width of the rectangle

**height -**
The height of the rectangle

#### Returns

Nothing

---

### drawRect

Draw a rectangle

#### Arguments

**x -**
The x-coordinate of the top-left of the rectangle

**y -**
The y-coordinate of the top-left of the rectangle

**width -**
The width of the rectangle

**height -**
The height of the rectangle

**rx -**
Optional (default is null). The horizontal corner radius of the rectangle.

**ry -**
Optional (default is null). The vertical corner radius of the rectangle.

#### Returns

Nothing

---

### drawStyle

Set the current drawing styles

#### Arguments

**stroke -**
Optional (default is 'black'). The stroke color.

**strokeWidth -**
Optional (default is 1). The stroke width.

**fill -**
Optional (default is 'none'). The fill color.

**strokeDashArray -**
Optional (default is 'none'). The stroke
[dash array](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray#usage_notes).

#### Returns

Nothing

---

### drawText

Draw text

#### Arguments

**text -**
The text to draw

**x -**
The x-coordinate of the text

**y -**
The y-coordinate of the text

**textAnchor -**
Optional (default is 'middle'). The
[text anchor](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor#usage_notes) style.

**dominantBaseline -**
Optional (default is 'middle'). The
[dominant baseline](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/dominant-baseline#usage_notes)
style.

#### Returns

Nothing

---

### drawTextHeight

Compute the text's height to fit the width

#### Arguments

**text -**
The text

**width -**
The width of the text. If 0, the default font size (in pixels) is returned.

#### Returns

The text's height, in pixels

---

### drawTextStyle

Set the current text drawing styles

#### Arguments

**fontSizePx -**
Optional (default is null, the default font size). The text font size, in pixels.

**textFill -**
Optional (default is 'black'). The text fill color.

**bold -**
Optional (default is false). If true, text is bold.

**italic -**
Optional (default is false). If true, text is italic.

**fontFamily -**
Optional (default is null, the default font family). The text font family.

#### Returns

Nothing

---

### drawTextWidth

Compute the text's width

#### Arguments

**text -**
The text

**fontSizePx -**
The text font size, in pixels

#### Returns

The text's width, in pixels

---

### drawVLine

Draw a vertical line from the current point to the end point

#### Arguments

**y -**
The y-coordinate of the end point

#### Returns

Nothing

---

### drawWidth

Get the current drawing's width

#### Arguments

None

#### Returns

The current drawing's width

---

## Element Model

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [elementModelRender](#var.vPublish=true&var.vSingle=true&elementmodelrender)

---

### elementModelRender

Render an [element model](https://github.com/craigahobbs/element-model#readme)

**Note:** Element model "callback" members are a map of event name (e.g., "click") to
event callback function. The following events have callback arguments:
- **keydown** - keyCode
- **keypress** - keyCode
- **keyup** - keyCode

#### Arguments

**element -**
The [element model](https://github.com/craigahobbs/element-model#readme)

#### Returns

Nothing

---

## JSON

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [jsonParse](#var.vPublish=true&var.vSingle=true&jsonparse)
- [jsonStringify](#var.vPublish=true&var.vSingle=true&jsonstringify)

---

### jsonParse

Convert a JSON string to an object

#### Arguments

**string -**
The JSON string

#### Returns

The object

---

### jsonStringify

Convert an object to a JSON string

#### Arguments

**value -**
The object

**indent -**
Optional (default is null). The indentation number.

#### Returns

The JSON string

---

## Local Storage

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [localStorageClear](#var.vPublish=true&var.vSingle=true&localstorageclear)
- [localStorageGet](#var.vPublish=true&var.vSingle=true&localstorageget)
- [localStorageRemove](#var.vPublish=true&var.vSingle=true&localstorageremove)
- [localStorageSet](#var.vPublish=true&var.vSingle=true&localstorageset)

---

### localStorageClear

Clear all keys from the browser's local storage

#### Arguments

None

#### Returns

Nothing

---

### localStorageGet

Get a browser local storage key's value

#### Arguments

**key -**
The key string

#### Returns

The local storage value string or null if the key does not exist

---

### localStorageRemove

Remove a browser local storage key

#### Arguments

**key -**
The key string

#### Returns

Nothing

---

### localStorageSet

Set a browser local storage key's value

#### Arguments

**key -**
The key string

**value -**
The value string

#### Returns

Nothing

---

## Markdown

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [markdownEscape](#var.vPublish=true&var.vSingle=true&markdownescape)
- [markdownHeaderId](#var.vPublish=true&var.vSingle=true&markdownheaderid)
- [markdownParse](#var.vPublish=true&var.vSingle=true&markdownparse)
- [markdownPrint](#var.vPublish=true&var.vSingle=true&markdownprint)
- [markdownTitle](#var.vPublish=true&var.vSingle=true&markdowntitle)

---

### markdownEscape

Escape text for inclusion in Markdown text

#### Arguments

**text -**
The text

#### Returns

The escaped text

---

### markdownHeaderId

Compute the Markdown header element ID for some text

#### Arguments

**text -**
The text

#### Returns

The header element ID

---

### markdownParse

Parse Markdown text

#### Arguments

**lines... -**
The Markdown text lines (may contain nested arrays of un-split lines)

#### Returns

The [Markdown model](https://craigahobbs.github.io/markdown-model/model/#var.vName='Markdown')

---

### markdownPrint

Render Markdown text

#### Arguments

**lines... -**
The Markdown text lines (may contain nested arrays of un-split lines)

#### Returns

Nothing

---

### markdownTitle

Compute the title of a [Markdown model](https://craigahobbs.github.io/markdown-model/model/#var.vName='Markdown')

#### Arguments

**markdownModel -**
The [Markdown model](https://craigahobbs.github.io/markdown-model/model/#var.vName='Markdown')

#### Returns

The Markdown title or null if there is no title

---

## Math

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [mathAbs](#var.vPublish=true&var.vSingle=true&mathabs)
- [mathAcos](#var.vPublish=true&var.vSingle=true&mathacos)
- [mathAsin](#var.vPublish=true&var.vSingle=true&mathasin)
- [mathAtan](#var.vPublish=true&var.vSingle=true&mathatan)
- [mathAtan2](#var.vPublish=true&var.vSingle=true&mathatan2)
- [mathCeil](#var.vPublish=true&var.vSingle=true&mathceil)
- [mathCos](#var.vPublish=true&var.vSingle=true&mathcos)
- [mathFloor](#var.vPublish=true&var.vSingle=true&mathfloor)
- [mathLn](#var.vPublish=true&var.vSingle=true&mathln)
- [mathLog](#var.vPublish=true&var.vSingle=true&mathlog)
- [mathMax](#var.vPublish=true&var.vSingle=true&mathmax)
- [mathMin](#var.vPublish=true&var.vSingle=true&mathmin)
- [mathPi](#var.vPublish=true&var.vSingle=true&mathpi)
- [mathRandom](#var.vPublish=true&var.vSingle=true&mathrandom)
- [mathRound](#var.vPublish=true&var.vSingle=true&mathround)
- [mathSign](#var.vPublish=true&var.vSingle=true&mathsign)
- [mathSin](#var.vPublish=true&var.vSingle=true&mathsin)
- [mathSqrt](#var.vPublish=true&var.vSingle=true&mathsqrt)
- [mathTan](#var.vPublish=true&var.vSingle=true&mathtan)

---

### mathAbs

Compute the absolute value of a number

#### Arguments

**x -**
The number

#### Returns

The absolute value of the number

---

### mathAcos

Compute the arccosine, in radians, of a number

#### Arguments

**x -**
The number

#### Returns

The arccosine, in radians, of the number

---

### mathAsin

Compute the arcsine, in radians, of a number

#### Arguments

**x -**
The number

#### Returns

The arcsine, in radians, of the number

---

### mathAtan

Compute the arctangent, in radians, of a number

#### Arguments

**x -**
The number

#### Returns

The arctangent, in radians, of the number

---

### mathAtan2

Compute the angle, in radians, between (0, 0) and a point

#### Arguments

**y -**
The Y-coordinate of the point

**x -**
The X-coordinate of the point

#### Returns

The angle, in radians

---

### mathCeil

Compute the ceiling of a number (round up to the next highest integer)

#### Arguments

**x -**
The number

#### Returns

The ceiling of the number

---

### mathCos

Compute the cosine of an angle, in radians

#### Arguments

**x -**
The angle, in radians

#### Returns

The cosine of the angle

---

### mathFloor

Compute the floor of a number (round down to the next lowest integer)

#### Arguments

**x -**
The number

#### Returns

The floor of the number

---

### mathLn

Compute the natural logarithm (base e) of a number

#### Arguments

**x -**
The number

#### Returns

The natural logarithm of the number

---

### mathLog

Compute the logarithm (base 10) of a number

#### Arguments

**x -**
The number

**base -**
Optional (default is 10). The logarithm base.

#### Returns

The logarithm of the number

---

### mathMax

Compute the maximum value

#### Arguments

**values... -**
The values

#### Returns

The maximum value

---

### mathMin

Compute the minimum value

#### Arguments

**values... -**
The values

#### Returns

The minimum value

---

### mathPi

Return the number pi

#### Arguments

None

#### Returns

The number pi

---

### mathRandom

Compute a random number between 0 and 1, inclusive

#### Arguments

None

#### Returns

A random number

---

### mathRound

Round a number to a certain number of decimal places

#### Arguments

**x -**
The number

**digits -**
Optional (default is 0). The number of decimal digits to round to.

#### Returns

The rounded number

---

### mathSign

Compute the sign of a number

#### Arguments

**x -**
The number

#### Returns

-1 for a negative number, 1 for a positive number, and 0 for zero

---

### mathSin

Compute the sine of an angle, in radians

#### Arguments

**x -**
The angle, in radians

#### Returns

The sine of the angle

---

### mathSqrt

Compute the square root of a number

#### Arguments

**x -**
The number

#### Returns

The square root of the number

---

### mathTan

Compute the tangent of an angle, in radians

#### Arguments

**x -**
The angle, in radians

#### Returns

The tangent of the angle

---

## Number

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [numberParseFloat](#var.vPublish=true&var.vSingle=true&numberparsefloat)
- [numberParseInt](#var.vPublish=true&var.vSingle=true&numberparseint)
- [numberToFixed](#var.vPublish=true&var.vSingle=true&numbertofixed)

---

### numberParseFloat

Parse a string as a floating point number

#### Arguments

**string -**
The string

#### Returns

The number

---

### numberParseInt

Parse a string as an integer

#### Arguments

**string -**
The string

**radix -**
Optional (default is 10). The number base.

#### Returns

The integer

---

### numberToFixed

Format a number using fixed-point notation

#### Arguments

**x -**
The number

**digits -**
Optional (default is 2). The number of digits to appear after the decimal point.

**trim -**
Optional (default is false). If true, trim trailing zeroes and decimal point.

#### Returns

The fixed-point notation string

---

## Object

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [objectAssign](#var.vPublish=true&var.vSingle=true&objectassign)
- [objectCopy](#var.vPublish=true&var.vSingle=true&objectcopy)
- [objectDelete](#var.vPublish=true&var.vSingle=true&objectdelete)
- [objectGet](#var.vPublish=true&var.vSingle=true&objectget)
- [objectHas](#var.vPublish=true&var.vSingle=true&objecthas)
- [objectKeys](#var.vPublish=true&var.vSingle=true&objectkeys)
- [objectNew](#var.vPublish=true&var.vSingle=true&objectnew)
- [objectSet](#var.vPublish=true&var.vSingle=true&objectset)

---

### objectAssign

Assign the keys/values of one object to another

#### Arguments

**object -**
The object to assign to

**object2 -**
The object to assign

#### Returns

The updated object

---

### objectCopy

Create a copy of an object

#### Arguments

**object -**
The object to copy

#### Returns

The object copy

---

### objectDelete

Delete an object key

#### Arguments

**object -**
The object

**key -**
The key to delete

#### Returns

Nothing

---

### objectGet

Get an object key's value

#### Arguments

**object -**
The object

**key -**
The key

**defaultValue -**
The default value (optional)

#### Returns

The value or null if the key does not exist

---

### objectHas

Test if an object contains a key

#### Arguments

**object -**
The object

**key -**
The key

#### Returns

true if the object contains the key, false otherwise

---

### objectKeys

Get an object's keys

#### Arguments

**object -**
The object

#### Returns

The array of keys

---

### objectNew

Create a new object

#### Arguments

**keyValues... -**
The object's initial key and value pairs

#### Returns

The new object

---

### objectSet

Set an object key's value

#### Arguments

**object -**
The object

**key -**
The key

**value -**
The value to set

#### Returns

The value to set

---

## Regex

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [regexEscape](#var.vPublish=true&var.vSingle=true&regexescape)
- [regexMatch](#var.vPublish=true&var.vSingle=true&regexmatch)
- [regexMatchAll](#var.vPublish=true&var.vSingle=true&regexmatchall)
- [regexNew](#var.vPublish=true&var.vSingle=true&regexnew)
- [regexReplace](#var.vPublish=true&var.vSingle=true&regexreplace)
- [regexSplit](#var.vPublish=true&var.vSingle=true&regexsplit)

---

### regexEscape

Escape a string for use in a regular expression

#### Arguments

**string -**
The string to escape

#### Returns

The escaped string

---

### regexMatch

Find the first match of a regular expression in a string

#### Arguments

**regex -**
The regular expression

**string -**
The string

#### Returns

The [match object](https://craigahobbs.github.io/bare-script/library/model.html#var.vName='RegexMatch'),
or null if no matches are found

---

### regexMatchAll

Find all matches of regular expression in a string

#### Arguments

**regex -**
The regular expression

**string -**
The string

#### Returns

The array of [match objects](https://craigahobbs.github.io/bare-script/library/model.html#var.vName='RegexMatch')

---

### regexNew

Create a regular expression

#### Arguments

**pattern -**
The [regular expression pattern string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions#writing_a_regular_expression_pattern)

**flags -**
The regular expression flags. The string may contain the following characters:
- **i** - case-insensitive search
- **m** - multi-line search - "^" and "$" matches next to newline characters
- **s** - "." matches newline characters

#### Returns

The regular expression or null if the pattern is invalid

---

### regexReplace

Replace regular expression matches with a string

#### Arguments

**regex -**
The replacement regular expression

**string -**
The string

**substr -**
The replacement string

#### Returns

The updated string

---

### regexSplit

Split a string with a regular expression

#### Arguments

**regex -**
The regular expression

**string -**
The string

#### Returns

The array of split parts

---

## Schema

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [schemaElements](#var.vPublish=true&var.vSingle=true&schemaelements)
- [schemaParse](#var.vPublish=true&var.vSingle=true&schemaparse)
- [schemaParseEx](#var.vPublish=true&var.vSingle=true&schemaparseex)
- [schemaTypeModel](#var.vPublish=true&var.vSingle=true&schematypemodel)
- [schemaValidate](#var.vPublish=true&var.vSingle=true&schemavalidate)
- [schemaValidateTypeModel](#var.vPublish=true&var.vSingle=true&schemavalidatetypemodel)

---

### schemaElements

Get a schema type's documentation [element model](https://github.com/craigahobbs/element-model#readme).
Render the element model with the [elementModelRender](#var.vName='elementModelRender') function.

#### Arguments

**types -**
The [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')

**typeName -**
The type name

**actionURLs -**
Optional (default is null). The
[action URL overrides](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='ActionURL').

**actionCustom -**
Optional (default is false). If true, the action has a custom response.

#### Returns

The schema type's documentation [element model](https://github.com/craigahobbs/element-model#readme)

---

### schemaParse

Parse the [Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) text

#### Arguments

**lines... -**
The [Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/)
text lines (may contain nested arrays of un-split lines)

#### Returns

The schema's [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')

---

### schemaParseEx

Parse the [Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/) text with options

#### Arguments

**lines -**
The array of [Schema Markdown](https://craigahobbs.github.io/schema-markdown-js/language/)
text lines (may contain nested arrays of un-split lines)

**types -**
Optional. The [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types').

**filename -**
Optional (default is ""). The file name.

#### Returns

The schema's [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')

---

### schemaTypeModel

Get the [Schema Markdown Type Model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')

#### Arguments

None

#### Returns

The [Schema Markdown Type Model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')

---

### schemaValidate

Validate an object to a schema type

#### Arguments

**types -**
The [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')

**typeName -**
The type name

**value -**
The object to validate

#### Returns

The validated object or null if validation fails

---

### schemaValidateTypeModel

Validate a [Schema Markdown Type Model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')

#### Arguments

**types -**
The [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types') to validate

#### Returns

The validated [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')

---

## Session Storage

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [sessionStorageClear](#var.vPublish=true&var.vSingle=true&sessionstorageclear)
- [sessionStorageGet](#var.vPublish=true&var.vSingle=true&sessionstorageget)
- [sessionStorageRemove](#var.vPublish=true&var.vSingle=true&sessionstorageremove)
- [sessionStorageSet](#var.vPublish=true&var.vSingle=true&sessionstorageset)

---

### sessionStorageClear

Clear all keys from the browser's session storage

#### Arguments

None

#### Returns

Nothing

---

### sessionStorageGet

Get a browser session storage key's value

#### Arguments

**key -**
The key string

#### Returns

The session storage value string or null if the key does not exist

---

### sessionStorageRemove

Remove a browser session storage key

#### Arguments

**key -**
The key string

#### Returns

Nothing

---

### sessionStorageSet

Set a browser session storage key's value

#### Arguments

**key -**
The key string

**value -**
The value string

#### Returns

Nothing

---

## String

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [stringCharCodeAt](#var.vPublish=true&var.vSingle=true&stringcharcodeat)
- [stringEndsWith](#var.vPublish=true&var.vSingle=true&stringendswith)
- [stringFromCharCode](#var.vPublish=true&var.vSingle=true&stringfromcharcode)
- [stringIndexOf](#var.vPublish=true&var.vSingle=true&stringindexof)
- [stringLastIndexOf](#var.vPublish=true&var.vSingle=true&stringlastindexof)
- [stringLength](#var.vPublish=true&var.vSingle=true&stringlength)
- [stringLower](#var.vPublish=true&var.vSingle=true&stringlower)
- [stringNew](#var.vPublish=true&var.vSingle=true&stringnew)
- [stringRepeat](#var.vPublish=true&var.vSingle=true&stringrepeat)
- [stringReplace](#var.vPublish=true&var.vSingle=true&stringreplace)
- [stringSlice](#var.vPublish=true&var.vSingle=true&stringslice)
- [stringSplit](#var.vPublish=true&var.vSingle=true&stringsplit)
- [stringStartsWith](#var.vPublish=true&var.vSingle=true&stringstartswith)
- [stringTrim](#var.vPublish=true&var.vSingle=true&stringtrim)
- [stringUpper](#var.vPublish=true&var.vSingle=true&stringupper)

---

### stringCharCodeAt

Get a string index's character code

#### Arguments

**string -**
The string

**index -**
The character index

#### Returns

The character code

---

### stringEndsWith

Determine if a string ends with a search string

#### Arguments

**string -**
The string

**search -**
The search string

#### Returns

true if the string ends with the search string, false otherwise

---

### stringFromCharCode

Create a string of characters from character codes

#### Arguments

**charCodes... -**
The character codes

#### Returns

The string of characters

---

### stringIndexOf

Find the first index of a search string in a string

#### Arguments

**string -**
The string

**search -**
The search string

**index -**
Optional (default is 0). The index at which to start the search.

#### Returns

The first index of the search string; -1 if not found.

---

### stringLastIndexOf

Find the last index of a search string in a string

#### Arguments

**string -**
The string

**search -**
The search string

**index -**
Optional (default is the end of the string). The index at which to start the search.

#### Returns

The last index of the search string; -1 if not found.

---

### stringLength

Get the length of a string

#### Arguments

**string -**
The string

#### Returns

The string's length; zero if not a string

---

### stringLower

Convert a string to lower-case

#### Arguments

**string -**
The string

#### Returns

The lower-case string

---

### stringNew

Create a new string from a value

#### Arguments

**value -**
The value

#### Returns

The new string

---

### stringRepeat

Repeat a string

#### Arguments

**string -**
The string to repeat

**count -**
The number of times to repeat the string

#### Returns

The repeated string

---

### stringReplace

Replace all instances of a string with another string

#### Arguments

**string -**
The string to update

**substr -**
The string to replace

**newSubstr -**
The replacement string

#### Returns

The updated string

---

### stringSlice

Copy a portion of a string

#### Arguments

**string -**
The string

**start -**
The start index of the slice

**end -**
Optional (default is the end of the string). The end index of the slice.

#### Returns

The new string slice

---

### stringSplit

Split a string

#### Arguments

**string -**
The string to split

**separator -**
The separator string

#### Returns

The array of split-out strings

---

### stringStartsWith

Determine if a string starts with a search string

#### Arguments

**string -**
The string

**search -**
The search string

#### Returns

true if the string starts with the search string, false otherwise

---

### stringTrim

Trim the whitespace from the beginning and end of a string

#### Arguments

**string -**
The string

#### Returns

The trimmed string

---

### stringUpper

Convert a string to upper-case

#### Arguments

**string -**
The string

#### Returns

The upper-case string

---

## System

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [systemBoolean](#var.vPublish=true&var.vSingle=true&systemboolean)
- [systemCompare](#var.vPublish=true&var.vSingle=true&systemcompare)
- [systemFetch](#var.vPublish=true&var.vSingle=true&systemfetch)
- [systemGlobalGet](#var.vPublish=true&var.vSingle=true&systemglobalget)
- [systemGlobalIncludesGet](#var.vPublish=true&var.vSingle=true&systemglobalincludesget)
- [systemGlobalIncludesName](#var.vPublish=true&var.vSingle=true&systemglobalincludesname)
- [systemGlobalSet](#var.vPublish=true&var.vSingle=true&systemglobalset)
- [systemIs](#var.vPublish=true&var.vSingle=true&systemis)
- [systemLog](#var.vPublish=true&var.vSingle=true&systemlog)
- [systemLogDebug](#var.vPublish=true&var.vSingle=true&systemlogdebug)
- [systemPartial](#var.vPublish=true&var.vSingle=true&systempartial)
- [systemType](#var.vPublish=true&var.vSingle=true&systemtype)

---

### systemBoolean

Interpret a value as a boolean

#### Arguments

**value -**
The value

#### Returns

true or false

---

### systemCompare

Compare two values

#### Arguments

**left -**
The left value

**right -**
The right value

#### Returns

-1 if the left value is less than the right value, 0 if equal, and 1 if greater than

---

### systemFetch

Retrieve a URL resource

#### Arguments

**url -**
The resource URL,
[request model](https://craigahobbs.github.io/bare-script/library/model.html#var.vName='SystemFetchRequest'),
or array of URL and
[request model](https://craigahobbs.github.io/bare-script/library/model.html#var.vName='SystemFetchRequest')

#### Returns

The response string or array of strings; null if an error occurred

---

### systemGlobalGet

Get a global variable value

#### Arguments

**name -**
The global variable name

**defaultValue -**
The default value (optional)

#### Returns

The global variable's value or null if it does not exist

---

### systemGlobalIncludesGet

Get the global system includes object

#### Arguments

None

#### Returns

The global system includes object

---

### systemGlobalIncludesName

Get the system includes object global variable name

#### Arguments

None

#### Returns

The system includes object global variable name

---

### systemGlobalSet

Set a global variable value

#### Arguments

**name -**
The global variable name

**value -**
The global variable's value

#### Returns

The global variable's value

---

### systemIs

Test if one value is the same object as another

#### Arguments

**value1 -**
The first value

**value2 -**
The second value

#### Returns

true if values are the same object, false otherwise

---

### systemLog

Log a message to the console

#### Arguments

**message -**
The log message

#### Returns

Nothing

---

### systemLogDebug

Log a message to the console, if in debug mode

#### Arguments

**message -**
The log message

#### Returns

Nothing

---

### systemPartial

Return a new function which behaves like "func" called with "args".
If additional arguments are passed to the returned function, they are appended to "args".

#### Arguments

**func -**
The function

**args... -**
The function arguments

#### Returns

The new function called with "args"

---

### systemType

Get a value's type string

#### Arguments

**value -**
The value

#### Returns

The type string of the value.
Valid values are: 'array', 'boolean', 'datetime', 'function', 'null', 'number', 'object', 'regex', 'string'.

---

## URL

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [urlEncode](#var.vPublish=true&var.vSingle=true&urlencode)
- [urlEncodeComponent](#var.vPublish=true&var.vSingle=true&urlencodecomponent)
- [urlObjectCreate](#var.vPublish=true&var.vSingle=true&urlobjectcreate)

---

### urlEncode

Encode a URL

#### Arguments

**url -**
The URL string

#### Returns

The encoded URL string

---

### urlEncodeComponent

Encode a URL component

#### Arguments

**url -**
The URL component string

#### Returns

The encoded URL component string

---

### urlObjectCreate

Create an object URL (i.e. a file download URL)

#### Arguments

**data -**
The object data string

**contentType -**
Optional (default is "text/plain"). The object content type.

#### Returns

The object URL string

---

## Window

[Back to top](#var.vPublish=true&var.vSingle=true&_top)

### Function Index

- [windowClipboardRead](#var.vPublish=true&var.vSingle=true&windowclipboardread)
- [windowClipboardWrite](#var.vPublish=true&var.vSingle=true&windowclipboardwrite)
- [windowHeight](#var.vPublish=true&var.vSingle=true&windowheight)
- [windowSetLocation](#var.vPublish=true&var.vSingle=true&windowsetlocation)
- [windowSetResize](#var.vPublish=true&var.vSingle=true&windowsetresize)
- [windowSetTimeout](#var.vPublish=true&var.vSingle=true&windowsettimeout)
- [windowWidth](#var.vPublish=true&var.vSingle=true&windowwidth)

---

### windowClipboardRead

Read text from the clipboard

#### Arguments

None

#### Returns

The clipboard text

---

### windowClipboardWrite

Write text to the clipboard

#### Arguments

**text -**
The text to write

#### Returns

Nothing

---

### windowHeight

Get the browser window's height

#### Arguments

None

#### Returns

The browser window's height

---

### windowSetLocation

Navigate the browser window to a location URL

#### Arguments

**url -**
The new location URL

#### Returns

Nothing

---

### windowSetResize

Set the browser window resize event handler

#### Arguments

**callback -**
The window resize callback function

#### Returns

Nothing

---

### windowSetTimeout

Set the browser window timeout event handler

#### Arguments

**callback -**
The window timeout callback function

**delay -**
The delay, in milliseconds, to ellapse before calling the timeout

#### Returns

Nothing

---

### windowWidth

Get the browser window's width

#### Arguments

None

#### Returns

The browser window's width
