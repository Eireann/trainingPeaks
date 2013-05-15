define(
[
    "underscore",
    "TP",
    "models/workoutFileData",
    "models/commands/recalculateWorkoutFromDeviceFile",
    "views/userConfirmationView",
    "hbs!templates/views/confirmationViews/deleteConfirmationView",
    "hbs!templates/views/quickView/recalculateConfirmationView",
    "hbs!templates/views/quickView/workoutFileUploadMenu"
],
function(
    _,
    TP,
    WorkoutFileDataModel,
    RecalculateWorkoutCommand,
    UserConfirmationView,
    deleteConfirmationTemplate,
    recalculateConfirmationTemplate,
    WorkoutFileUploadMenuTemplate
    )
{
    // TODO: check if file was already downloaded
    return TP.ItemView.extend(
    {

        modal: true,
        tagName: "div",
        deviceAgentUrl: "http://support.trainingpeaks.com/device-agent.aspx",

        className: "workoutFileUploadMenu",

        events:
        {
            "click #workoutFileUploadMenuBrowse": "onBrowseClicked",
            "click .deviceAgentButton": "onDeviceAgentClicked",
            "click #closeIcon": "close",
            "change .fileSelect": "selectFileCheckbox",
            "click button.recalculate": "onRecalculateClicked",
            "click button.delete": "onDeleteClicked"
        },

        attributes:
        {
            "id": "workoutFileUploadMenuDiv"
        },

        template:
        {
            type: "handlebars",
            template: WorkoutFileUploadMenuTemplate
        },

        onBrowseClicked: function()
        {
            this.trigger("browseFile");
        },

        initialize: function(options)
        {
            this.$el.addClass(options.direction);
            this.watchForFileChanges();
            this.on("render", this.preDownloadFiles, this);
        },

        watchForFileChanges: function()
        {
            this.model.get("details").on("change:workoutDeviceFileInfos", this.render, this);
            this.on("close", function()
            {
                this.model.get("details").off("change:workoutDeviceFileInfos", this.render, this);
            }, this);
        },

        onDeviceAgentClicked: function()
        {
            window.open(this.deviceAgentUrl);
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

        onRecalculateClicked: function()
        {
            this.recalculateConfirmationView = new UserConfirmationView({ template: recalculateConfirmationTemplate });
            this.recalculateConfirmationView.render();
            this.recalculateConfirmationView.on("userConfirmed", this.onRecalculateConfirmed, this);
        },

        onRecalculateConfirmed: function()
        {

            this.waitingOn();

            this.recalcCommand = new RecalculateWorkoutCommand({
                workoutId: this.model.get("workoutId"),
                workoutFileDataId: this.selectedFileId
            });

            _.bindAll(this, "afterRecalculate");
            this.recalcCommand.execute().done(this.afterRecalculate);
            // returns workout data
            // re-fetch details and detailData
        },

        afterRecalculate: function()
        {
            if (this.recalcCommand && this.recalcCommand.has("workoutModelData"))
            {
                // update the model
                this.model.set(this.recalcCommand.get("workoutModelData"));
                this.model.fetch();

                // update the details
                this.model.get("details").fetch();

                // update the detail data
                this.model.get("detailData").fetch();
            }
            else
            {
                this.waitingOff();
            }
            this.close();
        },

        preDownloadFiles: function()
        {
            _.bindAll(this, "enableFileDownloadLink");
            var deviceFiles = this.model.get("details").get("workoutDeviceFileInfos");
            _.each(deviceFiles, function(fileInfo)
            {
                this.downloadFile(fileInfo);
            }, this);
        },

        downloadFile: function(fileInfo)
        {
            var self = this;

            var ifLocalFileExists = function(existingLocalFileUrl)
            {
                self.enableFileDownloadLink(fileInfo.fileId, fileInfo.fileName, existingLocalFileUrl);
            };

            var ifLocalFileDoesNotExist = function()
            {
                var fileDataModel = new WorkoutFileDataModel({ id: fileInfo.fileSystemId, workoutId: self.model.get("workoutId") });
                fileDataModel.fetch().done(function(downloadedFileData)
                {
                    var onDownload = function(filesystemUrl)
                    {
                        self.enableFileDownloadLink(fileInfo.fileId, fileInfo.fileName, filesystemUrl);
                    };
                    TP.utils.filesystem.saveFileToTemporaryFilesystem(fileInfo.fileId, fileInfo.fileName, downloadedFileData.data, downloadedFileData.contentType, onDownload);
                });
            };

            TP.utils.filesystem.getLocalFilesystemUrl(fileInfo.fileId, fileInfo.fileName, ifLocalFileExists, ifLocalFileDoesNotExist);
        },

        enableFileDownloadLink: function(fileId, fileName, filesystemURL)
        {
            var link = this.$(".file#" + fileId + " a.download");
            link.attr("href", filesystemURL);
            link.attr("download", fileName);
            link.removeClass("disabled");
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
            var fileDataModel = new WorkoutFileDataModel({ id: this.selectedFileId, workoutId: this.model.get("workoutId") });
            var self = this;
            fileDataModel.destroy().done(function()
            {
                    self.model.get("details").fetch().done(function()
                    {
                        self.waitingOff();
                    });
                }
            );
        },

        waitingOn: function()
        {
            this.$(".details").addClass("waiting");
        },

        waitingOff: function()
        {
            this.$(".details").removeClass("waiting");
        }

    });
});