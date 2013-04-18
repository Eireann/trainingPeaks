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
    "views/quickView/summaryView",
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
    WorkoutQuickViewSummary,
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
            "quickViewContent": "#quickViewContent"
        },

        initialize: function()
        {
            this.initializeFileUploads();
            this.initializeStickit();
            this.initializeSaveDeleteDiscard();
            this.initializeHeaderActions();
            this.initializeTabs();
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

    return TP.ItemView.extend(WorkoutQuickView);
});