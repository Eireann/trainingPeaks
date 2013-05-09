define(
[
    "TP",
    "models/workoutModel",
    "models/workoutFileData",
    "views/quickView/workoutQuickView",
    "views/userConfirmationView",
    "hbs!templates/views/quickView/fileUploadErrorView",
    "hbs!templates/views/calendar/newItemView"
],
function(
    TP,
    WorkoutModel,
    WorkoutFileData,
    WorkoutQuickView,
    UserConfirmationView,
    fileUploadErrorTemplate,
    newItemViewTemplate)
{
    return TP.ItemView.extend(
    {
        modal:
        {
            mask: true,
            shadow: true
        },

        className: "newItemView",

        events:
        {
            "change input[type='file']": "onFileSelected",
            "click button": "onNewWorkoutClicked",
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
            _.bindAll(this, "onUploadDone", "onUploadFail", "close");
        },

        onNewWorkoutClicked: function (e)
        {
            // Handle file uploads as a specific case & return
            if (e.currentTarget.name === "uploadDeviceFile")
            {
                this.ui.fileinput.click();
                return;
            }

            // Handle a specific workout/metric/meal type creation
            var workoutTypeId = $(e.currentTarget).data("workoutid");
            this.newWorkout = new WorkoutModel(
            {
                athleteId: theMarsApp.user.get("athletes.0.athleteId"),
                workoutDay: moment(this.model.get("date")).format(TP.utils.datetime.longDateFormat),
                startTime: moment(this.model.get("date")).add("hours", 6).format(TP.utils.datetime.longDateFormat),
                title: "",
                workoutTypeValueId: workoutTypeId
            });

            var quickView = new WorkoutQuickView({ model: this.newWorkout, isNewWorkout: true, dayModel: this.model });
            quickView.render();

            this.close();
        },

        onFileSelected: function ()
        {
            this.$el.addClass("waiting");
            this.$("#uploadingNotification").css("display", "block");
            
            var self = this;
            var fileList = this.ui.fileinput[0].files;

            var workoutReader = new TP.utils.workout.FileReader(fileList[0]);
            var deferred = workoutReader.readFile();

            deferred.done(function(dataAsString)
            {
                self.uploadedFileDataModel = new WorkoutFileData({ workoutDay: moment(self.model.get("date")).format(TP.utils.datetime.longDateFormat), startTime: moment(self.model.get("date")).add("hours", 6).format(TP.utils.datetime.longDateFormat), data: dataAsString });
                self.uploadedFileDataModel.save().done(self.onUploadDone).fail(self.onUploadFail);
            });
        },

        onUploadDone: function ()
        {
            this.$el.removeClass("waiting");
         
            var workoutModelJson = this.uploadedFileDataModel.get("workoutModel");

            if (!workoutModelJson)
            {
                this.displayUploadError();
                return;
            }

            var newModel = new WorkoutModel(workoutModelJson);
            this.model.workoutAdded(newModel);
            
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
        },

        displayUploadError: function()
        {
            this.errorMessageView = new UserConfirmationView({ template: fileUploadErrorTemplate });
            this.errorMessageView.render();
        }


    });
});