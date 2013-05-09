define(
[
    "TP",
    "hbs!templates/views/quickView/workoutFileUploadMenu"
],
function(TP, WorkoutFileUploadMenuTemplate)
{
    return TP.ItemView.extend(
    {

        modal: true,
        showThrobbers: false,
        tagName: "div",
        deviceAgentUrl: "http://support.trainingpeaks.com/device-agent.aspx",

        className: "workoutFileUploadMenu",

        events:
        {
            "click #workoutFileUploadMenuBrowse": "onBrowseClicked",
            "click .deviceAgentButton": "onDeviceAgentClicked",
            "click #closeIcon": "close",
            "change .fileSelect": "selectFileCheckbox"
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
            var fileDiv = checkbox.closest(".file");
            if (checkbox.is(":checked"))
            {
                fileDiv.addClass("selected");
            } else
            {
                fileDiv.removeClass("selected");
            }
        }

    });
});