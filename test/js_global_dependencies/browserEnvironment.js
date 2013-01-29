define(["document", "window", "localStorage"],
function(document, window, localStorage)
{
    global.document = document;
    global.window = window;
    global.localStorage = localStorage;
    window.localStorage = localStorage;
    global.navigator = {
        userAgent: 'Grunt'
    };
    return global;
});