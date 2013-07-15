define(
[
    "underscore",
    "TP",
    "models/workoutFileData",
    "views/userConfirmationView",
    "views/quickView/qvMain/qvFileUploadMenuView",
    "views/quickView/qvMain/qvAttachmentUploadMenuView",
    "views/userMessageView",
    "hbs!templates/views/quickView/fileUploadErrorView",
    "hbs!templates/views/userMessage/saveWorkoutBeforeAttachment"
],
function (
    _,
    TP,
    WorkoutFileData,
    UserConfirmationView,
    QVFileUploadMenuView,
    QVAttachmentUploadMenuView,
    UserMessageView,
    fileUploadErrorTemplate,
    saveWorkoutBeforeAttachmentTemplate
)
{
    var workoutQuickViewFileUploads =
    {
        fileUploadEvents:
        {
            "click #quickViewFileUploadDiv": "onUploadFileClicked",
            "click .addAttachment": "onAddAttachmentClicked",

            // TODO Refactor: needs to be moved into qvFileUploadMenuView and dealt with internally
            "change input[type='file']#fileUploadInput": "onFileSelected"
        },

        fileUploadUi:
        {
            "fileinput": "input[type='file']#fileUploadInput"
        },

        initializeFileUploads: function()
        {
            _.bindAll(this, "onUploadDone", "onUploadFail");
            _.extend(this.ui, this.fileUploadUi);
            _.extend(this.events, this.fileUploadEvents);
            this.watchForFileAttachments();
            this.on("render", this.updateAttachmentIconState, this);
            this.watchForWorkoutFiles();
            this.on("render", this.updateUploadButtonState, this);
        },

        watchForFileAttachments: function()
        {
            this.model.get("details").on("change:attachmentFileInfos", this.updateAttachmentIconState, this);
            this.on("close", this.stopWatchingForFileAttachments, this);
        },

        stopWatchingForFileAttachments: function()
        {
            this.model.get("details").off("change:attachmentFileInfos", this.updateAttachmentIconState, this);
        },

        updateAttachmentIconState: function()
        {
            var attachments = this.model.get("details").get("attachmentFileInfos");
            if (attachments && attachments.length)
            {
                this.$(".addAttachment").addClass("withAttachments");
            } else
            {
                this.$(".addAttachment").removeClass("withAttachments");
            }
        },

        watchForWorkoutFiles: function()
        {
            this.model.get("details").on("change:workoutDeviceFileInfos", this.updateUploadButtonState, this);
            this.on("close", this.stopWatchingForWorkoutFiles, this);
        },

        stopWatchingForWorkoutFiles: function()
        {
            this.model.get("details").off("change:workoutDeviceFileInfos", this.updateUploadButtonState, this);
        },

        updateUploadButtonState: function()
        {
            var attachments = this.model.get("details").get("workoutDeviceFileInfos");
            if (attachments && attachments.length)
            {
                this.$("#quickViewFileUploadDiv").addClass("withFiles");
            } else
            {
                this.$("#quickViewFileUploadDiv").removeClass("withFiles");
            }
        },

        onUploadFileClicked: function()
        {
            var uploadButton = this.$("#quickViewFileUploadDiv");
            var offset = uploadButton.offset();
            var direction = this.expanded ? "right" : "left";
            this.fileUploadMenu = new QVFileUploadMenuView({ model: this.model, direction: direction });

            if (direction === "right")
            {
                this.fileUploadMenu.setPosition({ fromElement: uploadButton, left: uploadButton.outerWidth() + 13, top: -8 });
            } else
            {
                this.fileUploadMenu.setPosition({ fromElement: uploadButton, right: -13, top: -8 });
            }

            uploadButton.addClass("menuOpen");

            this.fileUploadMenu.render();

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
                var fileName = readArgs[0];
                var dataAsString = readArgs[1];
                self.uploadedFileDataModel = new WorkoutFileData({ workoutId: self.model.get("workoutId"), workoutDay: self.model.get("workoutDay"), startTime: self.model.get("startTime"), fileName: fileName, data: dataAsString });
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
            this.model.trigger("deviceFileUploaded");

            if (this.isNew)
                this.trigger("saved");
        },

        onUploadFail: function()
        {
            this.waitingOff();
        },

        onAddAttachmentClicked: function()
        {
            if (this.isNewWorkout && !this.model.get("workoutId"))
            {
                var view = new UserMessageView({ template: saveWorkoutBeforeAttachmentTemplate });
                view.render();
                return;
            }
            
            // Wire up & Display the File Attachment Tomahawk
            var uploadButton = this.$("div.addAttachment");
            var offset = uploadButton.offset();
            var direction = this.expanded ? "right" : "left";

            this.attachmentUploadMenu = new QVAttachmentUploadMenuView({ model: this.model, direction: direction });

            if (direction === "right")
            {
                this.attachmentUploadMenu.setPosition({ fromElement: uploadButton, left: uploadButton.outerWidth() + 13, top: -8 });
            } else
            {
                this.attachmentUploadMenu.setPosition({ fromElement: uploadButton, right: -13, top: -8 });
            }


            uploadButton.addClass("menuOpen");

            this.attachmentUploadMenu.render();
            this.attachmentUploadMenu.on("close", function () { uploadButton.removeClass("menuOpen"); });
        },

        displayUploadError: function()
        {
            this.errorMessageView = new UserConfirmationView({ template: fileUploadErrorTemplate });
            this.errorMessageView.render();
        }

    };

    return workoutQuickViewFileUploads;

});