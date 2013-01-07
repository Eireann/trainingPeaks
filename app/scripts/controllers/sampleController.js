define(
[
    "app",
    
    "views/sampleContentView",
    "Backbone.Marionette"
],
function (App, SampleContentView, Marionette)
{
    return Marionette.Controller.extend(
    {
        initialize: function()
        {

        },
        
        load: function()
        {
            var view = new SampleContentView();
            App.main.show(view);
        }
    });
});