# MarkdownUp Dynamic Markdown Example

~~~ markdown-script
# Variable arguments
helloCount = if(vCount != null, vCount, 5)

# Constants
width = 140
height = 40
borderSize = 5
borderColor = 'blue'

# Render the more/less menu
markdownPrint( \
    '', \
    if(helloCount <= 1, 'Less', '[Less](#var.vCount=' + (helloCount - 1) + ')') + ' | ', \
    '[More](#var.vCount=' + (helloCount + 1) + ')' \
)

# Render many hellos
ixHello = 0
helloLoop:
    # Render the hello title
    helloTitle = 'Hello #' + (ixHello + 1)
    markdownPrint('', '## ' + helloTitle)

    # Render the hello drawing
    setDrawingSize(width, height)
    drawStyle(borderColor, borderSize)
    drawRect(0.5 * borderSize, 0.5 * borderSize, width - borderSize, height - borderSize)
    drawTextStyle(0.67 * height, null, true)
    drawText(helloTitle, 0.5 * width, 0.55 * height)

    ixHello = ixHello + 1
jumpif (ixHello < helloCount) helloLoop
~~~
