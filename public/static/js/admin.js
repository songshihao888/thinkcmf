Wind.use('noty', function () {});

function _loginExpiredNoty() {
    noty({
        text: "登录失效，请退出重新登录！",
        type: 'error',
        layout: 'topCenter',
        modal: true,
        // animation: {
        //     open: 'animated bounceInDown', // Animate.css class names
        //     close: 'animated bounceOutUp', // Animate.css class names
        // },
        timeout: 800,
        callback: {
            afterClose: function () {
                $.ajax({
                    url: GV.ROOT + 'admin/public/logout',
                    type: 'get',
                    dataType: 'JSON',
                    success: function (data) {
                        if (data.code == 1) {
                            if (parent) {
                                parent.location.reload()
                            } else {
                                window.location.reload();
                            }
                        }
                    }
                })
            }
        }
    })
}

;(function () {
    //全局ajax处理
    var headers = {'XX-Device-Type': 'web'};
    var token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = token;
    }
    $.ajaxSetup({
        headers: headers,
        complete: function (jqXHR) {
            var data = jqXHR.responseJSON;
            if (data.code == 10001) {
                _loginExpiredNoty();
            }
        },
        data: {},
        error: function (jqXHR, textStatus, errorThrown) {
            //请求失败处理
        }
    });

    if ($.browser && $.browser.msie) {
        //ie 都不缓存
        $.ajaxSetup({
            cache: false
        });
    }

    //不支持placeholder浏览器下对placeholder进行处理
    if (document.createElement('input').placeholder !== '') {
        $('[placeholder]').focus(function () {
            var input = $(this);
            if (input.val() == input.attr('placeholder')) {
                input.val('');
                input.removeClass('placeholder');
            }
        }).blur(function () {
            var input = $(this);
            if (input.val() == '' || input.val() == input.attr('placeholder')) {
                input.addClass('placeholder');
                input.val(input.attr('placeholder'));
            }
        }).blur().parents('form').submit(function () {
            $(this).find('[placeholder]').each(function () {
                var input = $(this);
                if (input.val() == input.attr('placeholder')) {
                    input.val('');
                }
            });
        });
    }

    // 所有加了dialog类名的a链接，自动弹出它的href
    if ($('a.js-dialog').length) {
        Wind.css('artDialog');
        Wind.use('artDialog', 'iframeTools', function () {
            $('.js-dialog').on('click', function (e) {
                e.preventDefault();
                var $this = $(this);
                art.dialog.open($(this).prop('href'), {
                    close: function () {
                        $this.focus(); // 关闭时让触发弹窗的元素获取焦点
                        return true;
                    },
                    title: $this.prop('title')
                });
            }).attr('role', 'button');

        });
    }

    // 所有的ajax form提交,由于大多业务逻辑都是一样的，故统一处理
    var ajaxForm_list = $('form.js-ajax-form');
    if (ajaxForm_list.length) {
        Wind.css('artDialog');
        Wind.use('ajaxForm', 'artDialog', 'noty', 'validate', function () {
            var $btn;
            $('button.js-ajax-submit').on('click', function (e) {
                var btn = $(this), form = btn.parents('form.js-ajax-form');
                $btn = btn;
                if (btn.data("loading")) {
                    return;
                }
                //批量操作 判断选项
                if (btn.data('subcheck')) {
                    btn.parent().find('span').remove();
                    if (form.find('input.js-check:checked').length) {
                        btn.data('subcheck', false);
                    } else {
                        $('<span class="tips_error">请至少选择一项</span>').appendTo(btn.parent()).fadeIn('fast');
                        return false;
                    }
                }


                var msg = btn.data('msg');
                if (msg) {
                    art.dialog({
                        id: 'warning',
                        icon: 'warning',
                        content: msg,
                        cancelVal: '关闭',
                        cancel: function () {
                            //btn.data('subcheck', false);
                            //btn.click();
                        },
                        ok: function () {
                            btn.data('msg', false);
                            btn.click();
                            btn.data('msg', msg);
                        }
                    });

                    return false;
                }

                //ie处理placeholder提交问题
                if ($.browser && $.browser.msie) {
                    form.find('[placeholder]').each(function () {
                        var input = $(this);
                        if (input.val() == input.attr('placeholder')) {
                            input.val('');
                        }
                    });
                }
            });

            ajaxForm_list.each(function () {
                $(this).validate({
                    //是否在获取焦点时验证
                    //onfocusout : false,
                    //是否在敲击键盘时验证
                    //onkeyup : false,
                    //当鼠标点击时验证
                    //onclick : false,
                    //给未通过验证的元素加效果,闪烁等
                    highlight: function (element, errorClass, validClass) {
                        if (element.type === "radio") {
                            this.findByName(element.name).addClass(errorClass).removeClass(validClass);
                        } else {
                            var $element = $(element);
                            $element.addClass(errorClass).removeClass(validClass);
                            $element.parent().addClass("has-error");//bootstrap3表单
                            $element.parents('.control-group').addClass("error");//bootstrap2表单

                        }
                    },
                    unhighlight: function (element, errorClass, validClass) {
                        if (element.type === "radio") {
                            this.findByName(element.name).removeClass(errorClass).addClass(validClass);
                        } else {
                            var $element = $(element);
                            $element.removeClass(errorClass).addClass(validClass);
                            $element.parent().removeClass("has-error");//bootstrap3表单
                            $element.parents('.control-group').removeClass("error");//bootstrap2表单
                        }
                    },
                    showErrors: function (errorMap, errorArr) {
                        var i, elements, error;
                        for (i = 0; this.errorList[i]; i++) {
                            error = this.errorList[i];
                            if (this.settings.highlight) {
                                this.settings.highlight.call(this, error.element, this.settings.errorClass, this.settings.validClass);
                            }
                            //this.showLabel( error.element, error.message );
                        }
                        if (this.errorList.length) {
                            //this.toShow = this.toShow.add( this.containers );
                        }
                        if (this.settings.success) {
                            for (i = 0; this.successList[i]; i++) {
                                //this.showLabel( this.successList[ i ] );
                            }
                        }
                        if (this.settings.unhighlight) {
                            for (i = 0, elements = this.validElements(); elements[i]; i++) {
                                this.settings.unhighlight.call(this, elements[i], this.settings.errorClass, this.settings.validClass);
                            }
                        }
                        this.toHide = this.toHide.not(this.toShow);
                        this.hideErrors();
                        this.addWrapper(this.toShow).show();
                    },
                    submitHandler: function (form) {
                        var $form = $(form);
                        var url = $btn.data('action');
                        var apiNamespace = '';
                        var method = 'post';
                        if (url) {
                            apiNamespace = $btn.data('api');
                            if ($btn.data('method')) {
                                method = $btn.data('method');
                            }
                        } else {
                            url = $form.attr('action');
                            apiNamespace = $form.data('api');
                            method = $form.attr('method');
                        }

                        if (apiNamespace !== undefined || (url.indexOf('/') !== 0 && url.indexOf(':') < 0)) {
                            apiNamespace = apiNamespace ? apiNamespace : 'api';
                            if (GV.API_ROOT && GV.API_ROOT[apiNamespace]) {
                                url = GV.API_ROOT[apiNamespace] + url;
                            } else {
                                alert('请在全局变量GV中定义API_ROOT');
                                return;
                            }
                        }

                        $form.ajaxSubmit({
                            url: url, //按钮上是否自定义提交地址(多按钮情况)
                            dataType: 'json',
                            method: method,
                            beforeSubmit: function (arr, $form, options) {
                                $btn.data("loading", true);
                                var html = $btn.html();

                                //按钮文案、状态修改
                                $btn.html(html + '...').prop('disabled', true).addClass('disabled');
                            },
                            success: function (data, statusText, xhr, $form) {

                                function _refresh() {
                                    if (data.url) {
                                        //返回带跳转地址
                                        window.location.href = data.url;
                                    } else {
                                        if (data.code == 1) {
                                            //刷新当前页
                                            reloadPage(window);
                                        }
                                    }
                                }

                                var html = $btn.html();

                                //按钮文案、状态修改
                                $btn.removeClass('disabled').prop('disabled', false).html(html.replace('...', '')).parent().find('span').remove();
                                if (data.code == 1) {
                                    if ($btn.data('success')) {
                                        var successCallback = $btn.data('success');
                                        window[successCallback](data, statusText, xhr, $form);
                                        return;
                                    }
                                    noty({
                                        text: data.msg,
                                        type: 'success',
                                        layout: 'topCenter',
                                        modal: true,
                                        // animation: {
                                        //     open: 'animated bounceInDown', // Animate.css class names
                                        //     close: 'animated bounceOutUp', // Animate.css class names
                                        // },
                                        timeout: 800,
                                        callback: {
                                            afterClose: function () {
                                                if ($btn.data('refresh') == undefined || $btn.data('refresh')) {

                                                    if ($btn.data('success_refresh')) {
                                                        var successRefreshCallback = $btn.data('success_refresh');
                                                        window[successRefreshCallback](data, statusText, xhr, $form);
                                                        return;
                                                    } else {
                                                        _refresh();
                                                    }

                                                }
                                            }
                                        }
                                    }).show();
                                    $(window).focus();
                                } else if (data.code == 0) {
                                    var $verify_img = $form.find(".verify_img");
                                    if ($verify_img.length) {
                                        $verify_img.attr("src", $verify_img.attr("src") + "&refresh=" + Math.random());
                                    }

                                    var $verify_input = $form.find("[name='verify']");
                                    $verify_input.val("");

                                    //$('<span class="tips_error">' + data.msg + '</span>').appendTo($btn.parent()).fadeIn('fast');
                                    $btn.removeProp('disabled').removeClass('disabled');

                                    noty({
                                        text: data.msg,
                                        type: 'error',
                                        layout: 'topCenter',
                                        modal: true,
                                        // animation: {
                                        //     open: 'animated bounceInDown', // Animate.css class names
                                        //     close: 'animated bounceOutUp', // Animate.css class names
                                        // },
                                        timeout: 800,
                                        callback: {
                                            afterClose: function () {
                                                _refresh();
                                            }
                                        }
                                    }).show();
                                    $(window).focus();
                                } else if (data.code == 10001) {
                                    _loginExpiredNoty();
                                }
                            },
                            error: function (xhr, e, statusText) {
                                art.dialog({
                                    id: 'warning',
                                    icon: 'warning',
                                    content: statusText,
                                    cancelVal: '关闭',
                                    cancel: function () {
                                        reloadPage(window);
                                    },
                                    ok: function () {
                                        reloadPage(window);
                                    }
                                });

                            },
                            complete: function () {
                                $btn.data("loading", false);
                            }
                        });
                    }
                });
            });

        });
    }

    //dialog弹窗内的关闭方法
    $('#js-dialog-close').on('click', function (e) {
        e.preventDefault();
        try {
            art.dialog.close();
        } catch (err) {
            Wind.css('artDialog');
            Wind.use('artDialog', 'iframeTools', function () {
                art.dialog.close();
            });
        }
        ;
    });

    //所有的删除操作，删除数据后刷新页面
    if ($('a.js-ajax-delete').length) {
        Wind.css('artDialog');
        Wind.use('artDialog', 'noty', function () {
            $('body').on('click', '.js-ajax-delete', function (e) {
                e.preventDefault();
                var $_this = this,
                    $this = $($_this),
                    url = $this.data('href'),
                    refresh = $this.data('refresh'),
                    msg = $this.data('msg');
                url = url ? url : $this.attr('href');

                art.dialog({
                    title: false,
                    icon: 'question',
                    content: msg ? msg : '确定要删除吗？',
                    follow: $_this,
                    close: function () {
                        $_this.focus(); //关闭时让触发弹窗的元素获取焦点
                        return true;
                    },
                    okVal: "确定",
                    ok: function () {
                        var apiNamespace = $this.data('api');
                        var method = 'post';

                        if (apiNamespace !== undefined || (url.indexOf('/') !== 0 && url.indexOf(':') < 0)) {
                            apiNamespace = apiNamespace ? apiNamespace : 'api';
                            if (GV.API_ROOT && GV.API_ROOT[apiNamespace]) {
                                url = GV.API_ROOT[apiNamespace] + url;
                            } else {
                                alert('请在全局变量GV中定义API_ROOT');
                                return;
                            }

                            if ($this.data('method')) {
                                method = $this.data('method');
                            } else {
                                method = 'delete';
                            }
                        }

                        $.ajax({
                            url: url,
                            type: method,
                            dataType: 'JSON',
                            success: function (data) {
                                if (data.code == '1') {
                                    noty({
                                        text: data.msg,
                                        type: 'success',
                                        layout: 'topCenter',
                                        modal: true,
                                        // animation: {
                                        //     open: 'animated bounceInDown', // Animate.css class names
                                        //     close: 'animated bounceOutUp', // Animate.css class names
                                        // },
                                        timeout: 800,
                                        callback: {
                                            afterClose: function () {
                                                if (refresh == undefined || refresh) {
                                                    if (data.url) {
                                                        //返回带跳转地址
                                                        window.location.href = data.url;
                                                    } else {
                                                        //刷新当前页
                                                        reloadPage(window);
                                                    }
                                                }
                                            }
                                        }
                                    }).show();

                                } else if (data.code == '0') {
                                    //art.dialog.alert(data.info);
                                    //alert(data.info);//暂时处理方案
                                    art.dialog({
                                        content: data.msg,
                                        icon: 'warning',
                                        ok: function () {
                                            this.title(data.msg);
                                            return true;
                                        }
                                    });
                                }
                            }
                        })
                    },
                    cancelVal: '关闭',
                    cancel: true
                });
            });

        });
    }


    Wind.use('artDialog', 'noty', function () {
        $('body').on('click', '.js-ajax-dialog-btn', function (e) {
            e.preventDefault();
            var $_this = this,
                $this = $($_this),
                url = $this.data('href'),
                refresh = $this.data('refresh'),
                msg = $this.data('msg'),
                waitMsg = $this.data('wait-msg');
            url = url ? url : $this.attr('href');
            if (!msg) {
                msg = "您确定要进行此操作吗？";
            }
            art.dialog({
                title: false,
                icon: 'question',
                content: msg,
                follow: $_this,
                close: function () {
                    $_this.focus(); //关闭时让触发弹窗的元素获取焦点
                    return true;
                },
                ok: function () {
                    var waitNoty;
                    if (waitMsg) {
                        waitNoty = noty({
                            text: waitMsg,
                            type: 'information',
                            layout: 'topCenter',
                            modal: true,
                            // animation: {
                            //     open: 'animated bounceInDown', // Animate.css class names
                            //     close: 'animated bounceOutUp', // Animate.css class names
                            // },
                            timeout: false
                        });
                    }

                    var apiNamespace = $this.data('api');
                    var method = 'post';

                    if (apiNamespace !== undefined || (url.indexOf('/') !== 0 && url.indexOf(':') < 0)) {
                        apiNamespace = apiNamespace ? apiNamespace : 'api';
                        if (GV.API_ROOT && GV.API_ROOT[apiNamespace]) {
                            url = GV.API_ROOT[apiNamespace] + url;
                        } else {
                            alert('请在全局变量GV中定义API_ROOT');
                            return;
                        }

                        if ($this.data('method')) {
                            method = $this.data('method');
                        }
                    }

                    $.ajax({
                        url: url,
                        type: method,
                        dataType: 'JSON',
                        success: function (data) {
                            if (waitNoty) {
                                waitNoty.close();
                            }
                            if (data.code == 1) {
                                noty({
                                    text: data.msg,
                                    type: 'success',
                                    layout: 'topCenter',
                                    modal: true,
                                    // animation: {
                                    //     open: 'animated bounceInDown', // Animate.css class names
                                    //     close: 'animated bounceOutUp', // Animate.css class names
                                    // },
                                    timeout: 800,
                                    callback: {
                                        afterClose: function () {
                                            if (refresh == undefined || refresh) {
                                                if (data.url) {
                                                    //返回带跳转地址
                                                    window.location.href = data.url;
                                                } else {
                                                    //刷新当前页
                                                    reloadPage(window);
                                                }
                                            }
                                        }
                                    }
                                });

                            } else if (data.code == 0) {
                                //art.dialog.alert(data.info);
                                art.dialog({
                                    content: data.msg,
                                    icon: 'warning',
                                    ok: function () {
                                        this.title(data.msg);
                                        return true;
                                    }
                                });
                            }
                        },
                        error: function () {
                            if (waitNoty) {
                                waitNoty.close();
                            }
                        }

                    })
                },
                cancelVal: '关闭',
                cancel: true
            });
        });

    });

    if ($('a.js-ajax-btn').length) {
        Wind.use('noty', function () {
            $('.js-ajax-btn').on('click', function (e) {
                e.preventDefault();
                var $_this = this,
                    $this = $($_this),
                    url = $this.data('href'),
                    msg = $this.data('msg');
                refresh = $this.data('refresh');
                url = url ? url : $this.attr('href');
                refresh = refresh == undefined ? 1 : refresh;

                var apiNamespace = $this.data('api');
                var method = 'post';

                if (apiNamespace !== undefined || (url.indexOf('/') !== 0 && url.indexOf(':') < 0)) {
                    apiNamespace = apiNamespace ? apiNamespace : 'api';
                    if (GV.API_ROOT && GV.API_ROOT[apiNamespace]) {
                        url = GV.API_ROOT[apiNamespace] + url;
                    } else {
                        alert('请在全局变量GV中定义API_ROOT');
                        return;
                    }

                    if ($this.data('method')) {
                        method = $this.data('method');
                    }
                }


                $.ajax({
                    url: url,
                    type: method,
                    dataType: 'JSON',
                    success: function (data) {
                        if (data.code == 1) {
                            noty({
                                text: data.msg,
                                type: 'success',
                                layout: 'center',
                                callback: {
                                    afterClose: function () {
                                        if (data.url) {
                                            location.href = data.url;
                                            return;
                                        }

                                        if (refresh || refresh == undefined) {
                                            reloadPage(window);
                                        }
                                    }
                                }
                            });
                        } else if (data.code == 0) {
                            noty({
                                text: data.msg,
                                type: 'error',
                                layout: 'center',
                                callback: {
                                    afterClose: function () {
                                        if (data.url) {
                                            location.href = data.url;
                                        }
                                    }
                                }
                            });
                        }
                    }
                });

            });

        });
    }


    /*复选框全选(支持多个，纵横双控全选)。
     *实例：版块编辑-权限相关（双控），验证机制-验证策略（单控）
     *说明：
     *	"js-check"的"data-xid"对应其左侧"js-check-all"的"data-checklist"；
     *	"js-check"的"data-yid"对应其上方"js-check-all"的"data-checklist"；
     *	全选框的"data-direction"代表其控制的全选方向(x或y)；
     *	"js-check-wrap"同一块全选操作区域的父标签class，多个调用考虑
     */

    if ($('.js-check-wrap').length) {
        var total_check_all = $('input.js-check-all');

        //遍历所有全选框
        $.each(total_check_all, function () {
            var check_all = $(this),
                check_items;

            //分组各纵横项
            var check_all_direction = check_all.data('direction');
            check_items = $('input.js-check[data-' + check_all_direction + 'id="' + check_all.data('checklist') + '"]').not(":disabled");
            if ($('.js-check-all').is(':checked')) {
                check_items.prop('checked', true);
            }
            //点击全选框
            check_all.change(function (e) {
                var check_wrap = check_all.parents('.js-check-wrap'); //当前操作区域所有复选框的父标签（重用考虑）

                if ($(this).prop('checked')) {
                    //全选状态
                    check_items.prop('checked', true);

                    //所有项都被选中
                    if (check_wrap.find('input.js-check').length === check_wrap.find('input.js-check:checked').length) {
                        check_wrap.find(total_check_all).prop('checked', true);
                    }

                } else {
                    //非全选状态
                    check_items.removeProp('checked');

                    check_wrap.find(total_check_all).removeProp('checked');

                    //另一方向的全选框取消全选状态
                    var direction_invert = check_all_direction === 'x' ? 'y' : 'x';
                    check_wrap.find($('input.js-check-all[data-direction="' + direction_invert + '"]')).removeProp('checked');
                }

            });

            //点击非全选时判断是否全部勾选
            check_items.change(function () {

                if ($(this).prop('checked')) {

                    if (check_items.filter(':checked').length === check_items.length) {
                        //已选择和未选择的复选框数相等
                        check_all.prop('checked', true);
                    }

                } else {
                    check_all.removeProp('checked');
                }

            });


        });

    }

    //日期选择器
    var dateInput = $("input.js-date");
    if (dateInput.length) {
        Wind.use('datePicker', function () {
            dateInput.datePicker();
        });
    }

    //日期+时间选择器
    var dateTimeInput = $("input.js-datetime");
    if (dateTimeInput.length) {
        Wind.use('datePicker', function () {
            dateTimeInput.datePicker({
                time: true
            });
        });
    }

    var yearInput = $("input.js-year");
    if (yearInput.length) {
        Wind.use('datePicker', function () {
            yearInput.datePicker({
                startView: 'decade',
                minView: 'decade',
                format: 'yyyy',
                autoclose: true
            });
        });
    }

    // bootstrap年选择器
    var bootstrapYearInput = $("input.js-bootstrap-year")
    if (bootstrapYearInput.length) {
        Wind.css('bootstrapDatetimePicker');
        Wind.use('bootstrapDatetimePicker', function () {
            bootstrapYearInput.datetimepicker({
                language: 'zh-CN',
                format: 'yyyy',
                minView: 'decade',
                startView: 'decade',
                todayBtn: 1,
                autoclose: true
            });
        });
    }

    // bootstrap日期选择器
    var bootstrapDateInput = $("input.js-bootstrap-date")
    if (bootstrapDateInput.length) {
        Wind.css('bootstrapDatetimePicker');
        Wind.use('bootstrapDatetimePicker', function () {
            bootstrapDateInput.datetimepicker({
                language: 'zh-CN',
                format: 'yyyy-mm-dd',
                minView: 'month',
                todayBtn: 1,
                autoclose: true
            });
        });
    }

    // bootstrap年月份选择器
    var bootstrapYearMonthInput = $("input.js-bootstrap-year-month");
    if (bootstrapYearMonthInput.length) {
        Wind.css('bootstrapDatetimePicker');
        Wind.use('bootstrapDatetimePicker', function () {
            bootstrapYearMonthInput.datetimepicker({
                language: 'zh-CN',
                format: 'yyyy-mm',
                minView: 'year',
                startView: 'decade',
                todayBtn: 1,
                autoclose: true
            });
        });
    }

    // bootstrap日期选择器日期+时间选择器
    var bootstrapDateTimeInput = $("input.js-bootstrap-datetime");
    if (bootstrapDateTimeInput.length) {
        Wind.css('bootstrapDatetimePicker');
        Wind.use('bootstrapDatetimePicker', function () {
            bootstrapDateTimeInput.datetimepicker({
                language: 'zh-CN',
                format: 'yyyy-mm-dd hh:ii',
                todayBtn: 1,
                autoclose: true
            });
        });
    }

    //tab
    var tabs_nav = $('ul.js-tabs-nav');
    if (tabs_nav.length) {
        Wind.use('tabs', function () {
            tabs_nav.tabs('.js-tabs-content > div');
        });
    }

    //地址联动
    var $js_address_select = $('.js-address-select');
    if ($js_address_select.length > 0) {
        $('.js-address-country-select,.js-address-province-select,.js-address-city-select,.js-address-district-select').change(function () {
            var $this = $(this);
            var id = $this.val();
            var $child_area_select;
            var $this_js_address_select = $this.parents('.js-address-select');
            if ($this.is('.js-address-country-select')) {
                $child_area_select = $this_js_address_select.find('.js-address-province-select');
                $this_js_address_select.find('.js-address-city-select').hide();
            } else if ($this.is('.js-address-province-select')) {
                $child_area_select = $this_js_address_select.find('.js-address-city-select');
                $this_js_address_select.find('.js-address-district-select').hide();
            } else if ($this.is('.js-address-city-select')) {
                $child_area_select = $this_js_address_select.find('.js-address-district-select');
                $this_js_address_select.find('.js-address-town-select').hide();
            } else {
                $child_area_select = $this_js_address_select.find('.js-address-town-select');
            }

            var empty_option = '<option class="js-address-empty-option" value="">' + $child_area_select.find('.js-address-empty-option').text() + '</option>';
            $child_area_select.html(empty_option);

            var child_area_html = $this.data('childarea' + id);
            if (child_area_html) {
                $child_area_select.show();
                $child_area_select.html(child_area_html);
                return;
            }

            var isCountry = 0;
            if ($this.is('.js-address-country-select')) {
                isCountry = 1;
            }

            $.ajax({
                url: $this_js_address_select.data('url'),
                type: 'POST',
                dataType: 'JSON',
                data: {id: id, is_country: isCountry},
                success: function (data) {
                    if (data.code == 1) {
                        if (data.data.areas.length > 0) {
                            var html = [empty_option];

                            $.each(data.data.areas, function (i, area) {
                                var area_html = '<option value="[id]">[name]</option>';
                                area_html = area_html.replace('[name]', area.name);
                                area_html = area_html.replace('[id]', area.id);
                                html.push(area_html);
                            });
                            html = html.join('', html);
                            $this.data('childarea' + id, html);
                            $child_area_select.html(html);
                            $child_area_select.show();
                        } else {
                            $child_area_select.hide();

                        }
                    }
                },
                error: function () {

                },
                complete: function () {

                }
            });
        });

    }
    //地址联动end
    Wind.css('artDialog');
    Wind.use('artDialog', 'noty', function () {
        $('body').on('click', '.js-click2call-btn', function (e) {
            e.preventDefault();
            var $_this = this,
                $this = $($_this),
                title = $this.data('title');
            title = title ? title : '点击下面链接,直接拨打电话';
            art.dialog({
                title: title,
                icon: 'question',
                content: $this.next('.js-click2call-mobiles').html(),
                follow: $_this,
                close: function () {
                    $_this.focus(); //关闭时让触发弹窗的元素获取焦点
                    return true;
                },
                cancelVal: '关闭',
                cancel: true
            });
        });
    });

})();

