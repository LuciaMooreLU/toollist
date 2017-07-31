;(function (){
    'use strict';
    var $form_add_task = $(".add-task")
        ,task_list = []
        ,$task_delete_trigger
        ,$task_detail_trigger
        ,$task_detail = $('.task-detail')
        ,$task_detail_mask = $('.task-detail-mask')
        ,$update_form
        ,$task_detail_content
        ,$task_detail_content_input
        , $checkbox_complete
        ,$msg = $('.msg')
        ,$msg_content = $('.msg').find('.msg-content')
        ,$msg_confirm = $('.msg').find('.msg-button')
         ,$alert_video = $('.alert')
        ,$body=$('body')
        ,$window = $(window)

    ;

   init();
    // render_alert("确定要删除吗？");

    //表单submit事件
     $form_add_task.on('submit',on_add_task_form_submit);
     //点击mask区域隐藏任务列表
     $task_detail_mask.on('click', hide_task_detail);


     function on_add_task_form_submit(event){
         event.preventDefault();
         var new_task = {},$input;

         $input = $(this).find('input[name=content]');
         new_task.content = $input.val();
         if(!new_task.content) return;
         console.log('new_task',new_task);
         if(add_task(new_task)){
             // console.log(11111);
                $input.val(null);

         }

    }

    function init(){
       // store.clear();
         task_list = store.get("task_list") || [];
         // console.log(task_list);
        listen_msg_event();
        if(task_list.length)
        {
            render_task_list();
            task_remind_check();
        }

        
    }




 /*   render_alert("确定要删除吗？")
        .then(function (result) {
            console.log(result);
        });
*/


    function render_alert(arg) {

        if(!arg)
        {
            console.error('alert title');
        }

        var conf = {}
            ,$box
            ,$content
            ,$confirm
            ,$cancel
            ,dfd
            ,confirmed
            ,timer
            ,$mask
        ;

        if(typeof arg === 'string')
        {
            conf.title = arg;
        }else
        {

            conf = $.extend(conf,arg);
        }


        //递延对象是解决或拒绝时被调用添加处理程序。
        // deferred.promise() 没有参数时，返回一个新的deferred对象，该对象的运行状态无法被改变；接受参数时，作用为在参数对象上部署deferred接口。
        dfd = $.Deferred();

        $mask = $('<div>'+'</div>')
            .css({
                position: 'fixed',
                top: 0,
                bottom: 0,
                right: 0,
                left:0,
                background: 'rgba(15, 15, 15, 0.5)'
            });

        $box = $(
            '<div>'+
                '<div class="box-title">'+ conf.title +'</div>'+
                '<div class="box-content">' +
                    '<button class="confirm" type="button">确定</button>' +
                    '<button  class="cancel" type="button">取消</button>'+
                '</div>'+
            '</div>')
            .css({
                width:350,
                height: 'auto',
                background: 'rgba(255,255,255,0.86)',
                position: 'fixed',
                'border-radius': 3,
                'box-shadow': '0 1px 2px rgba(0,0,0,0.5)',
                padding: '20px 0',
                'text-align' : 'center',
                color : '#000'
            });

            $content = $box.find('.box-content');

            $confirm = $content.find('button.confirm');
            $cancel = $content.find('button.cancel');

//实时监控点击确认的事件是否被触发
        timer = setInterval(function () {

            if(confirmed !== undefined){

   // deferred.resolve() 手动改变deferred对象的运行状态为"已完成"，从而立即触发done()方法。

                dfd.resolve(confirmed);
                clearInterval(timer);
                hide_alert();

            }
        },30);

        function hide_alert() {
           $mask.remove();
           $box.remove();
        }


        $confirm.on('click',function () {
            confirmed = true;
        });


        $cancel.on('click',function () {
            confirmed = false;
        });

        $mask.on('click',function () {
            hide_alert();
        });



        function adjust_box_position() {
            var window_width =$window.width()
                ,window_height =$window.height()
                ,box_width =$box.width()
                ,box_height =$box.height()
            ,move_x
            ,move_y
            ;

            move_x = (window_width - box_width) /2;
            move_y = (window_height - box_height)/2 -30;
            $box.css({left:move_x,top:move_y});
        }


        $window.on('resize',function () {
            adjust_box_position();
        });

        // $task_detail_mask.show();
        $mask.appendTo($body);
        $box.appendTo($body);
        $window.resize();

        //返回一个新的deferred对象，该对象的运行状态无法改变；
        return dfd.promise();
    }


    function task_remind_check() {
        var current_timestamp;
        var $itl = setInterval(function () {
            for(var i=0;i<task_list.length;i++){
                var item = get(i)
                    ,task_timestamp;


                if(!item || !item.remind_date || item.informed) continue;

                current_timestamp= (new Date()).getTime();
                task_timestamp = (new Date(item.remind_date)).getTime();
                console.log(current_timestamp);
                console.log(task_timestamp);

                if(current_timestamp - task_timestamp >=1){
                    // console.log(3333333);
                    update_task(i,{informed:true});
                    show_notify(item.content);
                }

            }
        },100000);
    }




    function listen_msg_event() {
        $msg_confirm.on('click',function () {
            hide_notify();
        })
    }


    function show_notify(msg) {
        $msg.show();
        $msg_content.html(msg);
        $alert_video[0].play();
    }



    function hide_notify() {
        $msg.hide();
    }



    function  add_task(new_task) {
        task_list.push(new_task);
         console.log('task_list',task_list);
        refresh_task_list();
        console.log(store.get("task_list"));

        return true;

    }

       function  listen_task_delete(){
           $task_delete_trigger.on('click',function(event){
               var $this = $(this);
               var $item = $this.parent().parent();
               var index = $item.data('index');
               if(index===undefined || !task_list[index]) return;
           //    var tmp = confirm("确定要删除吗？")
         //      tmp ? delete task_list[index] : null;
          //     refresh_task_list();
               render_alert("确定要删除吗？")
                   .then(function (result) {

                      result ? delte_task(index): null;


                   });


           });
       }

       function delte_task(index) {

           delete task_list[index];
           refresh_task_list();


       }

       function listen_task_detail(){

           var index;

           $('.task-item').on('dblclick', function () {
               index = $(this).data('index');
               show_task_detail(index);
           })

           $task_detail_trigger.on('click', function () {
               var $this = $(this);
               // console.log("1111");
               var $item = $this.parent().parent();
               index = $item.data('index');
               show_task_detail(index);
           })

       }


    function show_task_detail(index){
        /*生成详情模板*/
        render_task_detail(index);
        /*显示详情模板(默认隐藏)*/
        $task_detail.show();
        /*显示详情模板mask(默认隐藏)*/
        $task_detail_mask.show();
    }

    function hide_task_detail() {
        // console.log("11111111111");
        $task_detail.hide();
        $task_detail_mask.hide();
    }

function render_task_detail(index){
    if (index === undefined || !task_list[index])
        return;

    var item = task_list[index];

    var tpl =
        '<form>' +
        '<div class="content">' +
        item.content +
        '</div>' +
        '<div class="input-item">' +
        '<input style="display: none;" type="text" name="content" value="' + (item.content || '') + '">' +
        '</div>' +
        '<div>' +
        '<div class="desc input-item">' +
        '<textarea name="desc">' + (item.desc || '') + '</textarea>' +
        '</div>' +
        '</div>' +
        '<div class="remind input-item">' +
        '<label>提醒时间</label>' +
        '<input class="datetime" name="remind_date" type="text" value="' + (item.remind_date || '') + '">' +
        '</div>' +
        '<div class="input-item"><button type="submit">更新</button></div>' +
        '</form>';

    $task_detail.html(null);
    $task_detail.html(tpl);

    $update_form = $task_detail.find('form');
    $task_detail_content = $update_form.find('.content');
     // console.log($task_detail_content);
    $task_detail_content_input = $update_form.find('[name=content]');

    $('.datetime').datetimepicker();


    $task_detail_content.on('dblclick', function () {
        // console.log("22222");
        $task_detail_content_input.show();
        $task_detail_content.hide();
    });

    $update_form.on('submit',function (e) {
        e.preventDefault();
        var data={};
        data.content = $(this).find('[name=content]').val();
        data.desc = $(this).find('[name=desc]').val();
        data.remind_date = $(this).find('[name=remind_date]').val();
        data.informed = false;
        console.log(data);
        update_task(index, data);
        hide_task_detail();
    });


}
/*更新task*/
function update_task(index,data) {
    if (!index || !task_list[index])
        return;

    task_list[index] = $.extend({}, task_list[index], data);
    refresh_task_list();

}




    function refresh_task_list(){
        store.set('task_list',task_list);
       render_task_list();

    }

    function render_task_list(){
        var $task_list = $('.task-list');

        $task_list.html('');

        var complete_items = [];

        for(var i=0;i<task_list.length;i++){
            var item = task_list[i];
            if(item && item.complete)
                complete_items[i] = item;
            else
                var $task = render_task_item(item,i);
            $task_list.prepend($task);
            // console.log(store.get('task_list'));

            // console.log(task_list);
        }

        for (var j = 0; j < complete_items.length; j++) {
            $task = render_task_item(complete_items[j], j);
            if (!$task) continue;
            $task.addClass('completed');
            $task_list.append($task);
        }

        $task_delete_trigger = $('.action.delete');
        $task_detail_trigger = $('.action.detail');
        $checkbox_complete = $('.task-list .complete[type=checkbox]');
        listen_task_delete();
        listen_task_detail();
        listen_checkout_complete();

    }






   function render_task_item(data,index) {
       if(!data) return;

       var list_item_tpl =
           '<div class="task-item" data-index="' + index + '">' +
           '<span><input class="complete" ' + (data.complete ? 'checked' : '') + '  type="checkbox"></span>' +
           '<span class="task-content">' + data.content + '</span>' +
           '<span class="fr">' +
           '<span class="action delete"> 删除</span>' +
           '<span class="action detail"> 详细</span>' +
           '</span>' +
           '</div>';
       return $(list_item_tpl);

   }

   function listen_checkout_complete() {
        $checkbox_complete.on('click',function () {
            var $this = $(this);
            var index = $this.parent().parent().data('index');
            var item = get(index);
            if(item.complete)
                update_task(index,{complete:false});
            else
                update_task(index,{complete:true});
        })
    }

    function get(index) {
        return store.get('task_list',task_list)[index];
    }



    $("body").vegas({
        delay: 10000,
        timer: false,
        shuffle: true,
        firstTransition: 'fade',
        firstTransitionDuration: 5000,
        transition: 'flash2',
        transitionDuration: 5000,
        slides: [
            { src: 'http://7te9fe.com1.z0.glb.clouddn.com/bgimg_1.jpg' },
            { src: 'http://7te9fe.com1.z0.glb.clouddn.com/bgimg_2.jpg' },
            { src: 'http://7te9fe.com1.z0.glb.clouddn.com/bgimg_3.jpg' },
            { src: 'http://7te9fe.com1.z0.glb.clouddn.com/bgimg_4.jpg' },
            { src: 'http://7te9fe.com1.z0.glb.clouddn.com/bgimg_5.jpg' },
            { src: 'http://7te9fe.com1.z0.glb.clouddn.com/bgimg_6.jpg' },
            { src: 'http://7te9fe.com1.z0.glb.clouddn.com/bgimg_7.jpg' },
            { src: 'http://7te9fe.com1.z0.glb.clouddn.com/bgimg_8.jpg' },
            { src: 'http://7te9fe.com1.z0.glb.clouddn.com/bgimg_9.jpg' },
            { src: 'http://7te9fe.com1.z0.glb.clouddn.com/bgimg_10.jpg'}
    ]
    });



})()

