define(
[
    "TP",
    "models/workoutModel",
    "models/workoutFileData",
    "views/workoutQuickView",
    "utilities/workoutFileReader",
    "hbs!templates/views/newItemView"
],
function (TP, WorkoutModel, WorkoutFileData, WorkoutQuickView, WorkoutFileReader, newItemViewTemplate)
{
    return TP.ItemView.extend(
    {

        modal: {
            mask: true,
            shadow: true
        },

        className: "newItemView",

        events:
        {
            "change input[type='file']": "onFileSelected",
            "click button": "onNewWorkoutClicked"
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
            if (e.currentTarget.name === "uploadDeviceFile")
            {
                this.ui.fileinput.click();
            }
            else
            {
                var workoutTypeId = $(e.currentTarget).data("workoutid");
                this.newWorkout = new WorkoutModel(
                {
                    personId: theMarsApp.user.get("userId"),
                    workoutDay: moment(this.model.get("date")).format("YYYY-MM-DDThh:mm:ss"),
                    startTime: moment(this.model.get("date")).add("hours", 6).format("YYYY-MM-DDThh:mm:ss"),
                    title: "",
                    workoutTypeValueId: workoutTypeId
                });
                var quickView = new WorkoutQuickView({ model: this.newWorkout });
                quickView.on("discard", this.onNewWorkoutDiscarded, this);
                quickView.on("saveandclose", this.onNewWorkoutSaved, this);
                quickView.on("saved", this.onNewWorkoutSaved, this);
                this.close();
                quickView.render();
            }
        },

        onFileSelected: function ()
        {
            this.$el.addClass("waiting");
            this.$("#uploadingNotification").css("display", "block");
            
            var self = this;
            var fileList = this.ui.fileinput[0].files;

            var workoutReader = new WorkoutFileReader(fileList[0]);
            var deferred = workoutReader.readFile();

            deferred.done(function(dataAsString)
            {
                self.uploadedFileDataModel = new WorkoutFileData({ workoutDay: moment(self.model.get("date")).format("YYYY-MM-DDThh:mm:ss"), startTime: moment(self.model.get("date")).add("hours", 6).format("YYYY-MM-DDThh:mm:ss"), data: dataAsString });
                self.uploadedFileDataModel.save().done(self.onUploadDone).fail(self.onUploadFail);
            });
        },

        onUploadDone: function ()
        {
            this.$el.removeClass("waiting");
            
            var workoutModelJson = this.uploadedFileDataModel.get("workoutModel");
            var newModel = new WorkoutModel(workoutModelJson);
            this.model.trigger("workout:added", newModel);
            var quickView = new WorkoutQuickView({ model: newModel });
            this.close();
            quickView.render();
        },

        onUploadFail: function ()
        {
            this.$el.removeClass("waiting");
        },

        onNewWorkoutDiscarded: function ()
        {
            delete this.newWorkout;
        },

        onNewWorkoutSaved: function ()
        {
            // The QuickView already saved the model to the server, let's update our local collections to reflect the change.
            this.model.trigger("workout:added", this.newWorkout);
        }
    });
});