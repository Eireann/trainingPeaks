define(
[
    "underscore",
    "TP",
    "models/workoutFileData",
    "views/userConfirmationView",
    "hbs!templates/views/quickView/fileUploadErrorView"
],
function(
    _,
    TP,
    WorkoutFileData,
    UserConfirmationView,
    fileUploadErrorTemplate
    )
{
    return TP.ItemView.extend({
        initialize: function(options)
        {
            this.workoutModel = options.workoutModel;
        },
        events:
        {
            "change": "onFileSelected"
        },
        onFileSelected: function()
        {
            var self = this;
            var fileList = this.$el[0].files;
            var workoutReader = new TP.utils.workout.FileReader(fileList[0]);
            var fileReaderDeferred = workoutReader.readFile();
            var saveDeferred;

            saveDeferred = this.workoutModel.isNew() ? this.workoutModel.save() : new $.Deferred().resolve();

            saveDeferred.done(function()
            {
                fileReaderDeferred.done(function(fileName, dataAsString)
                {
                    var workoutDate = self.workoutModel.get("date") || self.workoutModel.get("workoutDay");
                    self.uploadedFileDataModel = new WorkoutFileData({ workoutDay: moment(workoutDate).format(TP.utils.datetime.longDateFormat), startTime: moment(workoutDate).add("hours", 6).format(TP.utils.datetime.longDateFormat), data: dataAsString, fileName: fileName });
                    self.uploadedFileDataModel.save().done(function()
                    {
                        self.trigger("uploadDone", self.uploadedFileDataModel.get("workoutModel"));
                    }).fail(function()
                    {
                        new UserConfirmationView({ template: fileUploadErrorTemplate }).render();
                        self.trigger("uploadFailed");
                    });
                });
            });
        }
    });
});