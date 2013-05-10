define(
[
    "TP",
    "models/workoutFileData",
    "views/userConfirmationView",
    "hbs!templates/views/confirmationViews/deleteConfirmationView",
    "hbs!templates/views/quickView/workoutFileUploadMenu"
],
function(
    TP,
    WorkoutFileDataModel,
    UserConfirmationView,
    deleteConfirmationTemplate,
    WorkoutFileUploadMenuTemplate
    )
{
    /* TODO:

    upload button dark state
    review user story
    review api endpoints
    connect bottom buttons to actions
        with delete confirmation
    reload details and detailData on recalculate

    */


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
            //POST athletes/{athleteId:int}/commands/workouts/{workoutId:int}/recalc/{fileId:int
            // returns workout data
            // re-fetch details and detailData

        },

        onDownloadClicked: function()
        {
            //GET athletes/{athleteId:int}/workouts/{workoutId:int}/filedata/{fileId:int
            // how to handle as file
        },

        onDeleteClicked: function()
        {
            this.deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationTemplate });
            this.deleteConfirmationView.render();
            this.deleteConfirmationView.on("userConfirmed", this.onDeleteFileConfirmed, this);
        },

        onDeleteFileConfirmed: function()
        {
            this.$(".details").addClass("waiting");
            var fileDataModel = new WorkoutFileDataModel({ id: this.selectedFileId, workoutId: this.model.get("workoutId") });
            var self = this;
            fileDataModel.destroy().done(function()
            {
                    self.model.get("details").fetch().done(function()
                    {
                        self.$(".details").removeClass("waiting");
                    });
                }
            );
        }

    });
});