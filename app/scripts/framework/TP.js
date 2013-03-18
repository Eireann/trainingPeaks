/*

Wraps and extends core backbone and marionette functionality
*/

define(
[
    "backbone",
    "backbone.deepmodel",
    "backbone.stickit",
    "backbone.marionette",
    "setImmediate",
    "framework/APIModel",
    "framework/Logger"
],
function(Backbone, BackboneDeepModel, BackboneStickit, Marionette, setImmediate, APIModel, Logger)
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

    // Common functionality for all TP View types
    var commonViewFunctions = {};

    // add throbbers
    _.extend(commonViewFunctions, {

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

    });

    // modal rendering for item views that have a modal = true attribute
    var modalRendering = {

        modal: false,


        // set modal = true attribute
        // then view.render() == modal and centered
        // view.render().left(x).top(y) == modal and positioned at x,y
        renderModal: function()
        {
            if (!this.modal)
                return this;

            // make an overlay
            _.bindAll(this, "close");
            var self = this;
            this.$overlay = $("<div></div>");
            this.$overlay.addClass("modalOverlay");
            this.$overlay.addClass(this.className + "ModalOverlay");
            this.$overlay.on("click", function() { self.close(); });
            $('body').append(this.$overlay);

            // make $el absolute and put it on the body
            this.$el.addClass("modal");
            $('body').append(this.$el);

            this.left(($(window).width() - this.$el.width()) / 2).top(($(window).height() - this.$el.height()) / 2);

            return this;
        },

        closeModal: function()
        {
            if (this.modal && this.$overlay)
                this.$overlay.hide().remove();
        },

        left: function(left)
        {
            if (this.modal && this.$el)
            {
                this.$el.css("left", left);
            }

            return this;
        },

        center: function(center)
        {
            if (this.modal && this.$el)
            {
                this.$el.css("left", center - (this.$el.width() / 2));
            }

            return this;
        },

        top: function(top)
        {
            if (this.modal && this.$el)
            {
                this.$el.css("top", top);
            }

            return this;
        },

        bottom: function(bottom)
        {
            if (this.modal && this.$el)
            {
                this.$el.css("top", bottom - this.$el.height());
            }

            return this;
        },

        // ONLY FOR ITEM VIEWS - or see marionette CollectionView and CompositeView initialEvents
        initialEvents: function()
        {
            this.on("render", this.renderModal, this);
            this.on("close", this.closeModal, this);
        }
    };

    TP.Events = Backbone.Events;

    TP.View = Marionette.View.extend();
    TP.ItemView = Marionette.ItemView.extend(commonViewFunctions).extend(modalRendering);
    TP.CollectionView = Marionette.CollectionView.extend(commonViewFunctions);
    TP.CompositeView = Marionette.CompositeView.extend(commonViewFunctions);

    // Backbone stuff
    TP.history = Backbone.history;
    TP.Collection = Backbone.Collection.extend({});
    TP.Model = Backbone.DeepModel.extend({});
    TP.APIModel = APIModel;
    TP.Router = Backbone.Router.extend({});

    TP.Logger = Logger;

    return TP;
});