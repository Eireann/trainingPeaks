define(
[
    "underscore",
    "TP",
    "models/workoutFileData",
    "models/workoutFileAttachment",
    "views/userConfirmationView",
    "views/quickView/qvMain/qvFileUploadMenuView",
    "hbs!templates/views/quickView/fileUploadErrorView"
],
function (
    _,
    TP,
    WorkoutFileData,
    WorkoutFileAttachment,
    UserConfirmationView,
    QVFileUploadMenuView,
    fileUploadErrorTemplate
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
            var uploadButton = this.$("#quickViewFileUploadDiv");
            var offset = uploadButton.offset();
            var direction = this.expanded ? "right" : "left";
            this.fileUploadMenu = new QVFileUploadMenuView({ model: this.model, direction: direction });
            this.fileUploadMenu.render().top(offset.top - 5);

            if (direction === "right")
            {
                this.fileUploadMenu.left(offset.left + uploadButton.outerWidth() + 13);
            } else
            {
                this.fileUploadMenu.right(offset.left - 13);
            }

            uploadButton.addClass("menuOpen");
            this.fileUploadMenu.on("browseFile", this.onUploadFileMenuUploadButtonClicked, this);
            this.fileUploadMenu.on("close", function() { uploadButton.removeClass("menuOpen"); });
        },

        onUploadFileMenuUploadButtonClicked: function()
        {
            this.ui.fileinput.click();
        },

        onFileSelected: function()
        {

            if (this.fileUploadMenu)
                this.fileUploadMenu.close();

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

            var updatedWorkoutModel = this.uploadedFileDataModel.get("workoutModel");

            if (!updatedWorkoutModel)
            {
                this.displayUploadError();
                return;
            }

            this.model.set(updatedWorkoutModel);
            this.model.get("details").fetch();

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
        },

        displayUploadError: function()
        {
            this.errorMessageView = new UserConfirmationView({ template: fileUploadErrorTemplate });
            this.errorMessageView.render();
        }

    };

    return workoutQuickViewFileUploads;

});