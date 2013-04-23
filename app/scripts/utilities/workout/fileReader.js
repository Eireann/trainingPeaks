define(
[ 
    "underscore",
    "backbone"
],
function(_, Backbone)
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
        };

        reader.readAsArrayBuffer(this.file);

        return readFileDeferred;
    };

    // using Backbone instead of TP here or else we get circular import ...
    _.extend(WorkoutFileReader, Backbone.Events);

    return WorkoutFileReader;
});