//重新刷新页面，使用location.reload()有可能导致重新提交
function reloadPage(win) {
    var location = win.location;
    location.href = location.pathname + location.search;
}

/**
 * 页面跳转
 * @param url 要打开的页面地址
 */
function redirect(url) {
    location.href = url;
}

/**
 * 读取cookie
 * @param name
 * @returns
 */
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/**
 * 设置cookie
 */
function setCookie(name, value, options) {
    options = options || {};
    if (value === null) {
        value = '';
        options.expires = -1;
    }
    var expires = '';
    if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
        var date;
        if (typeof options.expires == 'number') {
            date = new Date();
            date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
        } else {
            date = options.expires;
        }
        expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
    }
    var path = options.path ? '; path=' + options.path : '';
    var domain = options.domain ? '; domain=' + options.domain : '';
    var secure = options.secure ? '; secure' : '';
    document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
}

/**
 * 打开iframe式的窗口对话框
 * @param url
 * @param title
 * @param options
 */
function openIframeDialog(url, title, options) {
    Wind.css('artDialog');
    var params = {
        title: title,
        lock: true,
        opacity: 0,
        width: "95%",
        height: '90%'
    };
    params = options ? $.extend(params, options) : params;
    Wind.use('artDialog', 'iframeTools', function () {
        art.dialog.open(url, params);
    });
}

