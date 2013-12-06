define([
    'text!templates/Persons/form/FormTemplate.html',
    'views/Persons/EditView',
    'views/Opportunities/compactContent',
    'views/Notes/NoteView',
    'text!templates/Notes/AddNote.html',
    'text!templates/Notes/AddAttachments.html',
    'collections/Opportunities/OpportunitiesCollection',
    'common'
],

    function (PersonFormTemplate, EditView, opportunitiesCompactContentView, noteView, addNoteTemplate, addAttachTemplate, OpportunitiesCollection, common) {
        var PersonTasksView = Backbone.View.extend({
            el: '#content-holder',
            initialize: function (options) {
                this.formModel = options.model;
                this.opportunitiesCollection = new OpportunitiesCollection();
                this.opportunitiesCollection.bind('reset', _.bind(this.render, this));
            },

            events: {
                "click .checkbox": "checked",
                "click .person-checkbox:not(.disabled)": "personsSalesChecked",
                "click .details": "toggle",
                "mouseover .social a": "socialActive",
                "mouseout .social a": "socialNotActive",
                "click .company": "gotoCompanyForm",
                "click #attachSubmit": "addAttach",
                "click #addNote": "addNote",
                "click .editDelNote": "editDelNote",
                "click #cancelNote": "cancelNote",
                "click .deleteAttach": "deleteAttach",
                "mouseenter .editable:not(.quickEdit)": "quickEdit",
                "mouseleave .editable": "removeEdit",
                "click #editSpan": "editClick",
                "click #cancelSpan": "cancelClick",
                "click #saveSpan": "saveClick"

            },

            quickEdit: function (e) {
                $("#" + e.target.id).append('<span id="editSpan" class=""><a href="#">Edit</a></span>');
            },

            removeEdit: function (e) {
                $('#editSpan').remove();
            },
            createItem: function () {
                new CreateView({ collection: this.collection });

            },

            cancelClick: function (e) {
                e.preventDefault();

                var parent = $(e.target).parent().parent();

                if ($("#" + parent[0].id).hasClass('with-checkbox')) {
                    $("#" + parent[0].id + " input").prop('disabled', true);
                } else if (parent[0].id == 'email') {
                    $("#" + parent[0].id).append('<a href="mailto:' + this.text + '">' + this.text + '</a>');
                } else {
                    $("#" + parent[0].id).text(this.text);
                }
                $("#" + parent[0].id).removeClass('quickEdit');
                $('#editInput').remove();
                $('#cancelSpan').remove();
                $('#saveSpan').remove();

                var currentModel = this.collection.getElement();
                Backbone.history.navigate("#home/content-Persons/form/" + currentModel.id, { trigger: true });
            },


            editClick: function (e) {
                e.preventDefault();
                $('.quickEdit #editInput').remove();
                $('.quickEdit #cancelSpan').remove();
                $('.quickEdit #saveSpan').remove();
                if (this.prevQuickEdit) {
                    if ($('#' + this.prevQuickEdit.id).hasClass('quickEdit')) {
                        if ($('#' + this.prevQuickEdit.id).hasClass('with-checkbox')) {
                            $('#' + this.prevQuickEdit.id + ' input').prop('disabled', true).prop('checked', ($('#' + this.prevQuickEdit.id + ' input').prop('checked') ? 'checked' : ''));
                            $('.quickEdit').removeClass('quickEdit');
                        } else if (this.prevQuickEdit.id == 'email') {
                            $("#" + this.prevQuickEdit.id).append('<a href="mailto:' + this.text + '">' + this.text + '</a>');
                            $('.quickEdit').removeClass('quickEdit');
                        } else {
                            $('.quickEdit').text(this.text).removeClass('quickEdit');
                        }
                    }
                }
                var parent = $(e.target).parent().parent();
                $("#" + parent[0].id).addClass('quickEdit');
                $('#editSpan').remove();
                this.text = $('#' + parent[0].id).text();
                if ($("#" + parent[0].id).hasClass('date')) {
                    $("#" + parent[0].id).text('');
                    $("#" + parent[0].id).append('<input id="editInput" type="text" class="left has-datepicker"/>');
                    $('.has-datepicker').datepicker();
                } else if ($("#" + parent[0].id).hasClass('with-checkbox')) {
                    $("#" + parent[0].id + " input").removeAttr('disabled');
                } else {
                    $("#" + parent[0].id).text('');
                    $("#" + parent[0].id).append('<input id="editInput" type="text" class="left"/>');
                }
                $('#editInput').val(this.text);
                this.prevQuickEdit = parent[0];
                $("#" + parent[0].id).append('<span id="cancelSpan" class="right"><a href="#">Cancel</a></span>');
                $("#" + parent[0].id).append('<span id="saveSpan" class="right"><a href="#">Save</a></span>');
            },

            saveClick: function (e) {
                e.preventDefault();
                var parent = $(event.target).parent().parent();
                var objIndex = parent[0].id.split('_');
                var obj = {};
                var currentModel = this.collection.getElement();

                if (objIndex.length > 1) {
                    if ($("#" + parent[0].id).hasClass('with-checkbox')) {
                        obj = currentModel.get(objIndex[0]);
                        obj[objIndex[1]] = ($("#" + parent[0].id + " input").prop("checked"));
                    } else {
                        obj = currentModel.get(objIndex[0]);
                        obj[objIndex[1]] = $('#editInput').val();
                    }
                } else if (objIndex.length == 1) {
                    if ($("#" + parent[0].id).hasClass('with-checkbox')) {
                        obj[objIndex[0]] = ($("#" + parent[0].id + " input").prop("checked"));
                    } else {
                        obj[objIndex[0]] = $('#editInput').val();
                    }
                }

                this.text = $('#editInput').val();
                if ($("#" + parent[0].id).hasClass('with-checkbox')) {
                    $("#" + parent[0].id + " input").prop('disabled', true);
                } else if (parent[0].id == 'email') {
                    $("#" + parent[0].id).append('<a href="mailto:' + this.text + '">' + this.text + '</a>');
                } else {
                    $("#" + parent[0].id).text(this.text);
                }
                $("#" + parent[0].id).removeClass('quickEdit');
                $('#editInput').remove();
                $('#cancelSpan').remove();
                $('#saveSpan').remove();

                currentModel.set(obj);
                currentModel.save({}, {
                    headers: {
                        mid: 39
                    },
                    success: function () {
                        Backbone.history.navigate("#home/content-Persons/form/" + currentModel.id, { trigger: true });
                    }
                });
            },


            cancelNote: function (e) {
                $('#noteArea').val('');
                $('#noteTitleArea').val('');
                $('#getNoteKey').attr("value", '');
            },
            editDelNote: function (e) {
                var id = e.target.id;
                var k = id.indexOf('_');
                var type = id.substr(0, k);
                var id_int = id.substr(k + 1);


                var currentModel = this.formModel;
                var notes = currentModel.get('notes');

                switch (type) {
                    case "edit": {
                        $('#noteArea').val($('#' + id_int).find('.noteText').text());
                        $('#noteTitleArea').val($('#' + id_int).find('.noteTitle').text());
                        $('#getNoteKey').attr("value", id_int);
                        break;
                    }
                    case "del": {

                        var new_notes = _.filter(notes, function (note) {
                            if (note._id != id_int) {
                                return note;
                            }
                        });
                        currentModel.set('notes', new_notes);
                        currentModel.save({},
                                {
                                    headers: {
                                        mid: 39,
                                        remove: true
                                    },
                                    success: function (model, response, options) {
                                        $('#' + id_int).remove();
                                    }
                                });
                        break;
                    }
                }
            },

            addNote: function (e) {
                var val = $('#noteArea').val();
                var title = $('#noteTitleArea').val();
                if (val || title) {
                    var currentModel = this.formModel;
                    var notes = currentModel.get('notes');
                    var arr_key_str = $('#getNoteKey').attr("value");
                    var note_obj = {
                        note: '',
                        title: ''
                    };
                    if (arr_key_str) {
                        var edit_notes = _.filter(notes, function (note) {
                            if (note._id == arr_key_str) {
                                note.note = val;
                                note.title = title;
                                return note;
                            }
                        });
                        currentModel.save({},
                                   {
                                       headers: {
                                           mid: 39
                                       },
                                       success: function (model, response, options) {
                                           $('#noteBody').val($('#' + arr_key_str).find('.noteText').text(val));
                                           $('#noteBody').val($('#' + arr_key_str).find('.noteTitle').text(title));
                                           $('#getNoteKey').attr("value", '');
                                       }
                                   });



                    } else {

                        note_obj.note = val;
                        note_obj.title = title;
                        notes.push(note_obj);
                        currentModel.set('notes', notes);
                        currentModel.save({},
                                    {
                                        headers: {
                                            mid: 39,
                                            wait: true
                                        },
                                        success: function (model, response, options) {
                                            var key = notes.length - 1;
                                            var notes_data = response.notes;
                                            var date = common.utcDateToLocaleDate(response.notes[key].date);
                                            var author = currentModel.get('name').first;
                                            var id = response.notes[key]._id;
                                            $('#noteBody').prepend(_.template(addNoteTemplate, { val: val, title: title, author: author, data: notes_data, date: date, id: id }));

                                        }
                                    });

                    }
                    $('#noteArea').val('');
                    $('#noteTitleArea').val('');
                }
            },


            addAttach: function (event) {
                event.preventDefault();
                var currentModel = this.formModel;
                var currentModelID = currentModel["id"];
                var addFrmAttach = $("#addAttachments");
                var addInptAttach = $("#inputAttach")[0].files[0];
                addFrmAttach.submit(function (e) {

                    var formURL = "http://" + window.location.host + "/uploadFiles";
                    e.preventDefault();
                    addFrmAttach.ajaxSubmit({
                        url: formURL,
                        type: "POST",
                        processData: false,
                        contentType: false,
                        data: [addInptAttach],
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("id", currentModelID);
                        },

                        success: function (data) {
                            var attachments = currentModel.get('attachments');
                            var date = common.utcDateToLocaleDate(data.uploadDate);
                            attachments.push(data);
                            $('.attachContainer').prepend(_.template(addAttachTemplate, { data: data, date: date }));
                            addFrmAttach[0].reset();
                        },

                        error: function () {

                        }
                    });
                });
                addFrmAttach.submit();
                addFrmAttach.off('submit');
            },


            deleteAttach: function (e) {
                var id = e.target.id;
                var currentModel = this.formModel;
                var attachments = currentModel.get('attachments');
                var new_attachments = _.filter(attachments, function (attach) {
                    if (attach._id != id) {
                        return attach;
                    }
                });
                currentModel.set('attachments', new_attachments);
                currentModel.save({},
                        {
                            headers: {
                                mid: 39
                            },

                            success: function (model, response, options) {
                                $('.attachFile_' + id).remove();
                            }
                        });
            },

            editItem: function () {
                //create editView in dialog here
                new EditView({ collection: this.collection });
            },

            personsSalesChecked: function (e) {
                if ($(e.target).get(0).tagName.toLowerCase() == "span") {
                    $(e.target).parent().toggleClass("active");
                } else {
                    $(e.target).toggleClass("active");
                }
            },

            gotoCompanyForm: function (e) {
                e.preventDefault();
                var id = $(e.target).closest("a").attr("data-id");
                window.location.hash = "#home/content-Companies/form/" + id;
            },
            toggle: function () {
                this.$('#details').animate({
                    height: "toggle"
                }, 250, function () {

                });
            },
            socialActive: function (e) {
                e.preventDefault();
                $(e.target).animate({
                    'background-position-y': '-38px'

                }, 300, function () { });
            },
            socialNotActive: function (e) {
                e.preventDefault();
                $(e.target).animate({
                    'background-position-y': '0px'
                }, 300, function () { });
            },

            render: function () {
                var formModel = this.formModel.toJSON();
                
                this.$el.html(_.template(PersonFormTemplate, formModel));
                this.$el.find('.formRightColumn').append(
                                new opportunitiesCompactContentView({
                                    collection: this.opportunitiesCollection,
                                    model: this.formModel
                                }).render(true).el
                            );

                this.$el.find('.formLeftColumn').append(
                    new noteView({
                        model: this.formModel
                    }).render().el
                );
                return this;
            },

            editItem: function () {
                //create editView in dialog here
                new EditView({ model: this.formModel });
            },

            deleteItems: function () {
                var mid = 39;

                this.formModel.destroy({
                    headers: {
                        mid: mid
                    },
                    success: function () {
                        Backbone.history.navigate("#easyErp/Persons/thumbnails", { trigger: true });
                    }
                });

            }
        });

        return PersonTasksView;
    });