import React, { Component } from 'react';
import AuthContext from '../context/auth-context';

import './Auth.css';

class AuthPage extends Component {
    state = {
        isLogin: true
    };

    // get access to context data
    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.emailEl = React.createRef();
        this.passwordEl = React.createRef();
    };

    loginHandler = () => {
        this.setState(prevState => {
            return { isLogin: !prevState.isLogin };
        });
    };

    submitHandler = (event) => {
        // prevent sending request to this page
        event.preventDefault();

        const email = this.emailEl.current.value;
        const password = this.passwordEl.current.value;

        if (email.trim().length === 0 || password.trim().length === 0) {
            return;
        }

        // default - login
        let requestBody = {
            query: `
                query Login($email: String!, $password: String!) {
                    login(email: $email, password: $password) {
                        userId
                        token
                        tokenExpiration
                    }
                }
            `,
            variables: {
                email: email,
                password: password
            }
        };

        // if not login - create new user
        if (!this.state.isLogin) {
            requestBody = {
                query: `
                    mutation CreateUser($email: String!, $password: String!) {
                        createUser(userInput: {email: $email, password: $password}) {
                            _id
                            email
                        }
                    }
                `,
                variables: {
                    email: email,
                    password: password
                }
            };
        }

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
            if (resData.data.login.token) {
                this.context.login(
                    resData.data.login.token,
                    resData.data.login.userId,
                    resData.data.login.tokenExpiration
                );
            }
        })
        .catch(err => {
            console.log(err);
        });
    };

    render() {
        return <form className="auth-form" onSubmit={this.submitHandler}>
            <div className="form-control">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" ref={this.emailEl}/>
            </div>
            <div className="form-control">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" ref={this.passwordEl}/>
            </div>
            <div className="form-actions">
                <button type="submit">Submit</button>
                <button type="button" onClick = {this.loginHandler}>
                    Switch to {this.state.isLogin ? 'signup' : 'login'}
                </button>
            </div>
        </form>;
    }
}

export default AuthPage;