/**
 * 打开地图对话框
 * @param url
 * @param title
 * @param options
 * @param callback
 */
function openMapDialog(url, title, options, callback) {
    Wind.css('artDialog');
    var params = {
        title: title,
        lock: true,
        opacity: 0,
        width: "95%",
        height: 400,
        ok: function () {
            if (callback) {
                var d = this.iframe.contentWindow;
                var lng = $("#lng_input", d.document).val();
                var lat = $("#lat_input", d.document).val();
                var address = {};
                address.address = $("#address_input", d.document).val();
                address.province = $("#province_input", d.document).val();
                address.city = $("#city_input", d.document).val();
                address.district = $("#district_input", d.document).val();
                callback.apply(this, [lng, lat, address]);
            }
        }
    };
    params = options ? $.extend(params, options) : params;
    Wind.use('artDialog', 'iframeTools', function () {
        art.dialog.open(url, params);
    });
}

/**
 * 打开文件上传对话框
 * @param dialog_title 对话框标题
 * @param callback 回调方法，参数有（当前dialog对象，选择的文件数组，你设置的extra_params）
 * @param extra_params 额外参数，object
 * @param multi 是否可以多选
 * @param filetype 文件类型，image,video,audio,file
 * @param app  应用名，CMF的应用名
 * @param openIn 打开窗口
 */
