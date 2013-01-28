/*

Wraps and extends core backbone and marionette functionality
*/

define(
[
    "backbone",
    "backbone.marionette"
],
function(Backbone, Marionette)
{

    var TP = {};

    // Marionette stuff
    TP.Application = Marionette.Application.extend({});
    TP.Controller = Marionette.Controller.extend({});
    TP.Layout = Marionette.Layout.extend({});
    TP.Region = Marionette.Region;
    TP.ItemView = Marionette.ItemView.extend({});
    TP.CollectionView = Marionette.CollectionView.extend({});
    TP.CompositeView = Marionette.CompositeView.extend({});

    // Backbone stuff
    TP.history = Backbone.history;
    TP.Collection = Backbone.Collection.extend({});
    TP.Model = Backbone.Model.extend({});
    TP.Router = Backbone.Router.extend({});

    return TP;

});