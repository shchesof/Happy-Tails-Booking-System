import React from 'react';

import './BookingList.css';

const bookingList = props => (
    <ul className="bookings__list">
        {props.bookings.map(b => {
            return (
                <li key={b._id} className="bookings__item">
                    <div className="bookings__item-data">
                        {b.event.title} -{' '}
                        {new Date(b.createdAt).toLocaleDateString()}
                    </div>
                    <div className="bookings__item-actions">
                        <button className="btn" onClick={props.onDelete.bind(this, b._id)}>
                            Cancel
                        </button>
                    </div>
                </li>
            );
        })}
    </ul>
);

export default bookingList;