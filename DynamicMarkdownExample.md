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
while ixHello < helloCount do
    # Render the hello title
    helloTitle = 'Hello #' + (ixHello + 1)
    markdownPrint('', '## ' + helloTitle)

    # Render the hello drawing
    setDrawingSize(width, height)
    drawStyle('red', borderSize, 'blue')
    drawRect(0.5 * borderSize, 0.5 * borderSize, width - borderSize, height - borderSize)
    drawTextStyle(0.67 * height, 'white', true)
    drawText(helloTitle, 0.5 * width, 0.55 * height)

    ixHello = ixHello + 1
endwhile
~~~
