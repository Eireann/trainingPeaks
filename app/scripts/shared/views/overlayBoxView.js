define(
[
    "underscore",
    "TP",
    "backbone",
    "hbs!shared/templates/overlayBox"
],
function(
    _,
    TP,
    Backbone,
    overlayBoxTemplate
)
{
    var OverlayBoxView = TP.ItemView.extend({

        className: "overlayBox",

        modal:
        {
            mask: true,
            shadow: true
        },

        closeOnResize: false,

        events:
        {
            "click .closeIcon": "close"
        },

        modelEvents: {},
        collectionEvents: {},

        template:
        {
            type: "handlebars",
            template: overlayBoxTemplate
        },

        initialize: function(options)
        {
            if(!this.itemView)
            {
                throw new Error("A DialogView requires an itemView");
            }

            this.children = new Backbone.ChildViewContainer();

            this.contentView = new this.itemView(options);

            this._addChildView(this.contentView);

            this.on("show", function()
            {
                this.children.call("show");
            });

            this.on("close", function()
            {
                this.children.call("close");
            });

            this.contentView.on("close", this.close, this);
            
            this.on("before:reposition", this._beforeReposition, this);
        },

        _addChildView: function(view)
        {
            this.children.add(view);
            this.listenTo(view, "all", _.bind(this._passthroughChildEvent, this));
        },

        _passthroughChildEvent: function()
        {
            this.trigger.apply(this, arguments);
        },

        render: function()
        {
            OverlayBoxView.__super__.render.apply(this, arguments);
            this.contentView.setElement(this.$("> .overlayBoxBody"));
            this.contentView.render();
            this.rePositionView();
        },

        _beforeReposition: function()
        {
            this.$el.css({
                height: this.$el.height(),
                width: this.$el.width()
            });
        }

    });

    OverlayBoxView.wrap = function(viewClass, options)
    {
        var viewClassDefinition = {
            itemView: viewClass
        };
 
        if(options && options.className)
        {
            viewClassDefinition.className = options.className;
        }

        viewClass.OverlayBox = OverlayBoxView.extend(viewClassDefinition);
    };

    return OverlayBoxView;
});
