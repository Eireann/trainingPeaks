define(
[
    "underscore",
    "TP",
    "jqueryui/draggable"
],
function(
    _,
    TP,
    draggable
    )
{
    return TP.ItemView.extend(
    {
        el: "#expandoMapAndGraphResizerRegion",

        template:
        {
            type: "handlebars",
            template: function() { return ""; }
        },

        events: {
        },

        initialize: function(options)
        {
            this.on("controller:resize", this.setPosition, this);
        },
        onRender: function()
        {
            this.$el.draggable({drag: _.bind(this.onDrag, this), stop: _.bind(this.onDragStop, this), scope: "expandoMapAndGraphResizerRegion", axis: "y"});
        },
        onDrag: function(event, ui)
        {
            this.trigger("resizerDrag", ui.position.top);
        },
        onDragStop: function(event, ui)
        {
            this.trigger("resizerDragStop");
        },
        setPosition: function(containerHeight)
        {
            var bottomMargin = 15;
            var mapHeight = Math.floor((containerHeight * 0.5) - bottomMargin);
            mapHeight = this.top ? this.top : mapHeight;
            this.$el.css('top', mapHeight + 'px');

            if (!this.initialTop)
            {
                this.initialTop = mapHeight;
            } 
        },
        setTop: function(top)
        {
            this.top = top;
        }

    });
});