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
            this.makeDraggable();
        },
        onDrag: function(event, ui)
        {
            var top = ui.position.top,
                self = this;

            // If we're outside our bounds, abort drag and correct resizer position
            if (top >= this.containerHeight || top <= 0)
            {
                this.disableDrag();
                setImmediate(function()
                {
                    self.setPosition(self.containerHeight);
                });
                
                this.makeDraggable();
                return;
            }

            this.trigger("resizerDrag", ui.position.top);
        },
        makeDraggable: function()
        {
            var self = this;
            this.$el.draggable(
            {
                drag: _.bind(this.onDrag, this), 
                scope: "expandoMapAndGraphResizerRegion",
                axis: "y"
            });
        },
        disableDrag: function()
        {
            this.$el.draggable("destroy");
        },
        setPosition: function(containerHeight)
        {
            var bottomMargin = 0;
            var mapHeight = Math.floor((containerHeight * (this.top || 0.5)) - bottomMargin);
            //mapHeight = this.top ? this.top : mapHeight;
            this.$el.css('top', mapHeight + 'px');
            this.containerHeight = containerHeight;
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
