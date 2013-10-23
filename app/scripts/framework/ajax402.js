define(
[
],
function()
{
    return function(app)
    {

        $(document).ajaxError(function(event, xhr, options)
        {
            if(options && options.errorHandlers && options.errorHandlers[xhr.status])
            {
                options.errorHandlers[xhr.status](xhr, options);
                return;
            }

            if(xhr.status === 402)
            {
                app.trigger("api:paymentrequired");
            }
        });
    };
});