define(
[
    "TP",
    "models/workoutMultiFileData",
    "models/workoutModel",
    "utilities/conversion/conversion"
],
function(TP, WorkoutMultiFileDataModel, WorkoutModel, dateConversion)
{
    var initialized = false;
    var $overlay = $("<div id='fileUploadOverlay'></div>");
    var $dropTarget = $("<div class='dropTarget'><div class='dropText'>Drop Files Here</div><div class='uploadingText'>Uploading file(s)</div></div>");
    var $info = $("<div data-alert class='alertBox'></div>");

    return {
        initialize: function ($body, $message)
        {
            if(initialized)
                return;

            if(!window)
                return;

            initialized = true;

            var mouseEnteredWindow = false;
            var dragging = 0;

            $('.uploadingText').hide();

            window.addEventListener("dragenter", function(e)
            {
                e = e || event;
                e.stopPropagation();
                e.preventDefault();  

                dragging++;

                if(mouseEnteredWindow)
                    return;

                $body.append($overlay);
                $body.append($dropTarget);
                mouseEnteredWindow = true;
            });

            window.addEventListener("dragover", function (e)
            {
                e = e || event;
                e.preventDefault();

                if (mouseEnteredWindow)
                    return;
                
                $body.append($overlay);
                $body.append($dropTarget);
                mouseEnteredWindow = true;

            }, false);

            window.addEventListener("dragout", function (e)
            {
                e = e || event;
                e.preventDefault();
                e.stopPropagation();
                
                $overlay.remove();
                $dropTarget.remove();

                mouseEnteredWindow = false;
            });

            window.addEventListener("dragleave", function (e)
            {
                e = e || event;
                e.preventDefault();
                e.stopPropagation();

                dragging--;
                if(dragging === 0)
                {
                    $overlay.remove();
                    $dropTarget.remove();
                    mouseEnteredWindow = false;
                }
            });

            window.addEventListener("drop", function (e)
            {
                e = e || event;
                e.stopPropagation();
                e.preventDefault();

                if (!e.dataTransfer)
                    return;
                
                var files = e.dataTransfer.files;
                dragging = 0;
                mouseEnteredWindow = false;

                $dropTarget.addClass("waiting");
                $('.dropText').hide();
                $('.uploadingText').show();
                
                var numberOfFiles = files.length;
                var workoutReader = new TP.utils.workout.FileReader(files);
                var workoutReaderDeferred = workoutReader.readFile();

                workoutReaderDeferred.done(function()
                {
                    var filesRead = [];

                    if(numberOfFiles === 1)
                        filesRead.push(arguments);
                    else
                        filesRead = arguments;

                    var multiFileUploadDeferreds = [];

                    _.each(filesRead, function(file)
                    {
                        var uploadedFileDataModel = new WorkoutMultiFileDataModel({ data: file[1], fileName: file[0]});
                        var singleFileDeferred = uploadedFileDataModel.save();
                        multiFileUploadDeferreds.push(singleFileDeferred);
                    });

                    $.when.apply($, multiFileUploadDeferreds).done(function ()
                    {
                        var workouts = numberOfFiles === 1 ? arguments[0] : _.map(arguments, function (argument) { return argument[0][0]; });
                        var messageString = "Workout(s) successfully uploaded: ";

                        $dropTarget.removeClass("waiting");
                        $overlay.remove();
                        $dropTarget.remove();

                        _.each(workouts, function (workout)
                        {
                            if (theMarsApp)
                                theMarsApp.controllers.calendarController.weeksCollection.addWorkout(new WorkoutModel(workout));
                        });

                    });
                });

            }, false);
        }
    };
});
