"use strict";

// Class definition
var KTAppCalendar = function () {
    // Shared variables
    // Calendar variables
    var calendar;
    var worker;
    var clickedEventInfo = null;


    var data = {
        id: '',
        eventName: '',
        eventDescription: '',
        eventLocation: '',
        eventStatus:'',
        eventDedicatedHours:'',
        startDate: '',
        endDate: '',
        projectname:'',
        project_spoc:'',
        company_name:'',
        allDay: false,
        status : ''
    };

    // Add event variables
    var eventName;
    var eventDescription;
    var eventLocation;
    var startDatepicker;
    var startFlatpickr;
    var endDatepicker;
    var endFlatpickr;
    // var startTimepicker;
    var startTimeFlatpickr;
    var endTimepicker
    var endTimeFlatpickr;
    var modal;
    var modalTitle;
    var form;
    var validator;
    var addButton;
    var submitButton;
    var cancelButton;
    var closeButton;

    // View event variables
    var viewEventName;
    var viewAllDay;
    var viewEventDescription;
    var viewEventLocation;
    var viewProjectManager;
    var viewCompanyName;
    var viewProjectName;
    var viewstatus;
    var viewStartDate;
    var viewEndDate;
    var viewModal;
    var viewEditButton;
    var viewDeleteButton;


    // Private functions
    var initCalendarApp = function () {
        // Define variables
        var calendarEl = document.getElementById('kt_calendar_app');
        var todayDate = moment().startOf('day');
        var YM = todayDate.format('YYYY-MM');
        var YESTERDAY = todayDate.clone().subtract(1, 'day').format('YYYY-MM-DD');
        var TODAY = todayDate.format('YYYY-MM-DD');
        var TOMORROW = todayDate.clone().add(1, 'day').format('YYYY-MM-DD');

        // Init calendar --- more info: https://fullcalendar.io/docs/initialize-globals
        calendar = new FullCalendar.Calendar(calendarEl, {
            //locale: 'es', // Set local --- more info: https://fullcalendar.io/docs/locale
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            initialDate: TODAY,
            navLinks: true, // can click day/week names to navigate views
            selectable: true,
            selectMirror: true,
            editable: true,
            dayMaxEvents: true,

            // Select dates action --- more info: https://fullcalendar.io/docs/select-callback
            select: function (arg) {
                formatArgs(arg);
                handleNewEvent();
            },

            // Click event --- more info: https://fullcalendar.io/docs/eventClick
            eventClick: function (arg) {
                formatArgs({
                    id: arg.event.id,
                    title: arg.event.title,
                    description: arg.event.extendedProps.description,
                    location: arg.event.extendedProps.location,
                    status: arg.event.extendedProps.status,
                    dedicatedhours: arg.event.extendedProps.dedicatedhours,
                    project_spoc:arg.event.extendedProps.project_spoc,
                    project_name:arg.event.extendedProps.project_name,
                    company_name:arg.event.extendedProps.company_name,
                    startStr: arg.event.startStr,
                    endStr: arg.event.endStr,
                    allDay: arg.event.status
                });
                
                handleViewEvent();
            },

            editable: true,
            dayMaxEvents: true, // allow "more" link when too many events
            events: function (fetchInfo, successCallback, failureCallback) {
                var currentMonth = moment(fetchInfo.start).add(15, 'days').format('YYYY-MM');
                console.log(currentMonth,"cur mon")
                $.ajax({
                    url: '/display-calender-task/',
                    type: 'GET',
                    data: {
                        month: currentMonth // Append the current month to the GET request
                    },
                    success: function (response) {
                        console.log(response,"respon")
                          var events = [];
                
                          // Convert the API response to the format expected by FullCalendar
                          for(let i = 0; i<response.status.length;i++) {
                            let assignedUsers = response.status[i].assign_to.split(','); // Assuming assign_to is a comma-separated string of user IDs or names
                    let isSingleUser = assignedUsers.length === 1;
                            events.push({
                              id: uid(),
                              title: response.status[i].title,
                              start: response.status[i].start,
                              end: response.status[i].end,
                              description: response.status[i].assign_to,
                              status: response.status[i].status,
                              dedicatedhours: response.status[i].dedicated_hours,
                              project_name:response.status[i].project_name,
                              project_spoc:response.status[i].project_spoc,
                              company_name:response.status[i].company_name,
                              className: "fc-event-danger fc-event-solid-warning",
                              isSingleUser: isSingleUser,

                              extendedProps: {
                                subtaskId: response.status[i].id,
                                assignedUsers: assignedUsers.length // Store the number of assigned users

                            }
                            });
                          };
                
                          // Call the successCallback with the events array to update the calendar
                          successCallback(events);
                        },
                        error: function (error) {
                            failureCallback(error.responseJSON.message);
                        }
                    });
                }
            });

            calendar.render();

            calendar.on('eventClick', function (info) {
                clickedEventInfo = info; // Store the clicked event info globally

                var subtaskId = info.event.extendedProps.subtaskId; // Get the subtask ID from extendedProps
                console.log("subtaskId:", subtaskId);
            
                // Assign the subtask ID to the edit button
                $('#kt_modal_view_event_edit').data('task-id', subtaskId);
            
                var assignedUsersCount = info.event.extendedProps.assignedUsers;
                if (assignedUsersCount > 1) {
                    $('#kt_modal_view_event_edit').hide();
                    $('#kt_modal_view_event_delete').hide();
                } else {
                    $('#kt_modal_view_event_edit').show();
                    $('#kt_modal_view_event_delete').show();
                }
            });
    }
     // Helper function to fetch events directly if worker is not supported or in case of worker creation error
     var fetchEventsDirectly = function (response, successCallback) {
        var events = response.status.map(function (event) {
            return {
                id: event.id,
                title: event.title,
                start: event.start,
                end: event.end,
                description: event.assign_to,
                status: event.status,
                dedicatedhours: event.dedicated_hours,
                project_name: event.project_name,
                project_spoc: event.project_spoc,
                company_name: event.company_name,
                className: "fc-event-danger fc-event-solid-warning",
                extendedProps: {
                    subtaskId: event.id
                }
            };
        });

        successCallback(events);
    };

    
      $("#applyButton").click(function (e) {
          // Prevent the default form submission
          e.preventDefault();
          var selectedValues = [];
          
          var project = document.getElementById("get_project").value;
          
          var users = document.getElementById("get_users");
          //var selectElement = document.getElementById("exampleMultipleSelect");
          if  (users){
              for (var i = 0; i < users.selectedOptions.length; i++) {
                  selectedValues.push(users.selectedOptions[i].value);
                }

          }
            
            // Your AJAX post request to load filtered tasks
          console.log("clicked")
          $.ajax({
              url: "/filter-and-load-tasks/", // Replace with your server-side endpoint
              method: "POST",
              data: {
                  // Include any data you want to send with the request
                  csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
                  project: project,
                  users: selectedValues,
              },
              success: function (response) {
                console.log(response,"new")
                  // Clear existing events on the calendar
                  if(response.message === "success"){

                      calendar.removeAllEvents();
      
                      // Convert the API response to the format expected by FullCalendar
                      var events = [];
                      for (let i = 0; i < response.status.length; i++) {
                          events.push({
                              id: uid(),
                              title: response.status[i].title,
                              end: response.status[i].end,
                              start: response.status[i].start,
                              description: response.status[i].assign_to,
                              status: response.status[i].status,
                              dedicatedhours: response.status[i].dedicated_hours,
                              project_name: response.status[i].project_name,
                              project_spoc: response.status[i].project_spoc,
                              company_name: response.status[i].company_name,
                              className: "fc-event-danger fc-event-solid-warning",
                          });
                      }
      
                      // Add the new events to the calendar
                      calendar.addEventSource(events);
                      
                      // Render the updated calendar
                      calendar.render();
                  }else{
                      toastr.options = {
                          "closeButton": false,
                          "debug": false,
                          "newestOnTop": false,
                          "progressBar": false,
                          "positionClass": "toastr-top-right",
                          "preventDuplicates": false,
                          "onclick": null,
                          "showDuration": "300",
                          "hideDuration": "1000",
                          "timeOut": "5000",
                          "extendedTimeOut": "1000",
                          "showEasing": "swing",
                          "hideEasing": "linear",
                          "showMethod": "fadeIn",
                          "hideMethod": "fadeOut"
                        };
                        
                        toastr.error(response.message);
                      
                  }

              },
              error: function (xhr, status, error) {
                  // Handle errors here
                  console.error("Error:", error);
              }
          });
      });
        

    // Init validator
    const initValidator = () => {
        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'project_id': {
                        validators: {
                            notEmpty: {
                                message: 'Project is required'
                            }
                        }
                    },
                    'milestone_name': {
                        validators: {
                            notEmpty: {
                                message: 'Milestone is required'
                            }
                        }
                    },
                    'calendar_event_description': {
                        validators: {
                            notEmpty: {
                                message: 'Task title is required'
                            }
                        }
                    },
                    
                    'calendar_event_start_date': {
                        validators: {
                            notEmpty: {
                                message: 'Date Range is required'
                            }
                        }
                    }
                },

                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: '.fv-row',
                        eleInvalidClass: '',
                        eleValidClass: ''
                    })
                }
            }
        );
        
       // Handle submit button click to validate and show errors
       const submitButton = document.querySelector('#kt_modal_add_event_submit');
       if (submitButton) {
           submitButton.addEventListener('click', function (e) {
               e.preventDefault();
               
               validator.validate().then(function (status) {
                   if (status === 'Valid') {
                       form.submit();
                   } else {
                       // Manage error messages
                       const errorMessages = document.querySelectorAll('.fv-plugins-message-container.invalid-feedback');
                       let taskTitleErrorShown = false;
                       
                       errorMessages.forEach((msgContainer) => {
                           const errorText = msgContainer.innerText.trim();
                           if (errorText === 'Task title is required') {
                               if (taskTitleErrorShown) {
                                   msgContainer.style.display = 'none'; // Hide duplicates
                               } else {
                                   msgContainer.style.display = 'block'; // Show the first one
                                   taskTitleErrorShown = true;
                               }
                           } else {
                               msgContainer.style.display = 'block'; // Show other error messages
                           }
                       });
                   }
               });
           });
       }
   
       // Handle input events to revalidate and manage error messages
       const taskTitleInput = form.querySelector('input[name="calendar_event_description"]');
       if (taskTitleInput) {
           taskTitleInput.addEventListener('input', function () {
               validator.revalidateField('calendar_event_description');
               
               // Reset the error display on input
               const errorMessages = document.querySelectorAll('.fv-plugins-message-container.invalid-feedback');
               errorMessages.forEach((msgContainer) => {
                   const errorText = msgContainer.innerText.trim();
                   if (errorText === 'Task title is required') {
                       msgContainer.style.display = 'none'; // Hide the error message
                   }
               });
           });
       }
   };
   document.addEventListener('DOMContentLoaded', function () {
    initValidator();
});

    // Initialize datepickers --- more info: https://flatpickr.js.org/
    const initDatepickers = () => {
        startFlatpickr = flatpickr(startDatepicker, {
            enableTime: true,
            dateFormat: "d-m-Y h:i K",
            altInput: true,
            altFormat: "d-m-Y h:i K",
            mode: "range"
        });

        // endFlatpickr = flatpickr(endDatepicker, {
        //     enableTime: false,
        //     dateFormat: "Y-m-d",
        // });

        // startTimeFlatpickr = flatpickr(startTimepicker, {
        //     enableTime: true,
        //     noCalendar: true,
        //     dateFormat: "H:i",
        // });

        // endTimeFlatpickr = flatpickr(endTimepicker, {
        //     enableTime: true,
        //     noCalendar: true,
        //     dateFormat: "H:i",
        // });
    }

    // Handle add button
    const handleAddButton = () => {
        addButton.addEventListener('click', e => {
            // Reset form data
            data = {
                id: '',
                eventName: '',
                eventDescription: '',
                startDate: new Date(),
                endDate: new Date(),
                allDay: false
            };
            handleNewEvent();
        });
    }

    // Handle add new event
    const handleNewEvent = () => {
        // Update modal title
        modalTitle.innerText = "Add Task";

        modal.show();

        // Select datepicker wrapper elements
        const datepickerWrappers = form.querySelectorAll('[data-kt-calendar="datepicker"]');

        // Handle all day toggle
        // const allDayToggle = form.querySelector('#kt_calendar_datepicker_allday');
        // allDayToggle.addEventListener('click', e => {
        //     if (e.target.checked) {
        //         datepickerWrappers.forEach(dw => {
        //             dw.classList.remove('d-none');
        //         });
        //     } else {
        //         endFlatpickr.setDate(data.startDate, true, 'Y-m-d');
        //         datepickerWrappers.forEach(dw => {
        //             dw.classList.remove('d-none');
        //         });
        //     }
        // });

        populateForm(data);

        // Handle submit form
        submitButton.addEventListener('click', function (e) {
            // Prevent default button action
            e.preventDefault();

            // Validate form before submit
            if (validator) {
                validator.validate().then(function (status) {
                    console.log('validated!');
                    console.log('Form validation status:', status);


                    if (status == 'Valid') {
                        // Show loading indication
                        submitButton.setAttribute('data-kt-indicator', 'on');

                        // Disable submit button whilst loading
                        submitButton.disabled = true;

                        // Simulate form submission
                        setTimeout(function () {
                            // Simulate form submission
                            submitButton.removeAttribute('data-kt-indicator');

                       

                            form.submit(); // Submit form
                        }, 2000);
                    }
                     
                    
                });
            }
        });
    }

    // Handle edit event
    const handleEditEvent = () => {
        // Update modal title
        modalTitle.innerText = "Edit Task";

        modal.show();

        // Select datepicker wrapper elements
        const datepickerWrappers = form.querySelectorAll('[data-kt-calendar="datepicker"]');

        // Handle all day toggle
        const allDayToggle = form.querySelector('#kt_calendar_datepicker_allday');
        allDayToggle.addEventListener('click', e => {
            if (e.target.checked) {
                datepickerWrappers.forEach(dw => {
                    dw.classList.remove('d-none');
                });
            } else {
                endFlatpickr.setDate(data.startDate, true, 'Y-m-d');
                datepickerWrappers.forEach(dw => {
                    dw.classList.remove('d-none');
                });
            }
        });

        populateForm(data);

        // Handle submit form
        submitButton.addEventListener('click', function (e) {
            // Prevent default button action
            e.preventDefault();

            // Validate form before submit
            if (validator) {
                validator.validate().then(function (status) {
                    console.log('validated!');
                    console.log('Form validation status:', status);

                    if (status == 'Valid') {
                        // Show loading indication
                        submitButton.setAttribute('data-kt-indicator', 'on');

                        // Disable submit button whilst loading
                        submitButton.disabled = true;

                        // Simulate form submission
                        setTimeout(function () {
                            // Simulate form submission
                            submitButton.removeAttribute('data-kt-indicator');

                            // Show popup confirmation 
                           

                            form.submit(); // Submit form
                        }, 2000);
                    } 
                });
            }
        });
    }
    function updateBadgeStatus(status) {
        var badgeElement = document.querySelector('[data-kt-calendar="status"]');
        badgeElement.classList.remove('badge-light-success', 'badge-light-warning', 'badge-light-primary');
    
        switch (status) {
            case 'Completed':
                badgeElement.classList.add('badge-light-success');
                badgeElement.textContent = 'Completed';
                break;
            case 'Not Started':
                badgeElement.classList.add('badge-light-warning');
                badgeElement.textContent = 'Not Started';
                break;
            case 'In-Process':
                badgeElement.classList.add('badge-light-primary');
                badgeElement.textContent = 'In-Process';
                break;
            default:
                badgeElement.textContent = 'Unknown Status';
                break;
        }
    }
    // Handle view event
    const handleViewEvent = () => {
        viewModal.show();

        // Detect all day event
        var eventNameMod;
        var startDateMod;
        var endDateMod;

        // Generate labels
        if (data.allDay) {
            eventNameMod = 'All Day';
            startDateMod = moment(data.startDate).format('Do MMM, YYYY');
            endDateMod = moment(data.endDate).format('Do MMM, YYYY');
        } else {
            eventNameMod = '';
            startDateMod = moment(data.startDate).format('Do MMM, YYYY - h:mm a');
            endDateMod = moment(data.endDate).format('Do MMM, YYYY - h:mm a');
        }

        // Populate view data
        viewEventName.innerText = data.eventName;
        // viewAllDay.innerText = data.status;
        viewEventDescription.innerText = data.eventDescription ? data.eventDescription : '--';
        viewProjectManager.innerText = data.project_spoc;
        viewProjectName.innerText = data.projectname;
        viewstatus.innerText = data.status;
        viewCompanyName.innerText = data.company_name;
        viewStartDate.innerText = startDateMod;
        // viewStatus.innerText = data.eventStatus;
        // viewDedicatedHours.innerText = data.eventDedicatedHours
        viewEndDate.innerText = endDateMod;
        updateBadgeStatus(data.status);
    }

    const handleDeleteEvent = () => {
        const viewDeleteButton = document.getElementById('kt_modal_view_event_delete');
        
        viewDeleteButton.addEventListener('click', e => {
            e.preventDefault();
    
            if (!clickedEventInfo) {
                console.error('Event info not found');
                return;
            }
            var csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();

    
            let subtaskId = clickedEventInfo.event.extendedProps.subtaskId;
            console.log("subtaskId:", subtaskId);
    
            Swal.fire({
                text: "Are you sure you would like to delete this Task?",
                icon: "warning",
                showCancelButton: true,
                buttonsStyling: false,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, return",
                customClass: {
                    confirmButton: "btn btn-primary",
                    cancelButton: "btn btn-active-light"
                }
            }).then(function (result) {
                if (result.value) {
                    fetch('/delete_subtask/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrftoken
                        },
                        body: JSON.stringify({ id: subtaskId })
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Delete subtask response:', data);
                        if (data.success) {
                            clickedEventInfo.event.remove();
                            Swal.fire({
                                text: "Task has been deleted!",
                                icon: "success",
                                buttonsStyling: false,
                                confirmButtonText: "Ok, got it!",
                                customClass: {
                                    confirmButton: "btn btn-primary",
                                }
                            });
                        } else {
                           location.reload();
                        }
                    })
                    .catch(error => {
                        console.error("Error during delete request:", error);
                        Swal.fire({
                            text: "Failed to delete the task. Error during request.",
                            icon: "error",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn btn-primary",
                            }
                        });
                    });
                }
            });
        });
    }
    
    
    // Function to get CSRF token from cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    

    // Handle edit button
    const handleEditButton = () => {
        viewEditButton.addEventListener('click', e => {
            e.preventDefault();

            viewModal.hide();
            handleEditEvent();
        });
    }

    // Handle cancel button
    const handleCancelButton = () => {
        // Edit event modal cancel button
        cancelButton.addEventListener('click', function (e) {
            e.preventDefault();

            Swal.fire({
                text: "Are you sure you would like to cancel?",
                icon: "warning",
                showCancelButton: true,
                buttonsStyling: false,
                confirmButtonText: "Yes, cancel it!",
                cancelButtonText: "No, return",
                customClass: {
                    confirmButton: "btn btn-primary",
                    cancelButton: "btn btn-active-light"
                }
            }).then(function (result) {
                if (result.value) {
                    form.reset(); // Reset form	
                    modal.hide(); // Hide modal				
                } else if (result.dismiss === 'cancel') {
                    Swal.fire({
                        text: "Your form has not been cancelled!.",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn btn-primary",
                        }
                    });
                }
            });
        });
    }

    // Handle close button
    const handleCloseButton = () => {
        // Edit event modal close button
        closeButton.addEventListener('click', function (e) {
            e.preventDefault();

            Swal.fire({
                text: "Are you sure you would like to cancel?",
                icon: "warning",
                showCancelButton: true,
                buttonsStyling: false,
                confirmButtonText: "Yes, cancel it!",
                cancelButtonText: "No, return",
                customClass: {
                    confirmButton: "btn btn-primary",
                    cancelButton: "btn btn-active-light"
                }
            }).then(function (result) {
                if (result.value) {
                    form.reset(); // Reset form	
                    modal.hide(); // Hide modal				
                } else if (result.dismiss === 'cancel') {
                    Swal.fire({
                        text: "Your form has not been cancelled!.",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn btn-primary",
                        }
                    });
                }
            });
        });
    }

    // Handle view button
    const handleViewButton = () => {
        const viewButton = document.querySelector('#kt_calendar_event_view_button');
        viewButton.addEventListener('click', e => {
            e.preventDefault();

            hidePopovers();
            handleViewEvent();
        });
    }

    // Helper functions

    // Reset form validator on modal close
    const resetFormValidator = (element) => {
        // Target modal hidden event --- For more info: https://getbootstrap.com/docs/5.0/components/modal/#events
        element.addEventListener('hidden.bs.modal', e => {
            if (validator) {
                // Reset form validator. For more info: https://formvalidation.io/guide/api/reset-form
                validator.resetForm(true);
            }
        });
    }

    // Populate form 
    const populateForm = () => {
        eventName.value = data.eventName ? data.eventName : '';
        eventDescription.value = data.eventDescription ? data.eventDescription : '';
        eventLocation.value = data.eventLocation ? data.eventLocation : '';
        startFlatpickr.setDate(data.startDate, true, 'Y-m-d');

        // Handle null end dates
        const endDate = data.endDate ? data.endDate : moment(data.startDate).format();
        // endFlatpickr.setDate(endDate, true, 'Y-m-d');

        // const allDayToggle = form.querySelector('#kt_calendar_datepicker_allday');
        // const datepickerWrappers = form.querySelectorAll('[data-kt-calendar="datepicker"]');
        // if (data.allDay) {
        //     startTimeFlatpickr.setDate(data.startDate, true, 'Y-m-d H:i');
        //     endTimeFlatpickr.setDate(data.endDate, true, 'Y-m-d H:i');
        //     endFlatpickr.setDate(data.startDate, true, 'Y-m-d');
        //     allDayToggle.checked = false;
        //     datepickerWrappers.forEach(dw => {
        //         dw.classList.remove('d-none');
        //     });
        // } else {
        //     startTimeFlatpickr.setDate(data.startDate, true, 'Y-m-d H:i');
        //     endTimeFlatpickr.setDate(data.endDate, true, 'Y-m-d H:i');
        //     endFlatpickr.setDate(data.startDate, true, 'Y-m-d');
        //     allDayToggle.checked = false;
        //     datepickerWrappers.forEach(dw => {
        //         dw.classList.remove('d-none');
        //     });
        // }
    }

    // Format FullCalendar reponses
    const formatArgs = (res) => {
        data.id = res.id;
        data.eventName = res.title;
        data.eventDescription = res.description;
        data.eventStatus = res.status;
        data.eventDedicatedHours = res.dedicatedhours;
        data.eventLocation = res.location;
        data.startDate = res.startStr;
        data.project_spoc = res.project_spoc;
        data.company_name = res.company_name;
        data.projectname =res.project_name;
        data.status =res.status;
        data.endDate = res.endStr;
        data.allDay = res.status;
    }

    // Generate unique IDs for events
    const uid = () => {
        return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
    }

    return {
        // Public Functions
        init: function () {
            // Define variables
            // Add event modal
            const element = document.getElementById('kt_modal_add_event');
            form = element.querySelector('#kt_modal_add_event_form');
            eventName = form.querySelector('[name="milestone_name"]');
            eventDescription = form.querySelector('[name="calendar_event_description"]');
            eventLocation = form.querySelector('[name="priority"]');
            startDatepicker = form.querySelector('#kt_calendar_datepicker_start_date');
            endDatepicker = form.querySelector('#kt_calendar_datepicker_end_date');
            // startTimepicker = form.querySelector('#kt_calendar_datepicker_start_time');
            endTimepicker = form.querySelector('#kt_calendar_datepicker_end_time');
            addButton = document.querySelector('[data-kt-calendar="add"]');
            submitButton = form.querySelector('#kt_modal_add_event_submit');
            cancelButton = form.querySelector('#kt_modal_add_event_cancel');
            closeButton = element.querySelector('#kt_modal_add_event_close');
            modalTitle = form.querySelector('[data-kt-calendar="title"]');
            modal = new bootstrap.Modal(element);

            // View event modal
            const viewElement = document.getElementById('kt_modal_view_event');
            viewModal = new bootstrap.Modal(viewElement);
            viewEventName = viewElement.querySelector('[data-kt-calendar="event_name"]');
            viewAllDay = viewElement.querySelector('[data-kt-calendar="all_day"]');
            viewEventDescription = viewElement.querySelector('[data-kt-calendar="event_description"]');
            viewProjectManager = viewElement.querySelector('[data-kt-calendar="project_spoc"]');
            viewCompanyName = viewElement.querySelector('[data-kt-calendar="company_name"]');
            viewEventLocation = viewElement.querySelector('[data-kt-calendar="event_location"]');
            viewStartDate = viewElement.querySelector('[data-kt-calendar="event_start_date"]');
            viewEndDate = viewElement.querySelector('[data-kt-calendar="event_end_date"]');
            viewEditButton = viewElement.querySelector('#kt_modal_view_event_edit');
            viewDeleteButton = viewElement.querySelector('#kt_modal_view_event_delete');

            // viewStatus = viewElement.querySelector('[data-kt-calendar="task_status"]');
            viewProjectName = viewElement.querySelector('[data-kt-calendar="project_name"]');
            viewstatus = viewElement.querySelector('[data-kt-calendar="status"]');
            
            document.querySelector('[data-kt-calendar="project_name"]');

// Project Manager
             document.querySelector('[data-kt-calendar="project_spoc"]');
             document.querySelector('[data-kt-calendar="company_name"]');

            initCalendarApp();
            initValidator();
            initDatepickers();
            handleEditButton();
            handleAddButton();
            handleDeleteEvent();
            handleCancelButton();
            handleCloseButton();
            resetFormValidator(element);
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function () {
    KTAppCalendar.init();
});