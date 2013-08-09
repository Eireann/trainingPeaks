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
        setPosition: function(mapHeight)
        {
        	this.$el.attr('top', mapHeight + 'px');
        	if (!this.initialTop)
        	{
        		this.initialTop = mapHeight;
        	} 
        }
    });
});