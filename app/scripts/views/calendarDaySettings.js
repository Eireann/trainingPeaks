define(
[
    "TP",
    "setImmediate",
    "jqueryOutside",
    "hbs!templates/views/calendarDaySettings"
],
function (TP, setImmediate, jqueryOutside, calendarDaySettingsTemplate)
{
    return TP.ItemView.extend(
    {

        showThrobbers: false,
        tagName: "div",
        className: "calendarDaySettings",
        
        events:
        {
            "click #calendarDaySettingsAddLabel": "onAddClicked"  
        },

        hideSettings: function (e)
        {
            this.close();
            this.trigger("mouseleave", e);
        },

        initialize: function(options)
        {
            this.posX = options.left;
            this.posY = options.top;
            this.parentEl = options.parentEl;
            this.inheritedClassNames = options.className;
        },

        attributes: function()
        {
            return {
                "id": "daySettingsDiv"
            };
        },

        template:
        {
            type: "handlebars",
            template: calendarDaySettingsTemplate
        },

        onRender: function()
        {
            _.bindAll(this, "hideSettings");


            $('body').append(this.$el);
            var self = this;
            setImmediate(function () { self.$el.bind("clickoutside", self.hideSettings); });

            this.$el.css("width", "75px");
            this.$el.css("z-index", 99).css("position", "absolute");
            this.$el.css("left", this.posX - Math.round(this.$el.width() / 2 - 10)).css("top", this.posY - this.$el.height());

            var today = moment();
            var weekDate = moment(this.model.id);

            if (weekDate.week() === today.week() && weekDate.year() === today.year())
                this.$el.find(".hoverBox").addClass("thisWeek");
        }

    });
});