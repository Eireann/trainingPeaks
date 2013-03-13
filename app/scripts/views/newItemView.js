define(
[
    "TP",
    "jqueryui/dialog",
    "models/workoutModel",
    "views/workoutQuickView",
    "hbs!templates/views/newItemView"
],
function (TP, dialog, WorkoutModel, WorkoutQuickView, newItemViewTemplate)
{
    var WorkoutFileData = TP.Model.extend(
    {
        url: function ()
        {
            return theMarsApp.apiRoot + "/WebApiServer/Fitness/V1/workouts/filedata";
        },

        parse: function (response)
        {
            return { workoutModel: response };
        }
    });

    return TP.ItemView.extend(
    {
        events:
        {
            "change input[type='file']": "onFileSelected",
            "click button": "onNewWorkoutClicked"
        },

        template:
        {
            type: "handlebars",
            template: newItemViewTemplate
        },

        ui:
        {
            "fileinput": "input[type='file']"
        },

        initialize: function ()
        {
            _.bindAll(this, "onUploadDone", "onUploadFail", "close");
        },

        onNewWorkoutClicked: function (e)
        {
            if (e.currentTarget.name === "uploadDeviceFile")
            {
                this.ui.fileinput.click();
            }
            else
            {
                var workoutTypeId = $(e.currentTarget).data("workoutid");
                this.newWorkout = new WorkoutModel(
                {
                    personId: theMarsApp.user.get("userId"),
                    workoutDay: this.model.get("date"),
                    title: "",
                    workoutTypeValueId: workoutTypeId
                });
                var quickView = new WorkoutQuickView({ model: this.newWorkout });
                quickView.on("discard", this.onNewWorkoutDiscarded, this);
                quickView.on("saveandclose", this.onNewWorkoutSaved, this);
                quickView.render();
            }
        },

        onFileSelected: function ()
        {
            var self = this;
            var fileList = this.ui.fileinput[0].files;

            var file = fileList[0];
            var reader = new FileReader();

            reader.onload = function (event)
            {
                function uint8ToString(buf)
                {
                    var i, length, out = '';
                    for (i = 0, length = buf.length; i < length; i += 1)
                    {
                        out += String.fromCharCode(buf[i]);
                    }
                    return out;
                }

                var data = new Uint8Array(event.target.result);
                var dataAsString = btoa(uint8ToString(data));
                self.uploadedFileDataModel = new WorkoutFileData({ date: moment(self.model.get("date")).unix(), Data: dataAsString });
                self.uploadedFileDataModel.save().done(self.onUploadDone).fail(self.onUploadFail);
            };

            reader.readAsArrayBuffer(file);

        },

        onUploadDone: function ()
        {
            console.debug(this.uploadedFileDataModel.get("workoutModel"));
        },

        onUploadFail: function ()
        {

        },

        onNewWorkoutDiscarded: function ()
        {
            delete this.newWorkout;
        },

        onNewWorkoutSaved: function ()
        {
            // The QuickView already saved the model to the server, let's update our local collections to reflect the change.
            this.model.add(this.newWorkout);
            this.$el.dialog("close");
            this.close();
        },

        onBeforeRender: function ()
        {
            this.$el.dialog(
            {
                autoOpen: false,
                modal: true,
                width: 800,
                height: 250,
                resizable: false
            });
        },

        onRender: function ()
        {
            var self = this;
            this.$el.dialog("open");
            this.$el.css("overflow", "hidden");
            setImmediate(function () { self.$el.bind("clickoutside", self.close); });
        }
    });
});