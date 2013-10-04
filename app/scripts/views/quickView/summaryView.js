define(
[
    "underscore",
    "moment",
    "TP",
    "views/workoutCommentsEditor/workoutCommentsEditor",
    "views/quickView/summaryView/summaryViewUserCustomization",
    "views/quickView/summaryView/summaryViewStickitBindings",
    "views/quickView/summaryView/summaryViewTextAreas",
    "hbs!templates/views/quickView/summaryView"
],
function (
    _,
    moment,
    TP,
    WorkoutCommentsEditorView,
    summaryViewUserCustomization,
    summaryViewStickitBindings,
    summaryViewTextAreas,
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
        
        ui:
        {
            "commentsContainer": "div#commentsContainer"  
        },

        events:
        {
            "keydown .numberInput": "isNumberKey"
        },

        initialize: function()
        {
            this.on("render", this.renderWorkoutComments, this);
            this.on("render", this.setTabOrder, this);
            this.initializeUserCustomization();

            // setup stickit last because the user customization onRender needs to happen before stickit
            this.initializeStickit();

            this.initializeTextAreas();
        },

        renderWorkoutComments: function()
        {
            var commentsEditorView = new WorkoutCommentsEditorView({ model: this.model });
            this.ui.commentsContainer.html(commentsEditorView.render().$el);
        },

        setTabOrder: function()
        {
            // title input in workoutBarView.html is tabindex 1
            // all other inputs come after title, planned, completed
            this.$("input, textarea").attr("tabindex", 4);

            // all planned inputs
            this.$(".workoutStatsPlanned input").attr("tabindex", 2);

            // then all completed inputs
            this.$(".workoutStatsCompleted input").attr("tabindex", 3);
        }
    };

    _.extend(summaryViewBase, summaryViewUserCustomization);
    _.extend(summaryViewBase, summaryViewStickitBindings);
    _.extend(summaryViewBase, summaryViewTextAreas);

    return TP.ItemView.extend(summaryViewBase);

});