function openUploadDialog(dialog_title, callback, extra_params, multi, filetype, app, openIn) {
    multi = multi ? 1 : 0;
    filetype = filetype ? filetype : 'image';
    app = app ? app : GV.APP;
    var params = '&multi=' + multi + '&filetype=' + filetype + '&app=' + app;

    openIn = openIn ? openIn : window;
    openIn.openIframeLayer(GV.ROOT + 'user/Asset/webuploader?' + params, dialog_title, {
        btn: ['确定'], area: ['600px', '450px'], yes: function (index, layero) {
            if (typeof callback == 'function') {
                // var body = openIn.layer.getChildFrame('body', index);
                //得到iframe页的窗口对象，执行iframe页的方法：iframeWin.method();
                var iframeWin = openIn[layero.find('iframe')[0]['name']];
                var files = iframeWin.get_selected_files();
                console.log(files);
                if (files && files.length > 0) {
                    callback.apply(this, [this, files, extra_params]);
                    openIn.layer.close(index);
                } else {
                    // return false;
                }
            }
        }
    });
}

/**
 * 单个文件上传
 * @param dialog_title 上传对话框标题
 * @param input_selector 图片容器
 * @param filetype 文件类型，image,video,audio,file
 * @param extra_params 额外参数，object
 * @param app  应用名,CMF的应用名
 * @param openIn 打开窗口
 */
