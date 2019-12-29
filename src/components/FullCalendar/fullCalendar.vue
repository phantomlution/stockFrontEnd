<template>
  <div>
    <FullCalendar ref="fullCalendar" defaultView="dayGridMonth" :locale="locale"
      :header="header"
      :plugins="calendarPlugins"
      :weekends="calendarWeekends"
      :events="calendarEvents"
      @eventMouseEnter="eventMouseEnter"
      @mouseEnter="eventMouseEnter"
      @dateClick="handleDateClick"
    />
  </div>
</template>

<script>
/**
 * FullCalendar
 * https://fullcalendar.io/docs#toc
 * https://github.com/fullcalendar/fullcalendar-vue/tree/master/src
 */

import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

import locale from '../../../node_modules/@fullcalendar/core/locales/zh-cn'

require('../../../node_modules/@fullcalendar/core/main.css')
require('../../../node_modules/@fullcalendar/daygrid/main.css')

const props = {
  calendarEvents: {
    type: Array,
    required: true
  }
}

export default {
  props,
  components: {
    FullCalendar
  },
  data() {
    return {
      timeZone: 'Asia/Shanghai',
      locale,
      header: {
        left: 'prev,next',
        center: 'title',
        right: false
      },
      calendarPlugins: [
        dayGridPlugin,
        interactionPlugin
      ],
      calendarWeekends: true
    }
  },
  methods: {
    eventMouseEnter: function(event, jsEvent, view) {
      console.log(event)
      console.log(view)
//      $('.fc-event-inner', this).append('<div id=\"'+event.id+'\" class=\"hover-end\">'+$.fullCalendar.formatDate(event.end, 'h:mmt')+'</div>');
    },
    eventMouseout: function(event, jsEvent, view) {
//      $('#'+event.id).remove();
    },
    handleDateClick(arg) {
      console.log('click')
//      if (confirm('Would you like to add an event to ' + arg.dateStr + ' ?')) {
//        this.calendarEvents.push({ // add new event data
//          title: 'New Event',
//          start: arg.date,
//          allDay: arg.allDay
//        })
//      }
    }
  }
}

</script>

<style lang="scss">
.fc-day-grid-event{
  background-color: #c7e6fd;
  color: red;
  border: none;
  font-size: 12px;
  text-indent: 3px;
  &:hover{
    color: red;
  }
}
</style>
