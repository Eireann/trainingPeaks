define(
[
    "TP",
    "models/workoutMultiFileData"
],
function(TP, WorkoutMultiFileDataModel)
{
    var initialized = false;
    var $overlay = $("<div id='fileUploadOverlay'><div id='fileUploadPlusBox' class='addWorkoutWrapper'><div class='addWorkout'><div class='addWorkoutPlus'></div></div></div></div>");
    var $info = $("<div data-alert class='alert-box' style='display:none;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;'></div>");

    return {
        initialize: function ($body, $message)
        {
            if(initialized)
                throw "DragAndDropFileUploadWidget: Trying to initialize widget twice";

            if(!window)
                return;

            initialized = true;

            var mouseEnteredWindow = false;
            var dragging = 0;

            window.addEventListener("dragenter", function(e)
            {
                e = e || event;
                e.stopPropagation();
                e.preventDefault();  

                dragging++;

                if(mouseEnteredWindow)
                    return;

                $body.append($overlay);
                mouseEnteredWindow = true;
            });

            window.addEventListener("dragover", function (e)
            {
                e = e || event;
                e.preventDefault();

                if (mouseEnteredWindow)
                    return;
                
                $body.append($overlay);
                mouseEnteredWindow = true;

            }, false);

            window.addEventListener("dragout", function (e)
            {
                e = e || event;
                e.preventDefault();
                e.stopPropagation();
                
                console.log("dragout");
                $overlay.remove();

                mouseEnteredWindow = false;
            });

            window.addEventListener("dragleave", function (e)
            {
                e = e || event;
                e.preventDefault();
                e.stopPropagation();

                dragging--;
                console.log(dragging);
                if(dragging === 0)
                {
                    console.log("last drag leave");
                    $overlay.remove();
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

                $overlay.remove();

                var $progress = $("<progress id='fileUploadProgress'></progress'>");
                $message.append($progress);

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

                    $.when.apply($, multiFileUploadDeferreds).done(function()
                    {
                        var workouts = numberOfFiles === 1 ? arguments[0] : _.map(arguments, function(argument) { return argument[0][0]; });
                        var messageString = "Workout(s) successfully uploaded: ";

                        _.each(workouts, function(workout)
                        {
                            messageString += "id: " + workout.workoutId + ", date: " + workout.workoutDay + ", ";
                        });

                        var stopFadeOut = function() { $info.remove(); $info.html(""); };

                        $progress.remove();
                        $info.removeClass("alert").addClass("success").text(messageString).appendTo($message).fadeIn(600).fadeOut(5000, stopFadeOut).on("mouseenter", function() { $info.stop(); $info.css({ opacity: 1 }); }).on("mouseleave", function() { $info.fadeOut(5000, stopFadeOut) });

                    }).fail(function()
                    {
                        $progress.remove();
                        $info.removeClass("success").addClass("alert").text("File upload failed...").appendTo($message).fadeIn(600).fadeOut(5000, function() { $info.remove(); $info.html(""); });
                    });
                });

            }, false);
        }
    }
})