function uploadOne(dialog_title, input_selector, filetype, extra_params, app, openIn) {
    filetype = filetype ? filetype : 'file';
    openUploadDialog(dialog_title, function (dialog, files) {
        $(input_selector).val(files[0].filepath);
        $(input_selector + '-preview').attr('href', files[0].preview_url);
        $(input_selector + '-name').val(files[0].name);
        $(input_selector + '-name-text').text(files[0].name);
    }, extra_params, 0, filetype, app, openIn);
}

/**
 * 单个文件上传(在父级窗口打开)
 * @param dialog_title 上传对话框标题
 * @param input_selector 图片容器
 * @param filetype 文件类型，image,video,audio,file
 * @param extra_params 额外参数，object
 * @param app  应用名,CMF的应用名
 */
function parentUploadOne(dialog_title, input_selector, filetype, extra_params, app) {
    uploadOne(dialog_title, input_selector, filetype, extra_params, app, parent);
}

/**
 * 单个图片上传
 * @param dialog_title 上传对话框标题
 * @param input_selector 图片容器
 * @param extra_params 额外参数，object
 * @param app 应用名,CMF的应用名
 * @param openIn 打开窗口
 */
function uploadOneImage(dialog_title, input_selector, extra_params, app, openIn) {
    openUploadDialog(dialog_title, function (dialog, files) {
        $(input_selector).val(files[0].filepath);
        $(input_selector + '-preview').attr('src', files[0].preview_url);
        $(input_selector + '-name').val(files[0].name);
        $(input_selector + '-name-text').text(files[0].name);
    }, extra_params, 0, 'image', app, openIn);
}

