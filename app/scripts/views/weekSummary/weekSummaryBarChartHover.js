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

        modal: {noOverlay: true},
        showThrobbers: false,
        tagName: "div",
        className: "weekSummaryBarChartHover",

        events:
        {
            
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
                "id": "weekSummaryBarChartHover",
                "data-workoutId": this.model.id
            };
        },

        template:
        {
            type: "handlebars",
            template: weekSummaryBarChartHover
        }
    });
});