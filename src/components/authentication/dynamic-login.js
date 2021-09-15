import React from 'react';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { fetchProfilePicture } from '../utils/api-calls'

const LoginButton = () => {
    const { loginWithRedirect } = useAuth0();
    return <button type="button" className="btn btn-link nav-link" onClick={() => loginWithRedirect()}>Log In</button>;
};

const LogoutButton = (props) => {
    const [ picture, setPicture ] = useState('');
    const { logout } = useAuth0();
    
    // useEffect to fetch the profile picture and subscribe to the store for profile picture changes
    useEffect(() => {
        props.store.subscribe(() => {
        if (props.token !== '') {
            fetchProfilePicture(props.user.sub, props.token).then(pic => setPicture(pic));
        }
    })
        // eslint-disable-next-line
    }, [props.token]);
    
    return (
        <div className="d-flex align-items-center" style={{height:"5vh"}}>
            <button type="button" className="btn btn-link nav-link" onClick={() => logout({ returnTo: `${process.env.REACT_APP_HOST}/welcome` })}>Log Out</button>;
            <Link to="/profile" className="h-100"><img src={picture || props.user.picture || ''} className="rounded-circle" style={{width:"4vh", height:"4vh"}} alt="navProfile"></img></Link>
        </div>
    )
};

const DynamicLogin = (props) => {
    if (props.isAuthenticated) {
        return <LogoutButton user={props.user} token={props.token} store={props.store}/>;
    }
    return <LoginButton />;
};

export default DynamicLogin;