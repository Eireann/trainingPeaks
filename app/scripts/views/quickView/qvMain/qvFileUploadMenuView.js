define(
[
    "underscore",
    "TP",
    "models/workoutFileData",
    "models/commands/recalculateWorkoutFromDeviceFile",
    "views/userConfirmationView",
    "hbs!templates/views/confirmationViews/deleteConfirmationView",
    "hbs!templates/views/quickView/workoutFileUploadMenu"
],
function(
    _,
    TP,
    WorkoutFileDataModel,
    RecalculateWorkoutCommand,
    UserConfirmationView,
    deleteConfirmationTemplate,
    WorkoutFileUploadMenuTemplate
    )
{

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
            "click button.download": "onDownloadClicked",
            "click button.delete": "onDeleteClicked"
        },

        attributes: {
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
                var self = this;
                this.model.get("details").fetch();

                // update the detail data
                this.model.get("detailData").fetch();
            } else
            {
                this.waitingOff();
            }
            this.close();
        },

        onDownloadClicked: function()
        {
            this.waitingOn();
            var fileDataModel = new WorkoutFileDataModel({ id: this.getSelectedFileSystemId(), workoutId: this.model.get("workoutId") });
            var self = this;
            fileDataModel.fetch().done(function(fileData)
            {
                TP.utils.filesystem.downloadFile(fileData.fileName, fileData.data, fileData.contentType, function(filesystemURL)
                {
                    var link = $("<a>");
                    link.attr("href", filesystemURL);
                    link.attr("download", fileData.fileName);
                    link.text(fileData.fileName);
                    self.$(".details").append(link);
                    //console.log(filesystemURL);
                });

                self.waitingOff();
            });
        },

        getSelectedFileSystemId: function()
        {
            var fileInfo = _.find(this.model.get("details").get("workoutDeviceFileInfos"), function(fileInfo)
            {
                return fileInfo.fileId === Number(this.selectedFileId);
            }, this);

            return fileInfo ? fileInfo.fileSystemId : "";
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