define(
[
    "jquerySelectBox",
    "underscore",
    "moment",
    "TP",
    "views/quickView/summaryView/summaryViewTextAreas",
    "views/quickView/summaryView/summaryViewUserCustomization",
    "views/quickView/summaryView/summaryViewStickitBindings",
    "views/quickView/summaryView/workoutCommentsCollectionView",
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
    WorkoutCommentsCollectionView,
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
            this.on("render", this.renderComments, this);

            // setup stickit last because the user customization onRender needs to happen before stickit
            this.initializeStickit();
        },

        renderComments: function()
        {
            //preActivityCommentsList
            //postActivityCommentsList
            this.preActivityCommentsView = new WorkoutCommentsCollectionView(
                { collection: this.model.preActivityComments }
                );
            this.postActivityCommentsView = new WorkoutCommentsCollectionView(
                { collection: this.model.postActivityComments }
                );

            this.preActivityCommentsView.render();
            this.$("#preActivityCommentsList").append(this.preActivityCommentsView.el);
            this.postActivityCommentsView.render();
            this.$("#postActivityCommentsList").append(this.postActivityCommentsView.el);

        }
    };

    _.extend(summaryViewBase, summaryViewTextAreas);
    _.extend(summaryViewBase, summaryViewUserCustomization);
    _.extend(summaryViewBase, summaryViewStickitBindings);

    return TP.ItemView.extend(summaryViewBase);

});
