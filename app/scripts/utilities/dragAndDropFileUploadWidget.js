define(
[
    "jquery",
    "underscore",
    "TP",
    "models/workoutMultiFileData",
    "models/workoutModel",
    "utilities/conversion/conversion"
],
function($, _, TP, WorkoutMultiFileDataModel, WorkoutModel, dateConversion)
{
    var initialized = false;
    var uploadInProgress = false;
    var $overlay = $("<div id='fileUploadOverlay'></div>");
    var $dropTarget = $("<div class='dropTarget'><div class='dropText'>Drop Files Here</div><div class='uploadingText' style='display:none;'>Uploading file(s)</div><div class='uploadSuccess' style='display:none;'>File(s) successfully uploaded!</div><div class='uploadFail' style='display:none;'>File upload failed!</div></div>");
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
            var isFile = function(e)
            {
                return _.contains(e.dataTransfer.types, "Files");
            };

            window.addEventListener("dragenter", function(e)
            {
                e = e || event;
                e.stopPropagation();
                e.preventDefault();  
                if(uploadInProgress || !isFile(e))
                    return;

                dragging++;

                if(mouseEnteredWindow)
                    return;

                $overlay.show();
                $dropTarget.find(".dropText").show();
                $dropTarget.show();

                $body.append($overlay);
                $body.append($dropTarget);
                mouseEnteredWindow = true;
            });

            window.addEventListener("dragover", function (e)
            {
                e = e || event;
                e.preventDefault();
                if(uploadInProgress || !isFile(e))
                    return;

                if (mouseEnteredWindow)
                    return;

                $overlay.show();
                $dropTarget.show();
                $dropTarget.find(".dropText").show();
                
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

                if(uploadInProgress)
                    return;

                uploadInProgress = true;

                if (!e.dataTransfer)
                    return;
                
                var files = e.dataTransfer.files;
                dragging = 0;
                mouseEnteredWindow = false;

                $dropTarget.addClass("waiting");
                $dropTarget.find(".dropText").hide();
                $dropTarget.find(".uploadingText").show();
                
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
                        $dropTarget.find(".uploadingText").hide();
                        $dropTarget.find(".uploadSuccess").show();

                        var workoutModelInstance = new WorkoutModel();
                        _.each(workouts, function (workoutData)
                        {
                            if (theMarsApp)
                            {
                                theMarsApp.calendarManager.addOrUpdateItem(WorkoutModel, workoutModelInstance.parse(workoutData));
                            }
                        });

                        $dropTarget.fadeOut(2000, function() { $dropTarget.find(".uploadingText").hide(); $dropTarget.find(".uploadSuccess").hide(); $dropTarget.remove(); $overlay.remove(); uploadInProgress = false; });
                    }).fail(function()
                    {
                        $dropTarget.find(".uploadFail").show();
                        $dropTarget.fadeOut(5000, function() { $dropTarget.find(".uploadingText").hide(); $dropTarget.find(".uploadFail").hide(); $dropTarget.remove(); $overlay.remove(); uploadInProgress = false; });
                    });
                });

            }, false);
        }
    };
});
