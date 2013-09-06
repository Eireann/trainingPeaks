define(
[
    "TP",
    "backbone",
    "hbs!shared/templates/overlayBox"
],
function(
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
            this.children.add(this.contentView);

            this.on("show", function()
            {
                this.children.call("show");
            });

            this.on("close", function()
            {
                this.children.call("close");
            });
        },

        render: function()
        {
            OverlayBoxView.__super__.render.apply(this, arguments);
            this.contentView.setElement(this.$("> .overlayBoxBody"));
            this.contentView.render();
            this.rePositionView();
        }

    });

    return OverlayBoxView;
});
