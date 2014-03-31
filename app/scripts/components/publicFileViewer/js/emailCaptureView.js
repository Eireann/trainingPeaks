/*global escape: true */
define(
[
    "underscore",
    "jquery",
    "TP",
    "hbs!../templates/emailCaptureViewTemplate"
],
function(
    _,
    $,
    TP,
    emailCaptureViewTemplate
)
{

    var EmailCaptureView = TP.ItemView.extend({

        className: "emailCaptureView",
        tagName: "div",

        modal: 
        {
            mask: true,
            shadow: true,
            onOverlayClick: function(){}
        },

        closeOnResize: false,
        
        template:
        {
            type: "handlebars",
            template: emailCaptureViewTemplate
        },

        events:
        {
            "click .submit": "_onSubmit",
            "keypress .email": "_onKeyPress",
            "click .login": "_login",
            "click .signup": "_signup"
        },

        _onKeyPress: function (evt)
        {
            var charCode = (evt.which) ? evt.which : evt.keyCode;
            if(charCode === 13)
            {
                this._onSubmit();
            }
        },

        _onSubmit: function()
        {
            var email = this.$(".email").val();
            if(this._isValidEmail(email))
            {
                this._postToResponsys(email);
            }
        },

        _postToResponsys: function(emailAddress)
        {
            var subscription = {
                EmailAddress: emailAddress,
                ResponsysKey: "X0Gzc2X%3DWQpglLjHJlYQGzb4ONAfNXlUzbnkevzf2zer0zbzddHzeCzbVwjpnpgHlpgneHmgJoXX0Gzc2X%3DWQpglLjHJlYQGl01hX5ODDhPzfhzeskzdT3zdDOHM09k",
                PermissionStatus: "I",
                ContentType: "ATHLETE",
                ContentValue: 1 
            };

            $.ajax({
                type: "POST",
                url: this.options.cmsRoot + "/tp/marketing/SubscribeToNewsletter",
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(subscription)
            });

            this.close();
        },

        _isValidEmail: function(emailAddress) {
            return emailAddress.length > 5 && /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test(emailAddress);
        },

        _login: function()
        {
            document.location.href = this._getLoginRoot() + "/login?ReturnUrl=" + this._getReturnUrl();
        },

        _signup: function()
        {
            document.location.href = this._getLoginRoot() + "/signup?ReturnUrl=" + this._getReturnUrl();
        },

        _getLoginRoot: function()
        {
            return this.options.cmsRoot.replace(/^\/\//,"https://").replace("http://","https://");
        },

        _getReturnUrl: function()
        {
            return escape(document.location.href).replace(/\//g,"%2F");
        }
        
    });

    return EmailCaptureView;
});

