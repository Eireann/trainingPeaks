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
        className: "chartTile",

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

            // if (!options.packery)
            //     throw "ChartTileView requires packery object/function";
            // else
            //     this.packery = options.packery;

            this.model.on("select", this.onItemSelect, this);
            this.model.on("unselect", this.onItemUnSelect, this);
        },

        onRender: function()
        {
            this.makeDraggable();
        },

        makeDraggable: function()
        {
            this.$el.data(
            {
                ItemType: 'Chart',
                ChartType: 32
            });
            this.$el.draggable(
            {
                helper: "clone",
                appendTo: theMarsApp.getBodyElement(),
                "z-index": 100,
                containment: "#dashboardWrapper"
            });
            // _.result(this, "packery").bindUIDraggableEvents(this.$el);
            // this.$el.draggable({ appendTo: theMarsApp.getBodyElement(), 'z-index': 100, helper: this.draggableHelper, start: this.onDragStart, stop: this.onDragStop, containment: "#calendarWrapper" });
        },

        _makeChart: function()
        {
            var view = DashboardChartBuilder.buildChartView(this.model.get("chartId"), this.model.get("chartOptions"));
            view.render();
            view.triggerMethod("show");
            return view.$el;
        },

        onMouseDown: function()
        {
            this.model.trigger("select", this.model);
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

