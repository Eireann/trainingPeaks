define(
[
    "underscore",
    "moment",
    "TP",
    "views/workoutCommentsEditor/workoutCommentsEditor",
    "views/quickView/summaryView/summaryViewUserCustomization",
    "views/quickView/summaryView/summaryViewStickitBindings",
    "views/quickView/summaryView/summaryViewTextAreas",
    "views/workout/workoutEquipmentView",
    "views/workout/workoutStructureView",
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
    WorkoutEquipmentView,
    WorkoutStructureView,
    workoutQuickViewSummaryTemplate)
{
    var summaryViewBase = 
    {
        className: "summary",

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
            "keydown .numberInput": "isNumberKey",
            "click .workoutStructureToggle": "_scrollToWorkoutStructure"
        },

        initialize: function()
        {
            this.on("render", this.renderWorkoutComments, this);
            this.on("render", this.setTabOrder, this);
            this.on("render", this.renderEquipmentSelectors, this);
            this.on("render", this.renderWorkoutStructure, this);
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
        },

        renderEquipmentSelectors: function ()
        {
            var view = new WorkoutEquipmentView({
                collection: theMarsApp.user.getAthleteSettings().getEquipment(),
                model: this.model
            });
            
            view.render();

            this.$(".equipment").append(view.el);

            var saveModel = _.bind(function(){ this.model.autosave({}); }, this);
            this.listenTo(view, "change:equipment", saveModel);
            this.on("close", _.bind(view.close, view));
        },

        renderWorkoutStructure: function()
        {
            /*
            if (!this.model.get("details").get("workoutStructure"))
                return;
            */

            var view = new WorkoutStructureView(this.model.get("details").get("workoutStructure"));

            view.render();

            this.$("#commentsContainer").after(view.el);

            this.on("close", _.bind(view.close, view));
        },

        _scrollToWorkoutStructure: function()
        {
            var $container = this.$el.closest("#quickViewContent");
            var $target = this.$(".workoutStructureContainer");

            var self = this;
            self.scrolling = true;

            $container.animate(
                {
                    scrollTop: $target.position().top + $container.scrollTop()
                },
                {
                    done: function() { self.scrolling = false; }
                }
            );
        },

        reRender: function()
        {
            this.updateUICustomization();
        }
    };

    _.extend(summaryViewBase, summaryViewUserCustomization);
    _.extend(summaryViewBase, summaryViewStickitBindings);
    _.extend(summaryViewBase, summaryViewTextAreas);

    return TP.ItemView.extend(summaryViewBase);

});
