define(
[
    "underscore",
    "TP",
    "models/workoutFileData",
    "views/userConfirmationView",
    "views/workout/workoutFileUploadView",
    "views/quickView/qvMain/qvFileUploadMenuView"
],
function (
    _,
    TP,
    WorkoutFileData,
    UserConfirmationView,
    WorkoutFileUploadView,
    QVFileUploadMenuView
)
{
    var workoutQuickViewFileUploads =
    {
        fileUploadEvents:
        {
            "click #quickViewFileUploadDiv": "onUploadFileClicked",

            // TODO Refactor: needs to be moved into qvFileUploadMenuView and dealt with internally
            "change input[type='file']#fileUploadInput": "onFileSelected"
        },

        fileUploadUi:
        {
            "fileinput": "input[type='file']#fileUploadInput"
        },

        initializeFileUploads: function()
        {
            _.extend(this.ui, this.fileUploadUi);
            _.extend(this.events, this.fileUploadEvents);
        },
        setupFileUploadView: function()
        {
            this.workoutFileUploadView = new WorkoutFileUploadView({el: this.ui.fileinput, workoutModel: this.model}); 
            this.listenTo(this.workoutFileUploadView, "uploadDone", this.onUploadDone, this);
            this.listenTo(this.workoutFileUploadView, "uploadFailed", this.onUploadFail, this);
        },

        watchForWorkoutFiles: function()
        {
            this.listenTo(this.model.get("details"), "change:workoutDeviceFileInfos", _.bind(this.updateUploadButtonState, this));
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
                this.fileUploadMenu.setPosition({ fromElement: uploadButton, left: uploadButton.outerWidth() + 12, top: -6 });
            } else
            {
                this.fileUploadMenu.setPosition({ fromElement: uploadButton, right: -12, top: -6 });
            }

            uploadButton.addClass("menuOpen");

            this.fileUploadMenu.render();

            this.listenTo(this.fileUploadMenu, "browseFile", _.bind(this.onUploadFileMenuUploadButtonClicked, this));
            this.listenTo(this.fileUploadMenu, "close", function() { uploadButton.removeClass("menuOpen"); });
        },

        onUploadFileMenuUploadButtonClicked: function()
        {
            this.ui.fileinput.click();
        },

        onFileSelected: function()
        {
            this.model.getState().set("waiting", true);

            this.waitingOn();
            this.isNew = this.model.get("workoutId") ? false : true;
        },

        onUploadDone: function(workoutModelJson)
        {
            this.waitingOff();

            // since this data came from the server, make sure we don't try to save it on model change events
            this.model.set(this.model.parse(workoutModelJson), { autosaved: true });

            var self = this;
            this.model.get("details").fetch().done(function()
            {
                self.model.getState().set("waiting", false);
            });
            this.model.trigger("deviceFileUploaded");

            if (this.isNew)
                this.trigger("saved");
        },

        onUploadFail: function()
        {
            this.waitingOff();
        }

    };

    return workoutQuickViewFileUploads;

});