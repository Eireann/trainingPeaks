/*

Wraps and extends core backbone and marionette functionality
*/

define(
[
    "backbone",
    "backbone.stickit",
    "backbone.marionette",
    "framework/APIModel",
    "framework/Logger"
],
function(Backbone, BackboneStickit, Marionette, APIModel, Logger)
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

    // Give all views optional waiting indicators
    var commonViewFunctions = {

        showThrobbers: true,

        modelEvents: {
            "request": "onWaitStart",
            "sync": "onWaitStop",
            "error": "onWaitStop",
            "change": "render",
            "destroy": "onWaitStop"
        },

        collectionEvents: {
            "request": "onWaitStart",
            "sync": "onWaitStop",
            "error": "onWaitStop",
            "refresh": "render",
            "destroy": "onWaitStop"
        },

        onWaitStart: function()
        {
            if (this.showThrobbers)
            {
                this.$el.addClass('waiting');
            }
        },

        onWaitStop: function()
        {
            this.$el.removeClass('waiting');
        }

    };

    TP.Events = Backbone.Events;

    TP.View = Marionette.View.extend();
    TP.ItemView = Marionette.ItemView.extend(commonViewFunctions);
    TP.CollectionView = Marionette.CollectionView.extend(commonViewFunctions);
    TP.CompositeView = Marionette.CompositeView.extend(commonViewFunctions);

    // Backbone stuff
    TP.history = Backbone.history;
    TP.Collection = Backbone.Collection.extend({});
    TP.Model = Backbone.Model.extend({});
    TP.APIModel = APIModel;
    TP.Router = Backbone.Router.extend({});

    TP.Logger = Logger;

    return TP;
});