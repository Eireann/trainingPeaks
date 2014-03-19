/* jshint ignore:start */
var viewerReady = new $.Deferred();

function LoadPublicFileViewer(cssSelector, token, userType)
{
    viewerReady.done(function(PublicFileViewer)
    {
        var pfv = new PublicFileViewer({ el: $(cssSelector), token: token, userType: userType });

        pfv.load().done(function(){pfv.render();});
    });
}

requirejs([
    "wrappedMoment"
], function(wrappedMoment)
{
    requirejs(
    [
      "jquery",
      "components/publicFileViewer/js/publicFileViewer"
    ],
    function(
      $,
      PublicFileViewer
    )
    {
        viewerReady.resolve(PublicFileViewer);
    });
});
/* jshint ignore:end */
