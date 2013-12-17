define( function () {
    var ProfilesModel = Backbone.Model.extend({
        idAttribute:"_id",

        initialize: function(){
            this.on('invalid', function(model, errors){
                if(errors.length > 0){
                    var msg = $.map(errors,function(error){
                        return error.msg;
                    }).join('\n');
                    alert(msg);
                }
            });
        },
        validate: function(attrs){
            var errors = [];

            if($.trim(attrs.profileName) == ""){
                errors.push(
                    {
                        name:"Profile name",
                        field:"profileName",
                        msg:"Profile name can not be empty"
                    }
                );
            }
            if(errors.length > 0)
                return errors;
        },
        urlRoot: function(){
             return "/Profiles";
        }
    });

    return ProfilesModel;
});