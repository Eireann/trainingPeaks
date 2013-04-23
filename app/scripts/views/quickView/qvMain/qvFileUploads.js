define(
[
    "underscore",
    "TP",
    "models/workoutFileData",
    "models/workoutFileAttachment"
],
function (
    _,
    TP,
    WorkoutFileData,
    WorkoutFileAttachment
)
{
    var workoutQuickViewFileUploads = {

        fileUploadEvents:
        {
            "click #quickViewFileUploadDiv": "onUploadFileClicked",
            "change input[type='file']#fileUploadInput": "onFileSelected",
            "change input[type='file']#attachment": "onAttachmentFileSelected",
            "click .addAttachment": "onAddAttachmentClicked"
        },

        fileUploadUi:
        {
            "fileinput": "input[type='file']#fileUploadInput",
            "attachmentinput": "input[type='file']#attachment"
        },

        initializeFileUploads: function()
        {
            _.bindAll(this, "onUploadDone", "onUploadFail");
            _.extend(this.ui, this.fileUploadUi);
            _.extend(this.events, this.fileUploadEvents);
        },

        onUploadFileClicked: function()
        {
            this.ui.fileinput.click();
        },

        onFileSelected: function()
        {

            this.waitingOn();
            this.isNew = this.model.get("workoutId") ? false : true;

            var self = this;
            var saveDeferral = this.model.save();

            var fileList = this.ui.fileinput[0].files;

            var workoutReader = new TP.utils.workout.FileReader(fileList[0]);
            var readDeferral = workoutReader.readFile();
            $.when(saveDeferral, readDeferral).done(function(saveArgs, readArgs)
            {
                var dataAsString = readArgs;
                self.uploadedFileDataModel = new WorkoutFileData({ workoutId: self.model.get("workoutId"), workoutDay: self.model.get("workoutDay"), startTime: self.model.get("startTime"), data: dataAsString });
                self.uploadedFileDataModel.save().done(self.onUploadDone).fail(self.onUploadFail);
            });
        },

        onUploadDone: function()
        {
            this.waitingOff();

            this.model.set(this.uploadedFileDataModel.get("workoutModel"));

            if (this.isNew)
                this.trigger("saved");
        },

        onUploadFail: function()
        {
            this.waitingOff();
        },

        onAddAttachmentClicked: function()
        {
            this.ui.attachmentinput.click();
        },

        onAttachmentFileSelected: function()
        {
            _.bindAll(this, "uploadAttachment");
            this.waitingOn();
            var file = this.ui.attachmentinput[0].files[0];
            var workoutReader = new TP.utils.workout.FileReader(file);
            var readDeferral = workoutReader.readFile();

            var self = this;
            readDeferral.done(function(fileContentsEncoded)
            {
                self.uploadAttachment(file.name, fileContentsEncoded);
            });
        },

        uploadAttachment: function(fileName, data)
        {
            var attachment = new WorkoutFileAttachment({
                fileName: fileName,
                description: fileName,
                data: data,
                workoutId: this.model.id
            });

            var self = this;
            attachment.save().done(function()
            {
                self.waitingOff();
            });
        }

    };

    return workoutQuickViewFileUploads;

});