/**
 * 单个图片上传(在父级窗口打开)
 * @param dialog_title 上传对话框标题
 * @param input_selector 图片容器
 * @param extra_params 额外参数，object
 * @param app  应用名,CMF的应用名
 */
function parentUploadOneImage(dialog_title, input_selector, extra_params, app) {
    uploadOneImage(dialog_title, input_selector, extra_params, app, parent);
}

/**
 * 多图上传
 * @param dialog_title 上传对话框标题
 * @param container_selector 图片容器
 * @param item_tpl_wrapper_id 单个图片html模板容器id
 * @param extra_params 额外参数，object
 * @param app  应用名,CMF的应用名
 * @param openIn 打开窗口
 */
function uploadMultiImage(dialog_title, container_selector, item_tpl_wrapper_id, extra_params, app, openIn) {
    openUploadDialog(dialog_title, function (dialog, files) {
        var tpl = $('#' + item_tpl_wrapper_id).html();
        var html = '';
        $.each(files, function (i, item) {
            var itemtpl = tpl;
            itemtpl = itemtpl.replace(/\{id\}/g, item.id);
            itemtpl = itemtpl.replace(/\{url\}/g, item.url);
            itemtpl = itemtpl.replace(/\{preview_url\}/g, item.preview_url);
            itemtpl = itemtpl.replace(/\{filepath\}/g, item.filepath);
            itemtpl = itemtpl.replace(/\{name\}/g, item.name);
            html += itemtpl;
        });
        $(container_selector).append(html);

    }, extra_params, 1, 'image', app, openIn);
}

