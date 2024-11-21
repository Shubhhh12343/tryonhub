self.onmessage = function(e) {
    const response = e.data;
    const events = [];

    for(let i = 0; i < response.status.length; i++) {
        events.push({
            id: response.status[i].id,
            title: response.status[i].title,
            start: response.status[i].start,
            end: response.status[i].end,
            description: response.status[i].assign_to,
            status: response.status[i].status,
            dedicatedhours: response.status[i].dedicated_hours,
            project_name: response.status[i].project_name,
            project_spoc: response.status[i].project_spoc,
            company_name: response.status[i].company_name,
            className: "fc-event-danger fc-event-solid-warning",
            extendedProps: {
                subtaskId: response.status[i].id
            }
        });
    }
    
    self.postMessage(events);
};
