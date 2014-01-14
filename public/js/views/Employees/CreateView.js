define([
    "text!templates/Employees/CreateTemplate.html",
    "models/EmployeesModel",
    "common",
    "custom"
],
    function (CreateTemplate, EmployeeModel, common, custom) {

        var CreateView = Backbone.View.extend({
            el: "#content-holder",
            contentType: "Employees",
            template: _.template(CreateTemplate),
            imageSrc: '',
            initialize: function (options) {
                _.bindAll(this, "saveItem");
                this.model = new EmployeeModel();
                this.page=1;
                this.pageG=1;
                this.render();
            },

            events: {
                "click #tabList a": "switchTab",
                "mouseenter .avatar": "showEdit",
                "mouseleave .avatar": "hideEdit",
                'keydown': 'keydownHandler',

                'click .dialog-tabs a': 'changeTab',
                'click .addUser': 'addUser',
                'click .addGroup': 'addGroup',
                'click .unassign': 'unassign',
                "click .prevUserList":"prevUserList",
                "click .nextUserList":"nextUserList"
            },

            changeTab:function(e){
                $(e.target).closest(".dialog-tabs").find("a.active").removeClass("active");
                $(e.target).addClass("active");
                var n = $(e.target).parents(".dialog-tabs").find("li").index($(e.target).parent());
                $(".dialog-tabs-items").find(".dialog-tabs-item.active").removeClass("active");
                $(".dialog-tabs-items").find(".dialog-tabs-item").eq(n).addClass("active");
            },

            addUser:function(e){
                var self = this;
                $(".addUserDialog").dialog({
                    dialogClass: "add-user-dialog",
                    width: "900px",
                    buttons:{
                        save:{
                            text:"Choose",
                            class:"btn",

                            click: function(){
                                click: self.addUserToTable("#targetUsers")
                                $( this ).dialog( "close" );
                            }

                        },
                        cancel:{
                            text:"Cancel",
                            class:"btn",
                            click: function(){
                                $( this ).dialog( "close" );
                            }
                        }
                    }

                });
                $("#targetUsers").unbind().on("click","li",this.removeUsers);
                $("#sourceUsers").unbind().on("click","li",this.addUsers);
                var self = this;
                $(".nextUserList").unbind().on("click",function(e){
                    self.page+=1
                    self.nextUserList(e,self.page)
                });
                $(".prevUserList").unbind().on("click",function(e){
                    self.page-=1
                    self.prevUserList(e,self.page)
                });
            },

            addUserToTable:function(id){
                $(".groupsAndUser").show();
                $(".groupsAndUser tr").each(function(){
                    if ($(this).data("type")==id.replace("#","")){
                        $(this).remove();
                    }
                });
                $(id).find("li").each(function(){
                    $(".groupsAndUser").append("<tr data-type='"+id.replace("#","")+"' data-id='"+ $(this).attr("id")+"'><td>"+$(this).text()+"</td><td class='text-right'></td></tr>");
                });
                if ($(".groupsAndUser tr").length<2){
                    $(".groupsAndUser").hide();
                }
            },

            addGroup:function(e){
                var self = this;
                $(".addGroupDialog").dialog({
                    dialogClass: "add-group-dialog",
                    width: "900px",
                    buttons:{
                        save:{
                            text:"Choose",
                            class:"btn",
                            click: function(){
                                self.addUserToTable("#targetGroups")
                                $( this ).dialog( "close" );
                            }
                        },
                        cancel:{
                            text:"Cancel",
                            class:"btn",
                            click: function(){
                                $( this ).dialog( "close" );
                            }
                        }
                    }

                });
                $("#targetGroups").unbind().on("click","li",this.removeUsers);
                $("#sourceGroups").unbind().on("click","li",this.addUsers);
                var self = this;
                $(".nextGroupList").unbind().on("click",function(e){
                    self.pageG+=1
                    self.nextUserList(e,self.pageG)
                });
                $(".prevGroupList").unbind().on("click",function(e){
                    self.pageG-=1
                    self.prevUserList(e,self.pageG)
                });

            },

            unassign:function(e){
                var id=$(e.target).closest("tr").data("id");
                var type=$(e.target).closest("tr").data("type");
                var text=$(e.target).closest("tr").find("td").eq(0).text();
                $("#"+type).append("<option value='"+id+"'>"+text+"</option>");
                $(e.target).closest("tr").remove();
                if ($(".groupsAndUser").find("tr").length==1){
                    $(".groupsAndUser").hide();
                }

            },

            nextUserList:function(e,page){
                common.populateUsersForGroups('#sourceUsers','#targetUsers',null,page);
            },

            prevUserList:function(e,page){
                common.populateUsersForGroups('#sourceUsers','#targetUsers',null,page);
            },

            addUsers: function (e) {
                e.preventDefault();
                $(e.target).closest(".ui-dialog").find(".target").append($(e.target));

            },

            removeUsers: function (e) {
                e.preventDefault();
                $(e.target).closest(".ui-dialog").find(".source").append($(e.target));
            },

            keydownHandler: function(e){
                switch (e.which){
                    case 27:
                        this.hideDialog();
                        break;
                    default:
                        break;
                }
            },
            hideDialog: function () {
                $(".edit-dialog").remove();
                $(".add-group-dialog").remove();
                $(".add-user-dialog").remove();
            },
            showEdit: function () {
                $(".upload").animate({
                    height: "20px",
                    display:"block"
                }, 250);
               
            },
            hideEdit: function () {
              $(".upload").animate({
                    height: "0px",
                    display: "block"
                }, 250);

            },
            switchTab: function (e) {
                e.preventDefault();
                var link = this.$("#tabList a");
                if (link.hasClass("selected")) {
                    link.removeClass("selected");
                }
                var index = link.index($(e.target).addClass("selected"));
                this.$(".tab").hide().eq(index).show();
            },

            saveItem: function () {
                var self = this;
                var mid = 39;
                var employeeModel = new EmployeeModel();
                var name = {
                    first: $.trim(this.$el.find("#first").val()),
                    last: $.trim(this.$el.find("#last").val())
                };
                var workAddress = {};
                $("dd").find(".workAddress").each(function () {
                    var el = $(this);
                    workAddress[el.attr("name")] = $.trim(el.val());
                });
                var tags = $.trim(this.$el.find("#tags").val()).split(',');
                var workEmail = $.trim(this.$el.find("#workEmail").val());
                var personalEmail = $.trim(this.$el.find("#personalEmail").val());
                var skype = $.trim(this.$el.find("#skype").val());

                var phone = $.trim(this.$el.find("#phone").val());
                var mobile = $.trim(this.$el.find("#mobile").val());
                var workPhones = {
                    phone: phone,
                    mobile: mobile
                };

                var officeLocation = $.trim($("#officeLocation").val());
                var relatedUser = $("#relatedUsersDd option:selected").val();
                var department = $("#departmentsDd option:selected").val();
                var jobPosition = $("#jobPositionDd option:selected").val();
                var manager = $("#projectManagerDD option:selected").val();
                var coach = $("#coachDd option:selected").val();
                var identNo = $.trim($("#identNo").val());

                var passportNo = $.trim($("#passportNo").val());
                var otherId = $.trim($("#otherId").val());
                var homeAddress = {};
                $("dd").find(".homeAddress").each(function () {
                    var el = $(this);
                    homeAddress[el.attr("name")] = el.val();
                });
                var dateBirthSt = $.trim($("#dateBirth").val());
                var dateBirth = "";
                if (dateBirthSt) {
                    dateBirth = new Date(Date.parse(dateBirthSt)).toISOString();
                }
                var active = ($("#active").is(":checked")) ? true : false;

                var usersId=[];
                var groupsId=[];
                $(".groupsAndUser tr").each(function(){
                    if ($(this).data("type")=="targetUsers"){
                        usersId.push($(this).data("id"));
                    }
                    if ($(this).data("type")=="targetGroups"){
                        groupsId.push($(this).data("id"));
                    }

                });
                var whoCanRW = this.$el.find("[name='whoCanRW']:checked").val();
                employeeModel.save({
                    name: name,
                    imageSrc: this.imageSrc,
                    workAddress: workAddress,
                    workEmail: workEmail,
                    personalEmail: personalEmail,
                    skype: skype,
                    workPhones: workPhones,
                    officeLocation: officeLocation,
                    relatedUser: relatedUser ? relatedUser : "",
                    department: department,
                    jobPosition: jobPosition? jobPosition : "",
                    manager: manager ? manager : "",
                    coach: coach ? coach : "",
                    identNo: identNo,
                    passportNo: passportNo,
                    otherId: otherId,
                    homeAddress: homeAddress,
                    dateBirth: dateBirth,
                    active: active,
                    groups: {
                        owner: $("#allUsers").val(),
                        users: usersId,
                        group: groupsId
                    },
                    whoCanRW: whoCanRW
                },
                {
                    headers: {
                        mid: mid
                    },
                    wait: true,
                    success: function (model) {
                        self.hideDialog();
                        Backbone.history.navigate("easyErp/" + self.contentType, { trigger: true });
            },
                    error: function () {
                        self.hideDialog();
                        Backbone.history.navigate("home", { trigger: true });
                    }
                });
            },

            render: function () {
                var formString = this.template();
                var self = this;
                this.$el = $(formString).dialog({
                    dialogClass: "edit-dialog",
                    width: 800,
                    title: "Create Employee",
                    buttons:{
                        save:{
                            text: "Save",
                            class: "btn",
                            click: self.saveItem
                        },
                        cancel:{
                            text: "Cancel",
                            class: "btn",
                            click: function(){
                                self.hideDialog();
                            }
                        }
                    }
                });
                common.populateUsersForGroups('#sourceUsers','#targetUsers',null,this.page);
                common.populateUsers("#allUsers", "/UsersForDd",null,null,true);
                common.populateDepartmentsList("#sourceGroups","#targetGroups", "/DepartmentsForDd",null,this.pageG);

                common.populateUsers(App.ID.relatedUsersDd, "/UsersForDd");
                common.populateDepartments(App.ID.departmentsDd, "/DepartmentsForDd");
                common.populateJobPositions(App.ID.jobPositionDd, "/JobPositionForDd");
                common.populateEmployeesDd(App.ID.coachDd, "/getPersonsForDd");
                common.populateEmployeesDd(App.ID.managerSelect, "/getPersonsForDd");
                common.canvasDraw({ model: this.model.toJSON() }, this);
                $('#dateBirth').datepicker({
                    dateFormat: "d M, yy",
                    changeMonth: true,
                    changeYear: true,
                    yearRange: '-100y:c+nn',
                    maxDate: '-18y'
                });
                this.delegateEvents(this.events);
                return this;
            }

        });

        return CreateView;
    });
