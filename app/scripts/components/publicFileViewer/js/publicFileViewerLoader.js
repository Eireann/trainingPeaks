/* jshint ignore:start */
var viewerReady = new $.Deferred();

function LoadPublicFileViewer(options)
{
    var loadPromise = new $.Deferred();
    viewerReady.done(function(PublicFileViewer)
    {
        var pfv = new PublicFileViewer(options);
        pfv.load().done(function()
        {
          loadPromise.resolve();
        });
    });
    return loadPromise;
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
