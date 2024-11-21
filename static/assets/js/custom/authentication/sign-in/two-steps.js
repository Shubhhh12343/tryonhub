"use strict";

// Class Definition
var KTSigninTwoSteps = function() {
    // Elements
    var form;
    var submitButton;

    // Handle form
    var handleForm = function(e) {        
        // Handle form submit
        submitButton.addEventListener('click', function (e) {
            e.preventDefault();

            var validated = true;

            var inputs = [].slice.call(form.querySelectorAll('input[maxlength="1"]'));
            inputs.map(function (input) {
                if (input.value === '' || input.value.length === 0) {
                    validated = false;
                }
            });

            if (validated === true) {
                var code1 = form.querySelector('[name="code_1"]').value
                var code2 = form.querySelector('[name="code_2"]').value
                var code3 = form.querySelector('[name="code_3"]').value
                var code4 = form.querySelector('[name="code_4"]').value

                console.log(code1,code2,code3,"email")
                $.ajax({
                    method:"POST",
                    url:"/check-otp/",
                    data:{
                        csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
                        code1:code1,
                        code2:code2,
                        code3:code3,
                        code4:code4,
                    },
                    success: function(response){
                        if (response.status == 200){

                            submitButton.setAttribute('data-kt-indicator', 'on');
            
                            // Disable button to avoid multiple click 
                            submitButton.disabled = true;
            
                            // Simulate ajax request
                            setTimeout(function() {
                                // Hide loading indication
                                submitButton.removeAttribute('data-kt-indicator');
            
                                // Enable button
                                submitButton.disabled = false;
            
                                // Show message popup. For more info check the plugin's official documentation: https://sweetalert2.github.io/
                                form.submit();
                            }, 1000);
                        }else if(response.status == 400){
                            const passwordError = document.getElementById("password-error");
                            passwordError.innerHTML = `
                                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                                Invalid OTP Entered!
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                </div>
                            `;
                            setTimeout(() => {
                                passwordError.innerHTML = "";
                            }, 3000);
                        }
                    }
                });
                // Show loading indication
            } else {
                const passwordError = document.getElementById("password-error");
                passwordError.innerHTML = `
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    Please enter OTP!
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `;
                setTimeout(() => {
                    passwordError.innerHTML = "";
                }, 3000);
            }
        });
    }

    var handleType = function() {
        var input1 = form.querySelector("[name=code_1]");
        var input2 = form.querySelector("[name=code_2]");
        var input3 = form.querySelector("[name=code_3]");
        var input4 = form.querySelector("[name=code_4]");

        input1.focus();

        input1.addEventListener("keyup", function() {
            if (this.value.length === 1) {
                input2.focus();
            }
        });

        input2.addEventListener("keyup", function() {
            if (this.value.length === 1) {
                input3.focus();
            }
        });

        input3.addEventListener("keyup", function() {
            if (this.value.length === 1) {
                input4.focus();
            }
        });

        input4.addEventListener("keyup", function() {
            if (this.value.length === 1) {
                input5.focus();
            }
        });
    }    

    // Public functions
    return {
        // Initialization
        init: function() {
            form = document.querySelector('#kt_sing_in_two_steps_form');
            submitButton = document.querySelector('#kt_sing_in_two_steps_submit');

            handleForm();
            handleType();
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function() {
    KTSigninTwoSteps.init();
});