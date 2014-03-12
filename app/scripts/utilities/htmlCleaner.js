define(
[
    "jquery",
    "jqueryHtmlClean"
],
function(
    $,
    jqueryHtmlClean
    )
{

    var HTMLCleaner = {

        clean: function(html)
        {
            html = this._removeDisallowedTags(html);
            html = this._fixParagraphsAndLineBreaks(html);
            return html; 
        },

        _removeDisallowedTags: function(html)
        {
            return $.htmlClean(html, {
                allowedTags: ["p", "br", "li", "ul", "ol"],
                allowedAttributes: [],
                allowedClasses: [],
                removeAttrs: ["class", "style"]
            });
        },

        _fixParagraphsAndLineBreaks: function(html)
        {
            // wrap plain text in paragraphs, at the top level only
            var htmlContainer = $("<div>").html(html);
            htmlContainer.contents().filter(function(){return this.nodeType === 3;}).wrap("<p></p>");

            // remove line break tags, at the top level only
            htmlContainer.contents().filter("br").remove(); 

            return htmlContainer.html();
        }

    };

    return HTMLCleaner;

});
