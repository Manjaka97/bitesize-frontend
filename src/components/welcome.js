import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useHistory } from 'react-router-dom';
import Font from 'react-font';

const Welcome = (props) => {
    const { isAuthenticated, loginWithRedirect } = useAuth0();
    let history = useHistory();
    if (isAuthenticated) {
        history.push('/home');
    }

    return (
        <Font family="Arsenal">
        <div id="bg" className="d-flex align-items-center flex-column">
                <div className="text-center mt-auto p-2" style={{fontSize:"4rem"}}>Welcome to Bitesize</div>

                <div className="text-center p-2" style={{fontSize:"2rem"}}>Please <span id="login" style={{textDecorationLine:'underline'}} onClick={() => loginWithRedirect()}>log in</span> to continue</div>
                <div className="text-center p-2" style={{fontSize:"2rem"}}>(You can use the trial account * email: guest@email.com / password: guest *) </div>
                <div className=" text-center mt-auto p-2" style={{fontSize:"2rem", color:'white'}}>Big Goals, Bitesize Steps</div>
        </div>
        </Font>
    );
}

export default Welcome;