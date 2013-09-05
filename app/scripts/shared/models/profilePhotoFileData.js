define(
[
    "TP"
],
function (TP)
{
    var ProfilePhotoFileData = TP.Model.extend(
    {
        defaults:
        {
            fileName: null,
            data: null
        },
       
        url: function ()
        {
            return theMarsApp.apiRoot + "/users/v1/user/" + theMarsApp.user.id + "/profilephoto";
        },

        parse: function(resp, options)
        {
            return { profilePhotoUrl: resp };
        }
        
    });

    return ProfilePhotoFileData;
});
