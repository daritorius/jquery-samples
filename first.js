Project = window.Project || {};
Project.corporate = Project.corporate || {};

Project.corporate.index = {

    checkAdminInterval: null,

    init: function() {
        this.initCheckAllData();
        this.initActivateLeftMenu();
    },

    initCheckAllData: function() {
        var self = this;
        Project.corporate.popup.initPermanentShowPopup();
        self.checkAdminInterval = setInterval(function() {
            if (Object.keys(Project.corporate.api.adminData).length) {
                Project.corporate.popup.initPermanentClose();
                clearInterval(self.checkAdminInterval);
                self.checkAdminInterval = null;
            }
        }, 1000);
    },

    parseLeftMenu: function(element) {
        var menu = element.data('menu'), response;
        switch (menu) {
            case 'help':
                response = Project.corporate.templates.getHelpMenu();
                break;
            case 'settings':
                response = Project.corporate.templates.getSettingsMenu();
                break;
            case 'analytics':
                response = Project.corporate.templates.getActivityMenu();
                break;
            case 'promo':
                response = Project.corporate.templates.getHelpMenu();
                break;
            case 'employees':
                response = Project.corporate.templates.getEmployeesBase();
                break;
            default:
                break;
        }
        return response;
    },

    initLoadSettingsMenu: function() {
        var self = this, content, menuChoices = $('#header .settings-header-menu'),
            menuChoicesActive = $('#header .settings-header-menu li.active'),
            rightBlockMain = $('.right-block-main-content'), dashboardRightPanel = $('#dashboard-right-panel');
        switch (menuChoicesActive.html()) {
            case 'Billing':
                rightBlockMain.remove();
                content = Project.corporate.templates.getBillingMenu();
                dashboardRightPanel.append(content);
                self.initCloseNotification();
                self.initAddCreditCard();
                self.initDeleteCard();
                self.initChangeCard();
                break;
            case 'Account':
                rightBlockMain.remove();
                content = Project.corporate.templates.getAccountMenu();
                dashboardRightPanel.append(content);
                self.initUpdateAccountSettings();
                break;
            default:
                rightBlockMain.remove();
                break;
        }

        menuChoices.off().on('click', 'li', function(e) {
            e.preventDefault();
            menuChoicesActive.removeClass('active');
            $(this).addClass('active');
            self.initLoadSettingsMenu();
        });
    },

    initActivateLeftMenu: function() {
        var self = this, content, activeLeftMenu = $('#dashboard-left-panel .sub-menu li.active'),
            settingsLeftMenu = $('#dashboard-left-panel .sub-menu li[data-menu="settings"]');

        if (!Object.keys(Project.corporate.api.accountPaymentData).length) {
            activeLeftMenu.removeClass('active');
            settingsLeftMenu.addClass('active');
        }
        if ($('#dashboard-left-panel .sub-menu li.active').length) {
            content = self.parseLeftMenu($('#dashboard-left-panel .sub-menu li.active'));
            $('#dashboard-right-panel').html(content);
            self.initProcessActions($('#dashboard-left-panel .sub-menu li.active'));
            self.initCloseNotification();
        }
        $('#dashboard-left-panel .sub-menu').off().on('click', 'li', function(e) {
            e.preventDefault();
            if ($(this).data('menu') === 'employees' && !Object.keys(Project.corporate.api.accountPaymentData).length) {
                content = Project.corporate.templates.getPopupAddPaymentCardPopup();
                Project.corporate.popup.popupBlock.css({"width": "510px"}).html(content);
                Project.corporate.popup.initShowPopup();
                $('#popup-block .payment-actions #agree-add-payment-card-button').off().on('click', function(e) {
                    e.preventDefault();
                    $('#dashboard-left-panel .sub-menu li.active').removeClass('active');
                    $('#dashboard-left-panel .sub-menu li[data-menu="settings"]').addClass('active');
                    Project.corporate.popup.close();
                    self.initActivateLeftMenu();
                });
                return false;
            }
            $('#dashboard-left-panel .sub-menu li.active').removeClass('active');
            $(this).addClass('active');
            $('#dashboard-right-panel').html(self.parseLeftMenu($(this)));
            self.initProcessActions($(this));
            self.initCloseNotification();
        });
    },

    initProcessActions: function(element) {
        var self = this, menu = element.data('menu');
        switch (menu) {
            case 'help':
                break;
            case 'settings':
                self.initLoadSettingsMenu();
                break;
            case 'analytics':
                Project.corporate.activity.initStartActivity();
                break;
            case 'promo':
                break;
            case 'employees':
                Project.corporate.employee.initLoadEmployees();
                break;
            default:
                break;
        }
    },

    initCloseNotification: function() {
        $('.help-notice-block').off().on('click', '.close-button', function(e) {
            e.preventDefault();
            $(this).parent().remove();
        });
    },

    initAddCreditCard: function() {
        var errors, data, cardNumberInput = $('#id_card_number'), cardDateInput = $('#id_card_date'),
            cardCvvInput = $('#id_card_cvv'), cardHolderInput = $('#id_card_name'), cardZipInput = $('#id_card_zip');
        cardNumberInput.mask("9999 9999 9999 9?999", {placeholder: ""});
        cardDateInput.mask("99 / 99", {placeholder: ""});
        cardCvvInput.mask("999?9", {placeholder: ""});
        cardZipInput.mask("99999", {placeholder: ""});
        $('#dashboard-right-panel .right-block-main-content .form-submit-block #id_billing_form_submit').off().on('click', function(e) {
            e.preventDefault();
            data = {};
            Project.corporate.api.addAccountCard(data);
        });
    },

    initUpdateAccountSettings: function() {
        var self = this, data = {}, passwordInput = $('#id_admin_password'), passwordConfirmInput = $('#id_admin_confirm_password');
        $('#id_admin_phone').mask("?(999) 999-9999", {placeholder: " "});
        $('#dashboard-right-panel .right-block-main-content .form-submit-block #id_admin_form_submit').off().on('click', function(e) {
            e.preventDefault();
            passwordInput.removeClass('error');
            passwordConfirmInput.removeClass('error');
            $('.help-notice-block.error').remove();
            $('.help-notice-block.success').remove();
            $('.right-block-main-content .form-block-item-input input').removeClass('error');
            data = {
                "email": $('#id_admin_email').val(),
                "first_name": $('#id_admin_first_name').val(),
                "last_name": $('#id_admin_last_name').val(),
                "company_title": $('#id_admin_company_title').val(),
                "phone": '+1' + $('#id_admin_phone').val()
            };
            if (passwordInput.val().length > 0) {
                if (passwordInput.val() !== passwordConfirmInput.val()) {
                    passwordInput.addClass('error');
                    passwordConfirmInput.addClass('error');
                    var content = Project.corporate.templates._getErrorNoticeBlock(["Passwords don't match."]);
                    $('.right-block-main-content').prepend(content);
                    self.initCloseNotification();
                    return false;
                } else {
                    data['password'] = passwordInput.val();
                    data['confirm_password'] = passwordConfirmInput.val();
                }
            }
            Project.corporate.api.updateAdminData(data);
        });
    },

    initDeleteCard: function() {
        var self = this, content;
        $('.right-block-main-content .card-item-block .close-button').off().on('click', function(e) {
            e.preventDefault();
            content = Project.corporate.templates.getPopupContentPayment(
                Project.corporate.templates.paymentPopupDeleteCardTitle,
                Project.corporate.templates.paymentPopupDeleteCardText,
                Project.corporate.templates.paymentPopupDeleteCardActionText);
            Project.corporate.popup.popupBlock.css({"width": "510px"}).html(content);
            Project.corporate.popup.initShowPopup();
            $('#popup-block .payment-actions #agree-change-payment-button').off().on('click', function(e) {
                e.preventDefault();
                Project.corporate.api.deleteCorporateCard();
            });
        });
    },

    initChangeCard: function() {
        var self = this, content, rightBlockMain = $('.right-block-main-content'), dashboardRightPanel = $('#dashboard-right-panel');
        $('.right-block-main-content #id_change_payment_method').off().on('click', function(e) {
            e.preventDefault();
            content = Project.corporate.templates.getPopupContentPayment(
                Project.corporate.templates.paymentPopupChangeCardTitle,
                Project.corporate.templates.paymentPopupChangeCardText,
                Project.corporate.templates.paymentPopupChangeCardActionText);
            Project.corporate.popup.popupBlock.css({"width": "510px"}).html(content);
            Project.corporate.popup.initShowPopup();
            $('#popup-block .payment-actions #agree-change-payment-button').off().on('click', function(e) {
                e.preventDefault();
                rightBlockMain.remove();
                content = Project.corporate.templates._getAddCardBlock();
                dashboardRightPanel.append(content);
                self.initCloseNotification();
                self.initAddCreditCard();
                Project.corporate.popup.close();
            });
        });
    }
};

$(function () {
    Project.corporate.index.init();
});