/**
 * 多图上传(在父级窗口打开)
 * @param dialog_title 上传对话框标题
 * @param container_selector 图片容器
 * @param item_tpl_wrapper_id 单个图片html模板容器id
 * @param extra_params 额外参数，object
 * @param app  应用名,CMF的应用名
 */
function parentUploadMultiImage(dialog_title, container_selector, item_tpl_wrapper_id, extra_params, app) {
    uploadMultiImage(dialog_title, container_selector, item_tpl_wrapper_id, extra_params, app, parent)
}

/**
 * 多文件上传
 * @param dialog_title 上传对话框标题
 * @param container_selector 图片容器
 * @param item_tpl_wrapper_id 单个图片html模板容器id
 * @param filetype 文件类型，image,video,audio,file
 * @param extra_params 额外参数，object
 * @param app  应用名,CMF 的应用名
 * @param openIn 打开窗口
 */
function uploadMultiFile(dialog_title, container_selector, item_tpl_wrapper_id, filetype, extra_params, app, openIn) {
    filetype = filetype ? filetype : 'file';
    openUploadDialog(dialog_title, function (dialog, files) {
        var tpl = $('#' + item_tpl_wrapper_id).html();
        var html = '';
        $.each(files, function (i, item) {
            var itemtpl = tpl;
            itemtpl = itemtpl.replace(/\{id\}/g, item.id);
            itemtpl = itemtpl.replace(/\{url\}/g, item.url);
            itemtpl = itemtpl.replace(/\{preview_url\}/g, item.preview_url);
            itemtpl = itemtpl.replace(/\{filepath\}/g, item.filepath);
            itemtpl = itemtpl.replace(/\{name\}/g, item.name);
            html += itemtpl;
        });
        $(container_selector).append(html);

    }, extra_params, 1, filetype, app, openIn);
}

/**
 * 多文件上传
 * @param dialog_title 上传对话框标题
 * @param container_selector 图片容器
 * @param item_tpl_wrapper_id 单个图片html模板容器id
 * @param filetype 文件类型，image,video,audio,file
 * @param extra_params 额外参数，object
 * @param app  应用名,CMF 的应用名
 */
function parentUploadMultiFile(dialog_title, container_selector, item_tpl_wrapper_id, filetype, extra_params, app, openIn) {
    uploadMultiFile(dialog_title, container_selector, item_tpl_wrapper_id, filetype, extra_params, app, parent)
}

/**
 * 查看图片对话框
 * @param img 图片地址
 */
function imagePreviewDialog(img, options) {
    Wind.css('layer');
    var params = {
        photos: {
            "title": "", //相册标题
            "id": 'image_preview', //相册id
            "start": 0, //初始显示的图片序号，默认0
            "data": [   //相册包含的图片，数组格式
                {
                    "alt": "",
                    "pid": 666, //图片id
                    "src": img, //原图地址
                    "thumb": img //缩略图地址
                }
            ]
        } //格式见API文档手册页
        , anim: 5, //0-6的选择，指定弹出图片动画类型，默认随机
        shadeClose: true,
        // skin: 'layui-layer-nobg',
        shade: [0.5, '#000000'],
        shadeClose: true,
    };
    params = options ? $.extend(params, options) : params;
    Wind.use("layer", function () {
        layer.photos(params)
    });
}

function artdialogAlert(msg) {
    Wind.css('artDialog');
    Wind.use("artDialog", function () {
        art.dialog({
            id: new Date().getTime(),
            icon: "error",
            fixed: true,
            lock: true,
            background: "#CCCCCC",
            opacity: 0,
            content: msg,
            ok: function () {
                return true;
            }
        });
    });

}

