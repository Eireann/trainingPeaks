define(
[
    "TP",
    "models/commands/saveWorkoutToExerciseLibrary",
    "hbs!templates/views/saveWorkoutToLibraryConfirmationView"
],
function(TP, SaveWorkoutToLibraryCommand, saveWorkoutToLibraryTemplate)
{
    return TP.ItemView.extend(
    {
        modal: {
            mask: true,
            shadow: true
        },

        showThrobbers: false,
        tagName: "div",
        className: "saveWorkoutToLibraryConfirmation",

        events:
        {
            "click #confirmationOk": "onOk",
            "click #confirmationCancel" : "onCancel"
        },

        template:
        {
            type: "handlebars",
            template: saveWorkoutToLibraryTemplate
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
            });

            deferred.always(function()
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
        },

        serializeData: function()
        {
            var data = this.model.toJSON();
            data.libraries = [];

            var self = this;
            this.libraries.each(function(library)
            {
                var libraryData = library.toJSON();
                data.libraries.push(libraryData);
            });

            return data;
        }

    });
});