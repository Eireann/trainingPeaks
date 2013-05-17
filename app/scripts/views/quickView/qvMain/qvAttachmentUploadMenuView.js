define(
[
    "underscore",
    "TP",
    "views/userConfirmationView",
    "models/workoutFileAttachment",
    "hbs!templates/views/confirmationViews/deleteConfirmationView",
    "hbs!templates/views/quickView/attachmentFileUploadMenu"
],
function(_,
         TP,
         UserConfirmationView,
         WorkoutFileAttachment,
         deleteConfirmationTemplate,
         attachmentFileUploadMenuTemplate)
{
    return TP.ItemView.extend(
    {
        modal: true,
        tagName: "div",

        className: "workoutFileUploadMenu",

        ui:
        {
            "attachmentinput": "input[type='file']#attachmentInput"
        },
        
        events:
        {
            "click #attachmentFileUploadMenuBrowse": "onBrowseClicked",
            "click #closeIcon": "close",
            "change .fileSelect": "selectFileCheckbox",
            "click button.download": "onDownloadClicked",
            "click button.delete": "onDeleteClicked",
            "change input[type='file']#attachmentInput": "onAttachmentFileSelected"
        },

        template:
        {
            type: "handlebars",
            template: attachmentFileUploadMenuTemplate
        },


        initialize: function(options)
        {
            this.$el.addClass(options.direction);
            this.watchForFileChanges();
        },

        watchForFileChanges: function()
        {
            this.model.get("details").on("change:attachmentFileInfos", this.render, this);
            this.on("close", function()
            {
                this.model.get("details").off("change:attachmentFileInfos", this.render, this);
            }, this);
        },

        onBrowseClicked: function ()
        {
            this.ui.attachmentinput.click();
        },
        
        serializeData: function()
        {
            var data = this.model.toJSON();

            if (this.model.has("details"))
            {
                data.details = this.model.get("details").toJSON();
            }

            return data;
        },

        selectFileCheckbox: function(e)
        {
            var checkbox = $(e.target);
            this.selectedFileId = checkbox.val();

            // select the file
            var fileDiv = checkbox.closest(".file");
            this.$(".file.selected").removeClass("selected");
            fileDiv.addClass("selected");

            // enable all buttons
            this.$(".fileButtons button").attr("disabled", null);
        },

        onDeleteClicked: function()
        {
            this.deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationTemplate });
            this.deleteConfirmationView.render();
            this.deleteConfirmationView.on("userConfirmed", this.onDeleteFileConfirmed, this);
        },

        onDeleteFileConfirmed: function()
        {
            this.waitingOn();
            var fileDataModel = new WorkoutFileAttachment({ id: this.selectedFileId, workoutId: this.model.get("workoutId") });
            var self = this;
            fileDataModel.destroy().done(function()
            {
                self.model.get("details").fetch().done(function()
                {
                    self.waitingOff();
                });
            });
        },

        onAttachmentFileSelected: function ()
        {
            _.bindAll(this, "uploadAttachment");
            this.waitingOn();
            var file = this.ui.attachmentinput[0].files[0];
            var workoutReader = new TP.utils.workout.FileReader(file);
            var readDeferral = workoutReader.readFile();

            var self = this;
            readDeferral.done(function (fileName, fileContentsEncoded)
            {
                self.uploadAttachment(file.name, fileContentsEncoded);
            });
        },

        uploadAttachment: function (fileName, data)
        {
            var attachment = new WorkoutFileAttachment(
            {
                fileName: fileName,
                description: fileName,
                data: data,
                workoutId: this.model.id
            });

            var self = this;
            attachment.save().done(function ()
            {
                self.model.get("details").fetch();
                self.waitingOff();
            });
        },

        onDownloadClicked: function()
        {
            var fileInfo = _.where(this.model.get("details").get("attachmentFileInfos"), { fileId: parseInt(this.selectedFileId, 10) })[0];
            this.downloadFile(fileInfo);
        },

        downloadFile: function (fileInfo)
        {
            var self = this;
            this.waitingOn();
            var attachmentDataModel = new WorkoutFileAttachment({ id: fileInfo.fileSystemId, workoutId: self.model.get("workoutId") });
            attachmentDataModel.fetch().done(function(downloadedFileData)
            {
                self.waitingOff();
                var onDownload = function(filesystemUrl)
                {
                   self.enableFileDownloadLink(fileInfo.fileId, fileInfo.fileName, filesystemUrl);
                };
                TP.utils.filesystem.saveFileToTemporaryFilesystem(fileInfo.fileId, fileInfo.fileName, downloadedFileData.data, downloadedFileData.contentType, onDownload);
            });
        },

        enableFileDownloadLink: function (fileId, fileName, filesystemURL)
        {
            var link = this.$(".file#" + fileId + " a.download");
            link.attr("href", filesystemURL);
            link.attr("download", fileName);
            link.removeClass("disabled");
        },

        waitingOn: function ()
        {
            this.$(".details").addClass("waiting");
        },

        waitingOff: function ()
        {
            this.$(".details").removeClass("waiting");
        }

    });
});