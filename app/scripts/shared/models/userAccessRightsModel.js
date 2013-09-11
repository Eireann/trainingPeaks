define(
[
    "TP"
],
function(
    TP
    )
{
    return TP.DeepModel.extend(
    {

        defualts: {
            rights: []
        },

        url: function()
        {
            return theMarsApp.apiRoot + "/users/v1/user/accessrights";
        },

        parse: function(resp, options)
        {
            return {
                rights: resp
            };
        }        

    });

});