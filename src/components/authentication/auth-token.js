require('dotenv').config();

// Takes getAccessTokenSilenlty, executes that function and returns the access token
const generateToken = async (tokenGenerator) => {
    return await tokenGenerator({
        audience: process.env.REACT_APP_AUTH0_BITESIZE_AUDIENCE,
        scope: "read:current_user update:current_user"
    });
}

export default generateToken;