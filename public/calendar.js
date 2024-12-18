document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const events = JSON.parse(calendarEl.dataset.events);

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    events: events,
    eventColor: "transparent", // Ensure each event color is defined by its individual property
    eventContent: function (arg) {
      return {
        html: `<div style="color:${arg.event.extendedProps.textColor}; background-color:${arg.event.backgroundColor}; padding: 5px; border-radius: 4px;">${arg.event.title}</div>`
      };
    },
  });

  calendar.render();
});
