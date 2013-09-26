﻿define(
[
    "TP",
    "framework/notYetImplemented",
    "models/workoutModel",
    "models/workoutFileData",
    "views/quickView/workoutQuickView",
    "views/userConfirmationView",
    "views/workout/workoutFileUploadView",
    "hbs!templates/views/calendar/newItemView"
],
function(
    TP,
    notYetImplemented,
    WorkoutModel,
    WorkoutFileData,
    WorkoutQuickView,
    UserConfirmationView,
    WorkoutFileUploadView,
    newItemViewTemplate)
{
    return TP.ItemView.extend(
    {
        modal:
        {
            mask: true,
            shadow: true
        },

        closeOnResize: false,

        className: "newItemView",

        events:
        {
            "change input[type='file']": "onFileSelected",
            "click button[data-workoutid]": "onNewWorkoutClicked",
            "click button[data-meal]": notYetImplemented,
            "click button[data-metric]": notYetImplemented,
            "click button[name=uploadDeviceFile]": "onUploadFileClicked",
            "click #closeIcon": "onCloseClicked"
        },

        template:
        {
            type: "handlebars",
            template: newItemViewTemplate
        },

        ui:
        {
            "fileinput": "input[type='file']"
        },

        initialize: function ()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "newItemView", "eventAction": "opened", "eventLabel": "" });
            _.bindAll(this, "onUploadDone", "onUploadFail", "close");
        },
        onRender: function()
        {
            this.workoutFileUploadView = new WorkoutFileUploadView({el: this.$('#fileUploadInput'), workoutModel: this.model}); 
            this.listenTo(this.workoutFileUploadView, "uploadDone", this.onUploadDone, this);
            this.listenTo(this.workoutFileUploadView, "uploadFailed", this.onUploadFail, this);
        },

        onUploadFileClicked: function(e)
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "newItemView", "eventAction": "deviceFileUploadClicked", "eventLabel": "" });
            this.ui.fileinput.click();
            return;
        },

        onNewWorkoutClicked: function (e)
        {
            // Handle a specific workout/metric/meal type creation
            var workoutTypeId = $(e.currentTarget).data("workoutid");
            this.newWorkout = new WorkoutModel(
            {
                athleteId: theMarsApp.user.getCurrentAthleteId(),
                workoutDay: moment(this.model.get("date")).format(TP.utils.datetime.longDateFormat),
                startTime: moment(this.model.get("date")).add("hours", 6).format(TP.utils.datetime.longDateFormat),
                title: "",
                workoutTypeValueId: workoutTypeId
            });

            var quickView = new WorkoutQuickView({ model: this.newWorkout, isNewWorkout: true, dayModel: this.model });
            quickView.render();

            this.close();
            this.trigger("openQuickView", quickView);
        },

        onFileSelected: function ()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "newItemView", "eventAction": "deviceFileSelected", "eventLabel": "" });

            this.$el.addClass("waiting");
            this.$("#uploadingNotification").css("display", "block");
        },

        onUploadDone: function (workoutModelJson)
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "newItemView", "eventAction": "deviceFileUploaded", "eventLabel": "" });

            this.$el.removeClass("waiting");
         
            var newModel = new WorkoutModel();

            var existingModel = theMarsApp.controllers.calendarController.getWorkout(workoutModelJson.workoutId);
            if (existingModel)
            {
                newModel = existingModel;
                newModel.set(workoutModelJson);
                newModel.parse(workoutModelJson);
            }
            else
            {
                newModel.set(workoutModelJson);
                newModel.parse(workoutModelJson);
                this.model.trigger("workout:added", newModel);
            }

            newModel.trigger("select", newModel);

            var quickView = new WorkoutQuickView({ model: newModel });
            quickView.render();

            this.close();

        },

        onUploadFail: function ()
        {
            this.$el.removeClass("waiting");
        },

        onCloseClicked: function ()
        {
            this.trigger("close");
            this.close();
        }
    });
});
