define(
[
    "jquerySelectBox",
    "underscore",
    "moment",
    "TP",
    "views/quickView/summaryView/summaryViewTextAreas",
    "views/quickView/summaryView/summaryViewUserCustomization",
    "views/quickView/summaryView/summaryViewStickitBindings",
    "hbs!templates/views/quickView/summaryView"
],
function (
    selectBox,
    _,
    moment,
    TP,
    summaryViewTextAreas,
    summaryViewUserCustomization,
    summaryViewStickitBindings,
    workoutQuickViewSummaryTemplate)
{
    
    var summaryViewBase = 
    {
        className: "summary",

        today: moment().format("YYYY-MM-DD"),

        showThrobbers: false,

        template:
        {
            type: "handlebars",
            template: workoutQuickViewSummaryTemplate
        },

        initialize: function()
        {

            this.initializeTextAreas();
            this.initializeUserCustomization();

            // setup stickit last because the user customization onRender needs to happen before stickit
            this.initializeStickit();
        }

    };

    _.extend(summaryViewBase, summaryViewTextAreas);
    _.extend(summaryViewBase, summaryViewUserCustomization);
    _.extend(summaryViewBase, summaryViewStickitBindings);

    return TP.ItemView.extend(summaryViewBase);

});
