define(
[
    "TP",
    "jqueryui/touch-punch",
    "jqueryui/draggable",
    "hbs!templates/views/dashboard/library/chartTileView"
],
function(
    TP,
    touchPunch,
    draggable,
    ChartTileViewTemplate)
{
    return TP.ItemView.extend(
    {

        tagName: "div",
        className: function()
        {
            var className = "chartTile cf";
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
            template: ChartTileViewTemplate
        },

        initialize: function(options)
        {
            if (!this.model)
                throw "Cannot have a ChartTileView without a model";

            this.model.on("select", this.onItemSelect, this);
            this.model.on("unselect", this.onItemUnSelect, this);
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
            this.$el.data(
            {
                ItemType: 'Chart',
                ChartType: this.model.get("chartType"),
                model: this.model
            });
            this.$el.draggable(
            {
                helper: "clone",
                appendTo: theMarsApp.getBodyElement(),
                zIndex: 100,
                containment: "#dashboardWrapper"
            });
        },

        onMouseDown: function()
        {
            this.model.trigger("select", this.model);

            if(this.model.get("premium"))
            {
                theMarsApp.featureAuthorizer.showUpgradeMessage();
            }
        },

        onItemSelect: function()
        {
            this.$el.addClass("selected");
        },

        onItemUnSelect: function()
        {
            this.$el.removeClass("selected");
        }

    });
});

