import React from 'react';
import { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';

import AuthContext from '../../context/auth-context';
import Backdrop from '../../components/Backdrop/Backdrop';
import Modal from '../../components/Modal/Modal';
import './MainNavigation.css';

class MainNavigation extends Component {
    state = {
        isHelp: false
    }

    static contextType = AuthContext;

    onHelpClick = () => {
        this.setState({ isHelp: true });
    };

    closeHelp = () => {
        this.setState({ isHelp: false });
    };

    render() {
        return (
            <React.Fragment>
                {this.state.isHelp && <Backdrop />}
                {this.state.isHelp && (
                    <Modal
                        title="Help"
                        canConfirm
                        onConfirm={this.closeHelp}
                        confirmText="OK"
                    >
                        <p>Welcome to our volunteer platform! Here you can login or sign up and book volunteer event.</p>
                    </Modal>
                )}
                <header className="main-navigation">
                    <div className="main-navigation__logo">
                        <h1>Happy Tails</h1>
                    </div>
                    <nav className="main-navigation__items">
                        <ul>
                            {!this.context.token && (
                                <li>
                                    <NavLink to="/auth">Authenticate</NavLink>
                                </li>
                            )}
                            <li>
                                <NavLink to="/events">Events</NavLink>
                            </li>
                            {this.context.token && (
                                <React.Fragment>
                                    <li>
                                        <NavLink to="/bookings">Bookings</NavLink>
                                    </li>
                                    <li>
                                        <button onClick={this.context.logout}>Logout</button>
                                    </li>
                                </React.Fragment>
                            )}
                            {(window.location.pathname === '/auth') &&
                                (<svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 1000 1000"
                                    xmlns="http://www.w3.org/2000/svg"
                                    onClick={this.onHelpClick}
                                >
                                    <path d="M 500 0C 224 0 0 224 0 500C 0 776 224 1000 500 1000C 776 1000 1000 776 1000 500C 1000 224 776 0 500 0C 500 0 500 0 500 0 M 501 191C 626 191 690 275 690 375C 690 475 639 483 595 513C 573 525 558 553 559 575C 559 591 554 602 541 601C 541 601 460 601 460 601C 446 601 436 581 436 570C 436 503 441 488 476 454C 512 421 566 408 567 373C 566 344 549 308 495 306C 463 303 445 314 411 361C 400 373 384 382 372 373C 372 373 318 333 318 333C 309 323 303 307 312 293C 362 218 401 191 501 191C 501 191 501 191 501 191M 500 625C 541 625 575 659 575 700C 576 742 540 776 500 775C 457 775 426 739 425 700C 425 659 459 625 500 625C 500 625 500 625 500 625"/>
                                </svg>
                            )}
                        </ul>
                    </nav>
                </header>
            </React.Fragment>
        );
    }
}

export default withRouter(MainNavigation);