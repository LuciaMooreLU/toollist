;(function () {
    'use strict';
    var $form_add_task = $('.add-task')
    ;
    $form_add_task.on('submit',function (e) {
        e.preventDefault();
        $(this).find('input[name=content]').val();

    })
})();

