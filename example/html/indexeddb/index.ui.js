/*
* @Author: baby
* @Date:   2016-04-08 17:02:49
* @Last Modified by:   baby
* @Last Modified time: 2016-04-08 17:03:15
*/

// index.ui.js

;

(function ($, Modernizr, app) {

    'use strict';

    $(function(){

        if(!Modernizr.indexeddb){
            $('#unsupported-message').show();
            $('#ui-container').hide();
            return;
        }

        var
          $deleteAllBtn = $('#delete-all-btn'),
          $titleText = $('#title-text'),
          $notesText = $('#notes-text'),
          $idHidden = $('#id-hidden'),
          $clearButton = $('#clear-button'),
          $saveButton = $('#save-button'),
          $listContainer = $('#list-container'),
          $noteTemplate = $('#note-template'),
          $emptyNote = $('#empty-note');

        var addNoTasksMessage = function(){
            $listContainer.append(
                $emptyNote.html());
        };

        var bindData = function (data) {

            $listContainer.html('');

            if(data.length === 0){
                addNoTasksMessage();
                return;
            }

            data.forEach(function (note) {
              var m = $noteTemplate.html();
              m = m.replace(/{ID}/g, note.id);
              m = m.replace(/{TITLE}/g, note.title);
              $listContainer.append(m);
            });
        };

        var clearUI = function(){
            $titleText.val('').focus();
            $notesText.val('');
            $idHidden.val('');
        };

        // select individual item
        $listContainer.on('click', 'a[data-id]',

            function (e) {

                var id, current;

                e.preventDefault();

                current = e.currentTarget;
                id = $(current).attr('data-id');

                app.db.get(id, function (note) {
                    $titleText.val(note.title);
                    $notesText.val(note.text);
                    $idHidden.val(note.id);
                });

                return false;
            });

        // delete item
        $listContainer.on('click', 'i[data-id]',

            function (e) {

                var id, current;

                e.preventDefault();

                current = e.currentTarget;
                id = $(current).attr('data-id');

                app.db.delete(id, function(){
                    app.db.getAll(bindData);
                    clearUI();
                });

                return false;
        });

        $clearButton.click(function(e){
            e.preventDefault();
            clearUI();
            return false;
        });

        $saveButton.click(function (e) {

            var title = $titleText.val();

            if (title.length === 0) {
                return;
            }

            var note = {
                title: title,
                text: $notesText.val()
            };

            var id = $idHidden.val();

            if(id !== ''){
                note.id = parseInt(id);
            }

            app.db.save(note, function(){
                app.db.getAll(bindData);
                clearUI();
            });
        });

        $deleteAllBtn.click(function (e) {

            e.preventDefault();

            app.db.deleteAll(function () {
                $listContainer.html('');
                addNoTasksMessage();
                clearUI();
            });

            return false;
        });

        app.db.errorHandler = function (e) {
            window.alert('error: ' + e.target.code);
            debugger;
        };

        app.db.getAll(bindData);

    });

}(jQuery, Modernizr, window.app));
