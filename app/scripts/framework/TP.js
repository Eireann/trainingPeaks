define(
[
    "underscore",
    "backbone",
    "backbone.deepmodel",
    "backbone.stickit",
    "backbone.marionette",
    "setImmediate",
    "framework/APIModel",
    "framework/Logger",
    "framework/utilities",
    "framework/analytics",
    "shared/data/tpSharedData"
],
function(
         _,
         Backbone,
         BackboneDeepModel,
         BackboneStickit,
         Marionette,
         setImmediate,
         APIModel,
         Logger,
         utilities,
         analytics,
         sharedData
)
{
    var TP = {};

    // Override default "input" handling
    Backbone.Stickit.addHandler(
    {
        selector: "input",
        events: [ "blur", "keyup", "change", "cut", "paste" ]
    });

    Backbone.Stickit.addHandler(
    {
        selector: "textarea",
        events: [ "blur" ]
    });

    // Marionette stuff
    TP.Application = Backbone.Marionette.Application.extend({

        shutdownHandlers: [],

        addShutdown: function(fn)
        {
            this.shutdownHandlers.push(fn);
        },

        stop: function()
        {
            _.each(this.shutdownHandlers, function(onStop)
            {
                onStop.call(this);
            }, this);
        }

    });

    TP.Controller = Backbone.Marionette.Controller.extend(
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
    TP.Layout = Backbone.Marionette.Layout.extend(
    {
        fadeIn: function(callback)
        {
            this.$el.fadeIn(300, callback);
        },

        fadeOut: function (callback)
        {
            this.$el.fadeOut(300, callback);
        }
    });
    TP.Region = Backbone.Marionette.Region;

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

        onWaitStart: function(model, xhr, options)
        {
            if (this.showThrobbers)
            {
                this.waitingOn();

                if (xhr)
                {
                    xhr.always(_.bind(this.waitingOff, this));
                }
            }
        },

        waitingOn: function()
        {
            var $waitEl = this.modal && this.$(".hoverBoxContents").length ? this.$(".hoverBoxContents") : this.$el;
            $waitEl.addClass('waiting');
        },

        onWaitStop: function()
        {
            if (this.showThrobbers)
            {
                this.waitingOff();
            }
        },

        waitingOff: function()
        {
            var $waitEl = this.modal && this.$(".hoverBoxContents").length ? this.$(".hoverBoxContents") : this.$el;
            $waitEl.removeClass('waiting');
        },

        notImplemented: function()
        {
            alert('Feature Not Implemented');
        }

    });

    // modal rendering for item views that have a modal = true attribute
    var modalRendering = {

        modal: false,
        closeOnResize: true,


        // set modal = true attribute
        // then view.render() == modal and centered
        // view.render().left(x).top(y) == modal and positioned at x,y
        renderModal: function()
        {
            // not a modal view ...
            if (!this.modal)
                return this;

            // already rendered ...
            if (this.modalWasRendered())
                return;
 
             // get existing modal so we can render on top
            var existingModal = $(".modalOverlay:last");           

            // make an overlay
            var onOverlayClick = function () { this.trigger("clickoutside"); this.close(); };
            this.createOverlay({ mask: this.modal.mask, noOverlay: this.modal.noOverlay, onOverlayClick: onOverlayClick});
            _.bindAll(this, "close");

            // make $el absolute and put it on the body
            this.$el.addClass("modal");

            if (this.modal.shadow)
                this.$el.addClass("modalShadow");

            theMarsApp.getBodyElement().append(this.$el);

            // dynamic centering
            this.rePositionView();
            this.watchForWindowResize();

            this.enableEscapeKey();
            this.closeOnRouteChange(this.close);

            // set on top of other modals

            if(existingModal.length)
            {
                var topIndex = Number(existingModal.css("z-index"));
                this.$overlay.css("z-index", topIndex + 2);
                this.$el.css("z-index", topIndex + 3);
            }

            this.trigger("modalrender");

            return this;
        },

        createOverlay: function(modalSettings)
        {
            modalSettings = _.extend({ mask: true, noOverlay: false, onOverlayClick: null}, modalSettings);

            this.$overlay = $("<div></div>");
            this.$overlay.addClass("modalOverlay");
            this.$overlay.addClass(this.className.split(" ").shift() + "ModalOverlay");

            if (modalSettings.mask)
                this.$overlay.addClass("modalOverlayMask");

            if (!modalSettings.noOverlay)
            {
                theMarsApp.getBodyElement().append(this.$overlay);
            }

            if(modalSettings.onOverlayClick)
            {
                var self = this;
                var onOverlayClick = function()
                {
                    modalSettings.onOverlayClick.apply(self);
                };
                this.$overlay.on("click", onOverlayClick);
            }
        },

        modalWasRendered: function()
        {
            return this.$overlay ? true : false;
        },

        centerViewInWindow: function()
        {
            var windowWidth = $(window).width();
            var windowHeight = $(window).height();
            var overallHeight = this.$el.height();

            this.$el.css("left", Math.round((windowWidth - this.$el.width()) / 2) + "px");
            this.$el.css("top", Math.round((windowHeight - overallHeight) / 2) + "px");
        },

        watchForWindowResize: function()
        {
            _.bindAll(this, "onWindowResize");
            $(window).on("resize.modal", this.onWindowResize);
        },

        stopWatchingWindowResize: function()
        {
            $(window).off("resize.modal", this.onWindowResize);
        },

        onWindowResize: function()
        {
            if (this.closeOnResize)
            {
                this.close();
            } else
            {
                this.rePositionView();
            }
        },

        setPosition: function(positionAttributes)
        {
            this.positionAttributes = positionAttributes;
            if (this.modalWasRendered())
                this.rePositionView();
            return this;
        },

        rePositionView: function()
        {
            this.$el.css({
                height: "",
                width: ""
            }); 

            this.trigger("before:reposition");

            if (!this.positionAttributes)
            {
                this.centerViewInWindow();
                return;
            }

            var startOffset = this.positionAttributes.hasOwnProperty("fromElement") ? $(this.positionAttributes.fromElement).offset() : { top: 0, left: 0 };
            
            if (this.positionAttributes.hasOwnProperty("left"))
                this.left(startOffset.left + this.positionAttributes.left);

            if (this.positionAttributes.hasOwnProperty("right"))
                this.right(startOffset.left + this.positionAttributes.right);
 
            if (this.positionAttributes.hasOwnProperty("center"))
                this.center(startOffset.left + this.positionAttributes.center);
 
            if (this.positionAttributes.hasOwnProperty("top"))
                this.top(startOffset.top + this.positionAttributes.top);

            if (this.positionAttributes.hasOwnProperty("bottom"))
                this.bottom(startOffset.top + this.positionAttributes.bottom);

        },

        closeOnRouteChange: function(onClose)
        {
            theMarsApp.router.once("route", onClose, this);
        },

        enableEscapeKey: function()
        {
            _.bindAll(this, "onEscapeKey");
            $(document).on("keyup.esc", this.onEscapeKey);
        },

        disableEscapeKey: function()
        {
            $(document).off("keyup.esc", this.onEscapeKey);
        },

        onEscapeKey: function(e)
        {
            if (e.which === 27)
                this.close();
        },

        closeModal: function()
        {
            this.disableEscapeKey();
            this.stopWatchingWindowResize();
            if (this.$overlay)
            {
                this.$overlay.hide().remove();
                this.$overlay = null;
            }
        },

        left: function(left)
        {
            if (this.modal && this.$el)
            {
                if (left < 0)
                    left = 0;

                if (!theMarsApp.isTouchEnabled() && left + this.$el.width() > $(window).width())
                    left = $(window).width() - this.$el.width() - 10;

                this.$el.css("left", left);
            }

            return this;
        },

        center: function(center)
        {
            if (this.modal && this.$el)
            {
                this.left(center - (this.$el.width() / 2));
            }

            return this;
        },

        right: function(right)
        {
            if (this.modal && this.$el)
            {
                this.left(right - this.$el.width());
            }

            return this;
        },

        top: function(top)
        {
            if (this.modal && this.$el)
            {
                if (top < 0)
                    top = 0;
                this.$el.css("top", top);
            }

            return this;
        },

        bottom: function(bottom)
        {
            if (this.modal && this.$el)
            {
                this.top(bottom - this.$el.height());
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

    // Because Marionette 1.0 took away initialEvents, which we need to hook up our modal functionality
    var viewConstructor = {
        constructor: function()
        {
            var args = Array.prototype.slice.apply(arguments);
            Backbone.Marionette.View.prototype.constructor.apply(this, args);
            if (this.initialEvents)
            {
                this.initialEvents();
            }
        }
    };

    var itemViewConstructor = {
        constructor: function()
        {
            var args = Array.prototype.slice.apply(arguments);
            Backbone.Marionette.ItemView.prototype.constructor.apply(this, args);
            if (this.initialEvents)
            {
                this.initialEvents();
            }
        }
    };

    TP.Events = Backbone.Events;

    TP.View = Backbone.Marionette.View.extend(viewConstructor);
    TP.ItemView = Backbone.Marionette.ItemView.extend(commonViewFunctions).extend(modalRendering).extend(itemViewConstructor);
    TP.CollectionView = Backbone.Marionette.CollectionView.extend(commonViewFunctions);
    TP.CompositeView = Backbone.Marionette.CompositeView.extend(commonViewFunctions);

    // Backbone stuff
    TP.Collection = Backbone.Collection.extend({});

    TP.Model = APIModel.DeepModel;
    TP.DeepModel = APIModel.DeepModel;
    TP.BaseModel = APIModel.BaseModel;
    TP.APIBaseModel = APIModel.APIBaseModel;
    TP.APIDeepModel = APIModel.APIDeepModel;
    TP.Router = Backbone.Router.extend({});

    TP.Logger = Logger;

    TP.utils = utilities;

    TP.analytics = analytics;

    TP.extend = Backbone.Marionette.extend;

    TP.sharedData = sharedData;

    return TP;
});
