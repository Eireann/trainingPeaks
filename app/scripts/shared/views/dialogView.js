define(
[
    "TP",
    "backbone",
    "hbs!shared/templates/dialog"
],
function(
    TP,
    Backbone,
    dialogTemplate
)
{
    var DialogView = TP.ItemView.extend({

        className: "dialogView",

        modal: true,
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
            template: dialogTemplate
        },

        initialize: function(options)
        {
            if(!this.itemView)
            {
                throw new Error("A DialogView requires an itemView");
            }

            this.children = new Backbone.ChildViewContainer;

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
            DialogView.__super__.render.apply(this, arguments);
            this.contentView.setElement(this.$("> .dialogBody"));
            this.contentView.render();
            this.rePositionView();
        }

    });

    return DialogView;
});
