define(
[
], function()
{
    var filesystemUtils = {

        requestFileSystem: function(onSuccess, onError)
        {
            if (this.temporaryFs)
            {
                onSuccess(this.temporaryFs);
            } else
            {
                try {
                    var self = this;

                    var afterRequestFileSystem = function(fs)
                    {
                        self.temporaryFs = fs;
                        onSuccess(self.temporaryFs);
                    };

                    var type = window.TEMPORARY;
                    var length = 1024 * 1024 * 1024; // 1GB

                    if (window.webkitRequestFileSystem)
                    {
                        window.webkitRequestFileSystem(type, length, afterRequestFileSystem, onError);
                    } else if (window.requestFileSystem)
                    {
                        window.requestFileSystem(type, length, afterRequestFileSystem, onError);
                    }
                } catch(e)
                {
                    onError();
                }
            }
        },

        saveFileToTemporaryFilesystem: function(fileId, fileName, fileContents, contentType, onSuccess, onError)
        {
            var fileNameWithId = fileId + "_" + fileName;
            var fileDataAsUint8Array = this.stringToUint8Array(fileContents);

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

                fs.root.getFile(fileNameWithId, { create: true }, afterCreateFile);
            };


            this.requestFileSystem(afterRequestFilesystem, onError);

        },

        stringToUint8Array: function(base64Data)
        {
            var raw = window.atob(base64Data);
            var rawLength = raw.length;
            var array = new Uint8Array(new ArrayBuffer(rawLength));

            for (var i = 0; i < rawLength; i++)
            {
                array[i] = raw.charCodeAt(i);
            }
            return array;
        },

        getLocalFilesystemUrl: function(fileId, fileName, onSuccess, onError)
        {

            var fileNameWithId = fileId + "_" + fileName;
            var afterRequestFilesystem = function(fs)
            {

                var afterGetFileEntry = function(fileEntry)
                {
                    onSuccess(fileEntry.toURL());
                };

                fs.root.getFile(fileNameWithId, { create: false }, afterGetFileEntry, onError);
            };

            this.requestFileSystem(afterRequestFilesystem, onError);
        }

    };

    return filesystemUtils;
});
