define(
[
    "backbone",
    "controllers/sampleController"
],
function (Backbone, SampleController)
{
    var Router = Backbone.Router.extend(
    {
        routes:
        {
            "": "index"
        },

        index: function()
        {
            (new SampleController()).load();
        }
    });

    return Router;
});
