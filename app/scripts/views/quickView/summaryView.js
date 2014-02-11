﻿define(
[
    "underscore",
    "moment",
    "TP",
    "views/workoutCommentsEditor/workoutCommentsEditor",
    "views/quickView/summaryView/summaryViewUserCustomization",
    "views/quickView/summaryView/summaryViewStickitBindings",
    "views/quickView/summaryView/summaryViewTextAreas",
    "views/quickView/summaryView/summaryViewWorkoutStructure",
    "views/workout/workoutEquipmentView",
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
    summaryViewWorkoutStructure,
    WorkoutEquipmentView,
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
            "keydown .numberInput": "isNumberKey"
        },

        initialize: function()
        {
            this.on("render", this.renderWorkoutComments, this);
            this.on("render", this.setTabOrder, this);
            this.on("render", this.renderEquipmentSelectors, this);
            this.initializeUserCustomization();

            // setup stickit last because the user customization onRender needs to happen before stickit
            this.initializeStickit();

            this.initializeTextAreas();

            this.initializeWorkoutStructure();
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

            this.$("#equipment").append(view.el);

            var saveModel = _.bind(function(){ this.model.autosave({}); }, this);
            this.listenTo(view, "change:equipment", saveModel);
            this.on("close", _.bind(view.close, view));
        },

        reRender: function()
        {
            this.updateUICustomization();
        }
    };

    _.extend(summaryViewBase, summaryViewUserCustomization);
    _.extend(summaryViewBase, summaryViewStickitBindings);
    _.extend(summaryViewBase, summaryViewTextAreas);
    _.extend(summaryViewBase, summaryViewWorkoutStructure);

    return TP.ItemView.extend(summaryViewBase);

});
