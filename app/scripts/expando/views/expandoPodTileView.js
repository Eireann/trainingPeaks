define(
[
    "TP",
    "jqueryui/touch-punch",
    "jqueryui/draggable",
    "hbs!expando/templates/expandoPodTileTemplate"
],
function(
    TP,
    touchPunch,
    draggable,
    expandoPodTileTemplate
)
{
    var ExpandoPodTileView = TP.ItemView.extend(
    {

        tagName: "div",
        className: function()
        {
            var className = "podTile expandoPodTile cf expandoPodType-" + this.model.get("podType");
            if(this.model.get("premium"))
            {
                className += " premium";
            }
            return className;
        },

        events:
        {
            mousedown: "onMouseDown"
        },

        template:
        {
            type: "handlebars",
            template: expandoPodTileTemplate
        },

        initialize: function(options)
        {
            if (!this.model)
                throw "Cannot have an ExpandoPodTileView without a model";
        },

        remove: function()
        {
            var helper = this.$el.data("ui-draggable") ? this.$el.data("ui-draggable").helper : null;
            if(helper && helper.is(".ui-draggable-dragging"))
            {
                // We need to keep the element in the DOM until the drag finishes
                var $el = this.$el;
                $el.hide().appendTo("body");
                $el.one("dragstop", function() { $el.remove(); });

                // Don't allow the supper remove to remove the stashed element
                this.$el = $();
            }
            ExpandoPodTileView.__super__.remove.call(this);
        },

        onRender: function()
        {
            if(!this.model.get("premium"))
            {
                this._makeDraggable();
            }
        },

        _makeDraggable: function()
        {
            var self = this;
            this.$el.data(
            {
                model: this.model
            });
            this.$el.draggable(
            {
                helper: "clone",
                scope: "packery",
                appendTo: theMarsApp.getBodyElement(),
                zIndex: 999
            });
        },

        onMouseDown: function()
        {
            this.model.trigger("select", this.model);

            if(this.model.get("premium"))
            {
                theMarsApp.featureAuthorizer.showUpgradeMessage();
            }
        }

    });

    return ExpandoPodTileView;

});

