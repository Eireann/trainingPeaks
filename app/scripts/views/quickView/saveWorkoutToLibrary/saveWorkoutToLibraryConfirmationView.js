define(
[
    "TP",
    "models/commands/saveWorkoutToExerciseLibrary",
    "views/quickView/saveWorkoutToLibrary/saveWorkoutToLibraryAfterSaveMessageView",
    "hbs!templates/views/quickView/saveWorkoutToLibrary/saveWorkoutToLibraryConfirmationView"
],
function(TP, SaveWorkoutToLibraryCommand, AfterSaveView, saveWorkoutToLibraryTemplate)
{
    return TP.ItemView.extend(
    {
        modal:
        {
            mask: true,
            shadow: true
        },

        closeOnResize: false,

        showThrobbers: false,
        tagName: "div",
        className: "saveWorkoutToLibraryConfirmation",

        events:
        {
            "click #confirmationOk": "onOk",
            "click #confirmationCancel" : "onCancel",
            "keyup input[name='exerciseTitle']": "onTitleChanged"
        },

        template:
        {
            type: "handlebars",
            template: saveWorkoutToLibraryTemplate
        },

        onRender: function ()
        {
            var self = this;
            setImmediate(function ()
            {
                if(self.model.get("title"))
                    self.$("input[name='exerciseTitle']").val(self.model.get("title"));
                else
                    self.$("#confirmationOk").attr("disabled", "disabled");

                self.$("#selectLibrary").val(self.selectedLibraryId);

                self.$("#selectLibrary").selectBoxIt(
                {
                    dynamicPositioning: false
                });
            });
        },

        onTitleChanged: function()
        {
            if(this.$("input[name='exerciseTitle']").val().length > 0)
                this.$("#confirmationOk").removeAttr("disabled");
            else
                this.$("#confirmationOk").attr("disabled", "disabled");
        },

        onOk: function()
        {
            var libraryId = this.$("#selectLibrary").val();
            var saveToLibraryCommand = new SaveWorkoutToLibraryCommand({
                exerciseName: this.$("#exerciseTitle").val(),
                exerciseLibraryId: libraryId,
                workoutId: this.model.id
            });

            this.waitingOn();
            var deferred = saveToLibraryCommand.execute();
            var self = this;

            deferred.done(function()
            {
                self.libraries.get(libraryId).fetchExercises(true);
                self.close();
                if (self.shouldShowConfirmation)
                {
                    self.showConfirmation();
                }
            });

            deferred.fail(function()
            {
                self.close();
            });
        },

        onCancel: function()
        {
            this.close();
        },

        initialize: function(options)
        {
            this.libraries = options && options.libraries ? options.libraries : new TP.Collection();
            this.selectedLibraryId = options.selectedLibraryId || this.libraries.getDefaultLibraryId();
            this.shouldShowConfirmation = options.shouldShowConfirmation !== false;
        },

        serializeData: function()
        {
            var data = this.model.toJSON();
            
            data.libraries = [];

            var userId = theMarsApp.user.get("userId");
            var self = this;
            this.libraries.each(function(library)
            {
                var libraryData = library.toJSON();
                if (userId === libraryData.ownerId)
                {
                    data.libraries.push(libraryData);
                }
            });

            return data;
        },

        showConfirmation: function()
        {
            var okView = new AfterSaveView();
            okView.render();
        }

    });
});
