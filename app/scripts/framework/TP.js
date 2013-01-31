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
    TP.Controller = Marionette.Controller.extend({
        onError: function(msg)
        {
            alert(msg);
        }
    });
    TP.Layout = Marionette.Layout.extend({});
    TP.Region = Marionette.Region;
    TP.ItemView = Marionette.ItemView.extend({});
    TP.CollectionView = Marionette.CollectionView.extend({});
    TP.CompositeView = Marionette.CompositeView.extend({});

    // Backbone stuff
    TP.history = Backbone.history;
    TP.Collection = Backbone.Collection.extend({});
    TP.Model = Backbone.Model.extend({});
    TP.APIModel = APIModel;
    TP.Router = Backbone.Router.extend({});

    return TP;

});