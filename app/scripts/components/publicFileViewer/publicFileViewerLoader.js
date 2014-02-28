var viewerReady = new $.Deferred();

function LoadPublicFileViewer(cssSelector, token)
{
    viewerReady.done(function(PublicFileViewer)
    {
        var pfv = new PublicFileViewer({ el: $("#main"), token: token });

        pfv.load().done(function(){pfv.render()});
    });
}

requirejs([
    "wrappedMoment"
], function(wrappedMoment)
{
    requirejs(
    [
      "jquery",
      "publicFileViewer/publicFileViewer"
    ],
    function(
      $,
      PublicFileViewer
    )
    {
        viewerReady.resolve(PublicFileViewer);
    });
});