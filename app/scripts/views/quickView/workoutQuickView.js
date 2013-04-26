define(
[
    "jquerySelectBox",
    "underscore",
    "moment",
    "TP",
    "views/quickView/qvMain/qvStickitBindings",
    "views/quickView/qvMain/qvSaveDeleteDiscard",
    "views/quickView/qvMain/qvHeaderActions",
    "views/quickView/qvMain/qvFileUploads",
    "views/quickView/qvMain/qvExpand",
    "views/quickView/summaryView",
    "views/quickView/expandedView/quickViewExpandedView",
    "hbs!templates/views/quickView/workoutQuickView"
],
function (
    selectBox,
    _,
    moment,
    TP,
    qvStickitBindings,
    qvSaveDeleteDiscard,
    qvHeaderActions,
    qvFileUploads,
    qvExpand,
    WorkoutQuickViewSummary,
    expandedView,
    workoutQuickViewTemplate
)
{
    var WorkoutQuickView =
    {
        modal:
        {
            mask: true,
            shadow: true
        },

        today: moment().format(TP.utils.datetime.shortDateFormat),

        className: "workoutQuickView",

        showThrobbers: false,

        // must have an events, even if empty, or else all of our extending won't work right ...
        events: {},

        ui:
        {
            "quickViewContent": "#quickViewContent",
            "quickViewContentExpanded": "#quickViewExpandedContent"
        },

        initialize: function(options)
        {
            if (options.isNewWorkout)
            {
                this.isNewWorkout = true;
                this.dayModel = options.dayModel;
            }
            else
            {
                // Not a new workout, let's pre-fetch WorkoutDetails from the server
                this.model.get("details").fetch();
            }
            
            this.initializeFileUploads();
            this.initializeStickit();
            this.initializeSaveDeleteDiscard();
            this.initializeHeaderActions();
            this.initializeTabs();
            this.initializeExpand();
        },

        template:
        {
            type: "handlebars",
            template: workoutQuickViewTemplate
        },

        onRender: function()
        {
            if (!this.renderInitialized)
            {
                this.renderInitialized = true;
                this.renderTabs();
            }
        },

        initializeTabs: function()
        {
            this.views =
            {
                workoutQuickViewSummary: new WorkoutQuickViewSummary({ model: this.model })
            };

            this.activeTabName = null;
        },

        renderTabs: function()
        {
            for (var tabName in this.views)
            {
                var tab = this.views[tabName];
                tab.render();
                this.ui.quickViewContent.append(tab.$el);
            }
        }

    };

    _.extend(WorkoutQuickView, qvSaveDeleteDiscard);
    _.extend(WorkoutQuickView, qvHeaderActions);
    _.extend(WorkoutQuickView, qvStickitBindings);
    _.extend(WorkoutQuickView, qvFileUploads);
    _.extend(WorkoutQuickView, qvExpand);

    return TP.ItemView.extend(WorkoutQuickView);
});