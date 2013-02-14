define(["jsdom"],
function(jsdom)
{
    var document = jsdom.jsdom("<html><body></body></html>");
    return document;
});