define(
[
], function()
{
    var filesystemUtils = {

        requestFileSystem: function(type, length, callback)
        {

            if (webkitRequestFileSystem)
                return webkitRequestFileSystem(type, length, callback);

            if (requestFileSystem)
                return requestFileSystem(type, length, callback);

        },

        downloadFile: function(fileName, fileData, contentType, onSuccess)
        {

            var fileDataAsUint8Array = this.stringToUint8Array(fileData);

            var afterRequestFilesystem = function(fs)
            {

                var afterCreateFile = function(fileEntry)
                {

                    var afterCreateFileWriter = function(fileWriter)
                    {
                        var blob = new Blob([fileDataAsUint8Array], { type: contentType });
                        fileWriter.write(blob);
                        onSuccess(fileEntry.toURL());
                    };

                    fileEntry.createWriter(afterCreateFileWriter);
                };

                fs.root.getFile(fileName, { create: true }, afterCreateFile);
            };


            // how big does fs need to be?
            this.requestFileSystem(TEMPORARY, fileData.length * 2, afterRequestFilesystem);

        },

        stringToUint8Array: function(base64Data)
        {
            var raw = window.atob(base64Data);
            var rawLength = raw.length;
            var array = new Uint8Array(new ArrayBuffer(rawLength));

            for (i = 0; i < rawLength; i++)
            {
                array[i] = raw.charCodeAt(i);
            }
            return array;
        }

    };

    return filesystemUtils;
});