define(
[
    "jquerySelectBox",
    "underscore",
    "moment",
    "TP",
    "views/quickView/summaryView/summaryViewTextAreas",
    "views/quickView/summaryView/summaryViewUserCustomization",
    "views/quickView/summaryView/summaryViewStickitBindings",
    "views/quickView/summaryView/summaryViewComments",
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
    summaryViewComments,
    workoutQuickViewSummaryTemplate)
{
    
    var summaryViewBase = 
    {
        className: "summary",

        today: moment().format(TP.utils.datetime.shortDateFormat),

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
            this.initializeComments();

            // setup stickit last because the user customization onRender needs to happen before stickit
            this.initializeStickit();
        }

    };

    _.extend(summaryViewBase, summaryViewTextAreas);
    _.extend(summaryViewBase, summaryViewUserCustomization);
    _.extend(summaryViewBase, summaryViewComments);
    _.extend(summaryViewBase, summaryViewStickitBindings);

    return TP.ItemView.extend(summaryViewBase);

});
