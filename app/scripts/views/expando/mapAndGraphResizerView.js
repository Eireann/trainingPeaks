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
        	this.trigger("resizerDrag", ui.position.top - this.initialTop);
        },
        onDragStop: function()
        {
        	this.trigger("resizerDragStop");
        },
        setPosition: function(containerHeight)
        {
            var bottomMargin = 10;
            var mapHeight = Math.floor((containerHeight - bottomMargin) * 0.50);

        	this.$el.attr('top', mapHeight + 'px');
        	if (!this.initialTop)
        	{
        		this.initialTop = mapHeight;
        	} 
        }
    });
});