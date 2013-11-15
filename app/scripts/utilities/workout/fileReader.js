define(
[ 
    "jquery",
    "underscore",
    "backbone"
],
function($, _, Backbone)
{
    function WorkoutFileReader(file)
    {
        if(_.isArray(file))
            this.files = file;
        else if(typeof file.length !== "undefined")
            this.files = file;
        else
            this.files = [file];
    }

    WorkoutFileReader.prototype.readFile = function ()
    {
        var readFileDeferred = new $.Deferred();
        
        var self = this;
        var numberOfFiles = this.files.length ? this.files.length : 1;
        var individualFilesDeferreds = [];

        _.each(this.files, function(file)
        {
            var thisFileDeferred = $.Deferred();

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

                thisFileDeferred.resolveWith(this, [file.name, dataAsString]);
            };

            individualFilesDeferreds.push(thisFileDeferred);
            reader.readAsArrayBuffer(file);
        });

        $.when.apply($, individualFilesDeferreds).done(function()
        {
                readFileDeferred.resolveWith(self, arguments);
        });

        return readFileDeferred;
    };

    // using Backbone instead of TP here or else we get circular import ...
    _.extend(WorkoutFileReader, Backbone.Events);

    return WorkoutFileReader;
});
