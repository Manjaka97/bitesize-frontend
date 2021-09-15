import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../logo.svg';
import DynamicLogin from '../authentication/dynamic-login';
import { useState, useEffect } from 'react';
import { useStore } from 'react-redux'
import { useAuth0 } from '@auth0/auth0-react'
import generateToken  from '../authentication/auth-token'
import { fetchCategories } from '../utils/api-calls';

const Navbar = () => {
    const store = useStore();
    const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [ token, setToken ] = useState('');
    
    // Initial useEffect
    useEffect(() => {
        // Check if categories have been dispatched in the store
        var storeCategories = store.getState().categoriesReducer.categories;
        if (!storeCategories || storeCategories.length === 0) {
            // Else fetch categories then dispatch to the store
            fetchCategories().then(data => {
                store.dispatch({type: 'SET_CATEGORIES', payload: data});
            })
        }
        // eslint-disable-next-line
    }, []);

    // useEffect to obtain the access token
    useEffect(() => {
        if (isAuthenticated) {
            const currentToken = store.getState().authReducer.token;
            if (currentToken === '') {
                generateToken(getAccessTokenSilently).then(token => {
                    // Store the token in the redux store so we do not need to call generateToken again
                    store.dispatch({type: 'SET_TOKEN', payload: token});
                    setToken(token); 
                });
            } else {
                setToken(currentToken);
            }
        }
        // eslint-disable-next-line
    }, [isAuthenticated]);

    return (
        <nav id="navbar" className="navbar navbar-expand-sm navbar-dark bg-dark">
            <div className="container-fluid">
                
                {/* Logo */}
                <a className="navbar-brand" href="/home"><img src={logo} alt='logo'></img></a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                {/* Navbar links */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ">
                        <li className="nav-item">
                            <Link to="/home" className="nav-link" aria-current="page">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/profile" className="nav-link" href="#">Profile</Link>
                        </li>
                    </ul>
                </div>

                {/* Login/Logout */}
                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <DynamicLogin user={user} token={token} isAuthenticated={isAuthenticated} store={store}/>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;