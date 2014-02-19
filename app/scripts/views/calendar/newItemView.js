define(
[
    "jquery",
    "underscore",
    "moment",
    "TP",
    "framework/notYetImplemented",
    "models/workoutModel",
    "shared/models/metricModel",
    "models/workoutFileData",
    "views/quickView/workoutQuickView",
    "quickview/metric/views/metricQuickView",
    "views/userConfirmationView",
    "views/workout/workoutFileUploadView",
    "shared/utilities/calendarUtility",
    "hbs!templates/views/calendar/newItemView"
],
function(
    $,
    _,
    moment,
    TP,
    notYetImplemented,
    WorkoutModel,
    MetricModel,
    WorkoutFileData,
    WorkoutQuickView,
    MetricQuickView,
    UserConfirmationView,
    WorkoutFileUploadView,
    CalendarUtility,
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
            "click [data-workoutid]": "onNewWorkoutClicked",
            "click [data-meal]": notYetImplemented,
            "click [data-metric]": "onNewMetricClicked",
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
                title: "",
                workoutTypeValueId: workoutTypeId
            });

            var quickView = new WorkoutQuickView({ model: this.newWorkout, isNewWorkout: true, dayModel: this.model });
            quickView.render();

            this.close();
            this.trigger("openQuickView", quickView);
        },

        onNewMetricClicked: function(e)
        {
            var now = moment.local(), timeStamp;
            if(now.format(CalendarUtility.idFormat) === this.model.get("date"))
            {
                // The user is logging a metric for today, therefore it makes sense to include a "time"
                // component in the timestamp.
                timeStamp = now;
            }
            else
            {
                // The user is logging a metric for a day other than today, the current time is
                // certainly irrelevant in this case, so base the timestamp on the localized calendar day,
                // without a "time" component.
                // The user can still pick a time from the QV header time picker, if they feel strongly
                // about it.
                timeStamp = moment.local(this.model.get("date"));
            }

            var newMetric = new MetricModel(
            {
                athleteId: theMarsApp.user.getCurrentAthleteId(),
                timeStamp: timeStamp.format(TP.utils.datetime.longDateFormat)
            });

            var view = new MetricQuickView({ model: newMetric });
            view.render();

            this.close();
            this.trigger("openQuickView", view);
        },

        onFileSelected: function ()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "newItemView", "eventAction": "deviceFileSelected", "eventLabel": "" });

            this.$el.addClass("waiting");
        },

        onUploadDone: function (workoutModelJson)
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "newItemView", "eventAction": "deviceFileUploaded", "eventLabel": "" });

            this.$el.removeClass("waiting");
         
            var newModel = new WorkoutModel();

            var existingModel = theMarsApp.calendarManager.get(WorkoutModel, workoutModelJson.workoutId);
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
                theMarsApp.calendarManager.addItem(newModel);
            }

            theMarsApp.selectionManager.setSelection(newModel);

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
