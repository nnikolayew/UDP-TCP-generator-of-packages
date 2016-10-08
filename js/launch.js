chrome.app.runtime.onLaunched.addListener(function () {
    // Center window on screen.
    var screenWidth = screen.availWidth;
    var screenHeight = screen.availHeight;
    var width = 300;
    var height = 494;

    chrome.app.window.create('index.html', {
        id: "gen-lab2",
        resizable: false,
        innerBounds: {
            width: width,
            height: height,
            left: Math.round((screenWidth - width) / 2),
            top: Math.round((screenHeight - height) / 2),
            minWidth: width,
            minHeight: height,
            maxWidth: width,
            maxHeight: height
        }
    });
});
