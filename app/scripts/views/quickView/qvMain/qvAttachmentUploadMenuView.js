define(
[
    "jquery",
    "underscore",
    "TP",
    "views/userConfirmationView",
    "models/workoutFileAttachment",
    "hbs!templates/views/confirmationViews/deleteConfirmationView",
    "hbs!templates/views/quickView/attachmentFileUploadMenu"
],
function($,
         _,
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
            "click button.delete": "onDeleteClicked",
            "change input[type='file']#attachmentInput": "onAttachmentFileSelected"
        },

        template:
        {
            type: "handlebars",
            template: attachmentFileUploadMenuTemplate
        },

        initialize: function (options)
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "attachmentTomahawk", "eventAction": "opened", "eventLabel": "" });

            this.$el.addClass(options.direction);
            this.watchForFileChanges();
        },

        watchForFileChanges: function()
        {
            this.on("render", this.enableAllAvailableDownloads, this);

            this.listenTo(this.model.get("details"), "change:attachmentFileInfos", _.bind(this.render, this));
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

            var fileInfo = _.where(this.model.get("details").get("attachmentFileInfos"), { fileId: parseInt(this.selectedFileId, 10) })[0];
            this.downloadFile(fileInfo);
        },

        onDeleteClicked: function()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "attachmentTomahawk", "eventAction": "deleteClicked", "eventLabel": "" });

            this.deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationTemplate });
            this.deleteConfirmationView.render();
            this.listenTo(this.deleteConfirmationView, "userConfirmed", _.bind(this.onDeleteFileConfirmed, this));
        },

        onDeleteFileConfirmed: function()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "attachmentTomahawk", "eventAction": "deleteConfirmed", "eventLabel": "" });

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
            TP.analytics("send", { "hitType": "event", "eventCategory": "attachmentTomahawk", "eventAction": "newAttachmentFileSelected", "eventLabel": "" });

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

        downloadFile: function (fileInfo)
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "attachmentTomahawk", "eventAction": "downloadFileClicked", "eventLabel": "" });

            var self = this;

            var downloadAttachmentFromServer = function()
            {
                self.waitingOn();
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
            };

            this.enableLinkIfFileIsAlreadyAvailable(fileInfo, downloadAttachmentFromServer);
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
        },

        enableAllAvailableDownloads: function()
        {
            var attachmentFiles = this.model.get("details").get("attachmentFileInfos");

            var ifLocalFileDoesNotExist = function()
            {
                return;
            };

            _.each(attachmentFiles, function(fileInfo)
            {
                this.enableLinkIfFileIsAlreadyAvailable(fileInfo, ifLocalFileDoesNotExist);
            }, this);
        },

        enableLinkIfFileIsAlreadyAvailable: function(fileInfo, ifLocalFileDoesNotExist)
        {
            var self = this;

            var ifLocalFileExists = function(existingLocalFileUrl)
            {
                self.enableFileDownloadLink(fileInfo.fileId, fileInfo.fileName, existingLocalFileUrl);
            };

            TP.utils.filesystem.getLocalFilesystemUrl(fileInfo.fileId, fileInfo.fileName, ifLocalFileExists, ifLocalFileDoesNotExist);
        }

    });
});
