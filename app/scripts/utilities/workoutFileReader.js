define(
[ 
    "TP", 
    "underscore"
],
function (TP, _)
{
    function WorkoutFileReader(file)
    {
        this.file = file;
    }

    WorkoutFileReader.prototype.readFile = function ()
    {
        var readFileDeferred = new $.Deferred();
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

            readFileDeferred.resolveWith(this, [ dataAsString ]);
            //self.uploadedFileDataModel = new WorkoutFileData({ workoutDay: moment(self.model.get("date")).format("YYYY-MM-DDThh:mm:ss"), startTime: moment(self.model.get("date")).add("hours", 6).format("YYYY-MM-DDThh:mm:ss"), data: dataAsString });
            //self.uploadedFileDataModel.save().done(self.onUploadDone).fail(self.onUploadFail);
        };

        reader.readAsArrayBuffer(this.file);

        return readFileDeferred;
    };

    _.extend(WorkoutFileReader, TP.Events);

    return WorkoutFileReader;
});