function openIframeLayer(url, title, options) {

    if (GV.IS_MOBILE) {
        if (!options) {
            options = {};
        }
        options.area = ['100%', '100%'];
        options.offset = ['0px', '0px'];
    }

    var params = {
        type: 2,
        title: title,
        shadeClose: true,
        // skin: 'layui-layer-nobg',
        anim: -1,
        shade: [0.001, '#000000'],
        shadeClose: true,
        area: GV.IS_MOBILE ? ['100%', '100%'] : ['95%', '95%'],
        offset: GV.IS_MOBILE ? ['0px', '0px'] : 'auto',
        move: false,
        content: url,
        yes: function (index, layero) {
            //do something
            layer.close(index); //如果设定了yes回调，需进行手工关闭
        }
    };
    params = options ? $.extend(params, options) : params;

    Wind.css('layer');

    Wind.use("layer", function () {
        layer.open(params);
    });

}

/**
 * 打开文件上传对话框
 * @param dialog_title 对话框标题
 * @param callback 回调方法，参数有（当前dialog对象，选择的文件数组，你设置的extra_params）
 * @param extra_params 额外参数，object
 * @param multi 是否可以多选
 * @param filetype 文件类型，image,video,audio,file
 * @param app  应用名，CMF的应用名
 * @param openIn 打开窗口
 */
function openUploadPrivateDialog(dialog_title, callback, extra_params, multi, filetype, app, openIn) {
    multi = multi ? 1 : 0;
    filetype = filetype ? filetype : 'image';
    app = app ? app : GV.APP;
    var params = '&multi=' + multi + '&filetype=' + filetype + '&app=' + app;

    openIn = openIn ? openIn : window;
    openIn.openIframeLayer(GV.ROOT + 'user/Asset/upload?' + params, dialog_title, {
        btn: ['确定'], area: ['600px', '450px'], yes: function (index, layero) {
            if (typeof callback == 'function') {
                // var body = openIn.layer.getChildFrame('body', index);
                //得到iframe页的窗口对象，执行iframe页的方法：iframeWin.method();
                var iframeWin = openIn[layero.find('iframe')[0]['name']];
                var files = iframeWin.get_selected_files();
                console.log(files);
                if (files && files.length > 0) {
                    callback.apply(this, [this, files, extra_params]);
                    openIn.layer.close(index);
                } else {
                    // return false;
                }
            }
        }
    });
}

/**
 * 单个文件上传
 * @param dialog_title 上传对话框标题
 * @param input_selector 图片容器
 * @param filetype 文件类型，image,video,audio,file
 * @param extra_params 额外参数，object
 * @param app  应用名,CMF的应用名
 * @param openIn 打开窗口
 */
function uploadPrivateOne(dialog_title, input_selector, filetype, extra_params, app, openIn) {
    filetype = filetype ? filetype : 'file';
    openUploadPrivateDialog(dialog_title, function (dialog, files) {
        $(input_selector).val(files[0].filepath);
        $(input_selector + '-preview').attr('href', files[0].preview_url);
        $(input_selector + '-name').val(files[0].name);
        $(input_selector + '-name-text').text(files[0].name);
    }, extra_params, 0, filetype, app, openIn);
}

/**
 * 单个文件上传(在父级窗口打开)
 * @param dialog_title 上传对话框标题
 * @param input_selector 图片容器
 * @param filetype 文件类型，image,video,audio,file
 * @param extra_params 额外参数，object
 * @param app  应用名,CMF的应用名
 */
function parentUploadPrivateOne(dialog_title, input_selector, filetype, extra_params, app) {
    uploadPrivateOne(dialog_title, input_selector, filetype, extra_params, app, parent);
}

/**
 * 多文件上传
 * @param dialog_title 上传对话框标题
 * @param container_selector 图片容器
 * @param item_tpl_wrapper_id 单个图片html模板容器id
 * @param filetype 文件类型，image,video,audio,file
 * @param extra_params 额外参数，object
 * @param app  应用名,CMF 的应用名
 * @param openIn 打开窗口
 */
function uploadPrivateMultiFile(dialog_title, container_selector, item_tpl_wrapper_id, filetype, extra_params, app, openIn) {
    filetype = filetype ? filetype : 'file';
    openUploadPrivateDialog(dialog_title, function (dialog, files) {
        var tpl = $('#' + item_tpl_wrapper_id).html();
        var html = '';
        $.each(files, function (i, item) {
            var itemtpl = tpl;
            itemtpl = itemtpl.replace(/\{id\}/g, item.id);
            itemtpl = itemtpl.replace(/\{url\}/g, item.url);
            itemtpl = itemtpl.replace(/\{preview_url\}/g, item.preview_url);
            itemtpl = itemtpl.replace(/\{filepath\}/g, item.filepath);
            itemtpl = itemtpl.replace(/\{name\}/g, item.name);
            html += itemtpl;
        });
        $(container_selector).append(html);

    }, extra_params, 1, filetype, app, openIn);
}

/**
 * 多文件上传
 * @param dialog_title 上传对话框标题
 * @param container_selector 图片容器
 * @param item_tpl_wrapper_id 单个图片html模板容器id
 * @param filetype 文件类型，image,video,audio,file
 * @param extra_params 额外参数，object
 * @param app  应用名,CMF 的应用名
 */
function parentUploadPrivateMultiFile(dialog_title, container_selector, item_tpl_wrapper_id, filetype, extra_params, app, openIn) {
    uploadPrivateMultiFile(dialog_title, container_selector, item_tpl_wrapper_id, filetype, extra_params, app, parent)
}
