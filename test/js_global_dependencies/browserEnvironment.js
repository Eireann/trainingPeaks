define(["document", "window", "localStorage"],
function(document, window, localStorage)
{
    global.document = document;
    global.window = window;
    global.localStorage = localStorage;
    window.localStorage = localStorage;
    return global;
});