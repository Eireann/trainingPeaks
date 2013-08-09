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
        	this.$el.draggable({drag: _.bind(this.onDrag, this), scope: "expandoMapAndGraphResizerRegion", axis: "y"});
        },
        onDrag: function(event, ui)
        {
        	this.trigger("resizerDrag", ui.position.top - this.initialTop);
        },
        setPosition: function(containerHeight)
        {
            var bottomMargin = 10;
            var mapHeight = Math.floor((containerHeight - bottomMargin) * 0.50);
            mapHeight = mapHeight + (this.offset || 0);

        	this.$el.css('top', mapHeight + 'px');

        	if (!this.initialTop)
        	{
        		this.initialTop = mapHeight;
        	} 
        },
        setOffset: function(offset)
        {
            this.offset = offset;
        }

    });
});