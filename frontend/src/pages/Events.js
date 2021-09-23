import React, { Component } from 'react';

import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import EventList from '../components/Events/EventList/EventList';
import AuthContext from '../context/auth-context';
import Spinner from '../components/Spinner/Spinner';

import './Events.css';

class EventsPage extends Component {
    state = {
        creating: false,
        events: [],
        isLoading: false,
        selectedEvent: null,
        types: [ 'Walk', 'Playing', 'Washing', 'Feeding' ],
        selectedType: 'Walk',
        filter: 'All'
    };

    isActive = true;

    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.titleEl = React.createRef();
        this.dateStartEl = React.createRef();
        this.dateEndEl = React.createRef();
        this.descEl = React.createRef();
    };

    componentDidMount() {
        this.fetchEvents();
    };

    startCreateEventHandler = () => {
        this.setState({ creating: true });
    };

    modalConfirmHandler = () => {
        this.setState({ creating: false, isLoading: true });
        const title = this.titleEl.current.value;
        const dateStart = this.dateStartEl.current.value;
        const dateEnd = this.dateEndEl.current.value;
        const description = this.descEl.current.value;
        const type = this.state.selectedType;

        if (
            title.trim().length === 0 ||
            dateStart.trim().length === 0 ||
            dateEnd.trim().length === 0 ||
            description.trim().length === 0 ||
            type.trim().length === 0
            ) {
            return;
        }

        // properties names and names of variables that hold
        // their values are the same
        const event = { title, dateStart, dateEnd, description, type };
        console.log(event);

        const requestBody = {
        query: `
            mutation CreateEvent($title: String!, $desc: String!, $type: String!, $dateStart: String!, $dateEnd: String!) {
                createEvent(eventInput: {
                    title: $title,
                    description: $desc,
                    type: $type,
                    dateStart: $dateStart,
                    dateEnd: $dateEnd
                }) {
                    _id
                    title
                    description
                    type
                    dateStart
                    dateEnd
                }
            }
            `,
            variables: {
                title: title,
                desc: description,
                type: type,
                dateStart: dateStart,
                dateEnd: dateEnd
            }
        };

        const token = this.context.token;

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
            }
        })
        .then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('Failed!');
            }
            return res.json();
        })
        .then(resData => {
            this.setState(prevState => {
                const updatedEvents = [...prevState.events];
                updatedEvents.push({
                    _id: resData.data.createEvent._id,
                    title: resData.data.createEvent.title,
                    description: resData.data.createEvent.description,
                    type: resData.data.createEvent.type,
                    dateStart: resData.data.createEvent.dateStart,
                    dateEnd: resData.data.createEvent.dateEnd,
                    creator: {
                        _id: this.context.userId
                    }
                });
                return { events: updatedEvents, isLoading: false };
            });
        })
        .catch(err => {
            console.log(err);
        });
    };

    modalCancelHandler = () => {
        this.setState({ creating: false, selectedEvent: null });
    };

    fetchEvents() {
        this.setState({ isLoading: true });
        const requestBody = {
            query: `
                query {
                    events {
                        _id
                        title
                        description
                        type
                        dateStart
                        dateEnd
                        creator {
                            _id
                            email
                        }
                    }
                }
                `
            };
    
            fetch('http://localhost:8000/graphql', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error('Failed!');
                }
                return res.json();
            })
            .then(resData => {
                const events = resData.data.events;
                if (this.isActive) {
                    this.setState({ events: events, isLoading: false });
                }
            })
            .catch(err => {
                console.log(err);
                if (this.isActive) {
                    this.setState({ isLoading: false });
                }
            });
    }

    showDetailHandler = eventId => {
        this.setState(prevState => {
            const selectedEvent = prevState.events.find(e => e._id === eventId);
            return { selectedEvent: selectedEvent };
        });
    };

    bookEventHandler = () => {
        const token = this.context.token;
        if (!token) {
            this.setState({ selectedEvent: null });
            return;
        }
        const requestBody = {
            query: `
                mutation BookEvent($id: ID!) {
                    bookEvent(eventId: $id) {
                        _id
                        createdAt
                        updatedAt
                    }
                }
                `,
                variables: {
                    id: this.state.selectedEvent._id
                }
            };
    
            fetch('http://localhost:8000/graphql', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token
                }
            })
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error('Failed!');
                }
                return res.json();
            })
            .then(resData => {
                console.log(resData);
                this.setState({ selectedEvent: null });
            })
            .catch(err => {
                console.log(err);
                this.setState({ isLoading: false });
            });
    };

    onSelectEventHandler = event => {
        this.setState(prevState => {
            const selectedEvent = prevState.events.find(e => e._id === event.id);
            return { selectedEvent: selectedEvent };
        });
    };

    componentWillUnmount() {
        this.isActive = false;
    }

    onTypeChange = (event) => {
        this.setState({ selectedType: event.target.value });
    }

    filterEvents = (event) => {
        this.setState({ filter: event.target.id });
    };

    render() {
        return (
            <React.Fragment>
                {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
                {this.state.creating && (
                    <Modal
                        title="Add event"
                        canCancel
                        canConfirm
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.modalConfirmHandler}
                        confirmText="Confirm"
                    >
                        <form>
                            <div className="form-control">
                                <label htmlFor="title">Title</label>
                                <input type="text" id="title" ref={this.titleEl}/>
                            </div>
                            <div className="form-control">
                                <label htmlFor="dateStart">Date start</label>
                                <input type="datetime-local" id="dateStart" ref={this.dateStartEl}/>
                            </div>
                            <div className="form-control">
                                <label htmlFor="dateEnd">Date end</label>
                                <input type="datetime-local" id="dateEnd" ref={this.dateEndEl}/>
                            </div>
                            <div className="form-control">
                                <select value={this.state.selectedType} onChange={this.onTypeChange}>
                                    {this.state.types.map(t => { 
                                        return (<option key={t} value={t}>{t}</option>);
                                    })}
                                </select>
                            </div>
                            <div className="form-control">
                                <label htmlFor="description">Description</label>
                                <textarea id="description" rows="4" ref={this.descEl}/>
                            </div>
                        </form>
                    </Modal>
                )}
                {this.state.selectedEvent && (
                    <Modal
                        title={this.state.selectedEvent.title}
                        canCancel
                        canConfirm={new Date(this.state.selectedEvent.dateStart) >= new Date() && this.context.token}
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.bookEventHandler}
                        confirmText='Book'
                    >
                        <h1>{this.state.selectedEvent.title}</h1>
                        <h2>{new Date(this.state.selectedEvent.dateStart).toLocaleDateString()}</h2>
                        <h2>{this.state.selectedEvent.type}</h2>
                        <h3>
                            {new Date(this.state.selectedEvent.dateStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} -{' '}
                            {new Date(this.state.selectedEvent.dateEnd).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </h3>
                        <p>{this.state.selectedEvent.description}</p>
                    </Modal>
                )}
                {this.context.token && (
                    <div className="events-control">
                        <p>Share your own events!</p>
                        <button className="btn" onClick={this.startCreateEventHandler}>
                            Create event
                        </button>
                    </div>
                )}
                {this.state.isLoading && <Spinner />}
                {!this.state.isLoading && !this.state.selectedEvent && !this.state.creating && (
                    <React.Fragment>
                        <div>
                            <button className="filter-btn" id="All" onClick={this.filterEvents} autoFocus>All</button>
                            <button className="filter-btn" id="Walk" onClick={this.filterEvents}>Walk</button>
                            <button className="filter-btn" id="Playing" onClick={this.filterEvents}>Playing</button>
                            <button className="filter-btn" id="Washing" onClick={this.filterEvents}>Washing</button>
                            <button className="filter-btn" id="Feeding" onClick={this.filterEvents}>Feeding</button>
                        </div>
                        <EventList
                            events={this.state.events.filter(e => {
                                return (
                                    this.state.filter === 'All' || this.state.filter === e.type
                                );
                            })}
                            onSelectEventHandler={this.onSelectEventHandler}
                        />
                    </React.Fragment>
                )}
            </React.Fragment>
        );
    }
}

export default EventsPage;
