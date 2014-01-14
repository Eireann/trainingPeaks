define(
[
    "TP",
    "setImmediate",
    "jqueryOutside",
    "views/userConfirmationView",
    "hbs!templates/views/weekSummary/weekSummaryBarChartHover"
],
function (TP, setImmediate, jqueryOutside, UserConfirmationView, weekSummaryBarChartHover)
{
    return TP.ItemView.extend(
    {

        modal: { overlayClass: "hidden" },
        showThrobbers: false,
        tagName: "div",
        className: "weekSummaryBarChartHover",

        events:
        {
            "mouseleave": "hoverBoxLeave"
        },

        initialize: function (options)
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "weekSummaryHover", "eventLabel": "" });
            
            this.posX = options.left;
            this.posY = options.top;
            this.parentEl = options.parentEl;
            this.inheritedClassNames = options.className;
        },

        attributes: function()
        {
            return {
                "id": "weekSummaryBarChartHover",
                "data-workoutId": this.model.id
            };
        },

        template:
        {
            type: "handlebars",
            template: weekSummaryBarChartHover
        },

        hoverBoxLeave: function (e)
        {
            this.trigger("mouseleave", e);
        }
    });
});