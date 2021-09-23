import React from 'react';

import './EventList.css';
import { Calendar, momentLocalizer  } from 'react-big-calendar' 
import moment from 'moment';

import './react-big-calendar.css';

moment.locale('en');
const localizer = momentLocalizer(moment);

const eventList = props => {
    return (
        <div style={{ height: 500 }}>
            <Calendar
                localizer={localizer}
                events = {props.events.map(e => {
                    return {
                        'title': e.title,
                        'allDay': false,
                        'start': new Date(e.dateStart),
                        'end': new Date(e.dateEnd),
                        'id': e._id
                    }
                })}
                onSelectEvent={props.onSelectEventHandler}
                step={30}
                defaultView='week'
                views={['month','week','day']}
                defaultDate={new Date()}
                min={new Date(2021, 10, 0, 10, 0, 0)} // from 10:00
                max={new Date(2021, 10, 0, 22, 0, 0)} // to 22:00
            />
        </div>
    );
};

export default eventList;