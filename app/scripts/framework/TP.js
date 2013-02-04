/*

Wraps and extends core backbone and marionette functionality
*/

define(
[
    "backbone",
    "backbone.marionette",
    "framework/APIModel"
],
function(Backbone, Marionette, APIModel)
{
    var TP = {};

    // Marionette stuff
    TP.Application = Marionette.Application.extend({});
    TP.Controller = Marionette.Controller.extend(
    {
        getLayout: function()
        {
            return this.layout;
        },
        
        onError: function(msg)
        {
            alert(msg);
        }
    });
    TP.Layout = Marionette.Layout.extend(
    {
    });
    TP.Region = Marionette.Region;

    // Give all views waiting indicators and event bubblers
    var commonViewFunctions = {

        modelEvents: {
            "request": "onWaitStart",
            "sync": "onWaitStop",
            "error": "onWaitStop"
        },

        onWaitStart: function()
        {
            this.trigger("waitStart");
            this.$el.addClass('waiting');
        },

        onWaitStop: function()
        {
            this.trigger("waitStop");
            this.$el.removeClass('waiting');
        }

    };

    TP.View = Backbone.View.extend();
    TP.ItemView = Marionette.ItemView.extend(commonViewFunctions);
    TP.CollectionView = Marionette.CollectionView.extend(commonViewFunctions);
    TP.CompositeView = Marionette.CompositeView.extend(commonViewFunctions);

    // Backbone stuff
    TP.history = Backbone.history;
    TP.Collection = Backbone.Collection.extend({});
    TP.Model = Backbone.Model.extend({});
    TP.APIModel = APIModel;
    TP.Router = Backbone.Router.extend({});

    return TP;
});