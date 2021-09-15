import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import generateToken from './authentication/auth-token';
import { useStore } from 'react-redux';
import { SuccessAlert, ErrorAlert } from './utils/alerts'
import { fetchProfile, fetchCompletedGoals, deleteProfile } from './utils/api-calls'
import { getUserFriendlyDate } from './utils/date'
import { SpinnerButton } from './buttons/dynamic-buttons'
require('dotenv').config();

const Profile = () => {
  const { user, isAuthenticated, getAccessTokenSilently, logout } = useAuth0();
  const [ token, setToken ] = useState('');
  const [ profile, setProfile ] = useState({firstname:'', lastname:'', gender:'N', birthday:'', picture:'', encouragement:'', subscribed:true});
  const [ pictureFile, setPictureFile ] = useState('');
  const [ btnDisabled, setBtnDisabled ] = useState(false)
  const [ alertHidden, setAlertHidden ] = useState({success: true, error: true})
  const [ completedGoals, setCompletedGoals ] = useState([]);
  const [ showing, setShowing ] = useState(5);
  const [ showBtn, setShowBtn ] = useState(false);
  let history = useHistory();
  const store = useStore();

  // useEffect to obtain the access token
  useEffect(() => {
    if (isAuthenticated) {
      const currentToken = store.getState().authReducer.token;
            if (currentToken === '') {
                generateToken(getAccessTokenSilently).then(token => {
                    setToken(token); 
                    // Store the token in the redux store so we do not need to call generateToken again
                    store.dispatch({type: 'SET_TOKEN', payload: token});
                });
            } else {
                setToken(currentToken);
            }
      
      // Enable scrolling (This could be in a separate useEffect but unauthenticated users should not be able to scroll anyway)
      document.body.style.overflow = 'auto';
    }
    // eslint-disable-next-line
  }, [isAuthenticated]);

  // useEffect to fetch the profile and completed goals
  useEffect(() => {
    if (isAuthenticated && token !== '') {
        fetchProfile(user.sub, token).then(data => {
          profile.firstname = data.firstname;
          profile.lastname = data.lastname;
          profile.gender = data.gender;
          profile.birthday = data.birthday;
          profile.picture = data.picture;
          profile.encouragement = data.encouragement;
          profile.subscribed = data.subscribed;
          setProfile({...profile});
        });

        fetchCompletedGoals(user.sub, token).then(data => setCompletedGoals(data));
    }
    // eslint-disable-next-line
  }, [token]);

  // Update the profile picture
  const uploadPicture = (e) => {
    if (e.target.value !== '') {
      const data = new FormData();
      data.append('picture', e.target.files[0]);
      // First upload the picture to cloudinary
      fetch(`${process.env.REACT_APP_API_ENDPOINT}/upload_profile_picture/${user.sub}`, {
        method: 'POST',
        headers: {
          'mode': 'cors',
          'Authorization': `Bearer ${token}`,
          'Encoding': 'multipart/form-data',
          'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
        },
        body: data
      }).then(res => { 
        if (res.status === 201) {
          return res.json();
        }
      }).then(data => {
          profile.picture = data.url;
          setProfile({...profile});
          store.dispatch({type: 'SET_USER_PROFILE', payload: profile});
      }).catch(err => setAlertHidden({success: true, error: false}));
    }
  }

  // Delete a goal and remove it from the list
  const handleDeleteGoal = (goalId) => {
    var svg = document.getElementById(`button-${goalId}`);
    var spinner = document.getElementById(`spinner-${goalId}`);
    svg.hidden = true;
    spinner.hidden = false;
    fetch(`${process.env.REACT_APP_API_ENDPOINT}/delete_goal/${user.sub}/${goalId}`, {
      method: 'DELETE',
      headers: {
        'mode': 'cors',
        'Authorization': `Bearer ${token}`,
        'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
      }
    }).then(res => {
      if (res.status === 200) {
          // Delete the goal from the completed goals array
          setCompletedGoals(completedGoals.filter(goal => goal.id !== goalId));
      } else {
        svg.hidden = false;
        spinner.hidden = true;
      }
    })
  }

  // Update the profile
  const HandleSave = (event) => {
    event.preventDefault();
    var saveButton = document.getElementById('button-save');
    var saveSpinner = document.getElementById('spinner-save');
    saveButton.hidden = true;
    saveSpinner.hidden = false;
    setBtnDisabled(true);
    setAlertHidden({success: true, error: true});
    const data = new FormData();
    data.append('firstname', profile.firstname);
    data.append('lastname', profile.lastname);
    data.append('gender', profile.gender);
    data.append('birthday', profile.birthday);
    data.append('encouragement', profile.encouragement);
    data.append('subscribed', profile.subscribed);
    fetch(`${process.env.REACT_APP_API_ENDPOINT}/update_profile/${user.sub}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'mode': 'cors',
        'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
      },
      body: data
    }).then((profile) => { 
      store.dispatch({type: 'SET_USER_PROFILE', payload: profile});
      setBtnDisabled(false);
      setAlertHidden({success: false, error: true});
      saveButton.hidden = false;
      saveSpinner.hidden = true;
    }).catch(() => {
      setAlertHidden({success: true, error: false})
      saveButton.hidden = false;
      saveSpinner.hidden = true;
    });
  }

  // Show more completed goals
  const showMore = (b) => {
    setShowing(showing + 5)
    if (showing >= completedGoals.length) {
      setShowBtn(true);
    }
  }

  // Delete account
  const confirmDeleteAccount = () => {
    deleteProfile(user.sub, token).then(res => {
      if (res.status === 204){
        logout({ returnTo: `${process.env.REACT_APP_HOST}/welcome` })
      }
    });
  }

  const CompletedGoals = (props) => {
    return (
      <>
        <div className="d-flex mb-3">
            <div className="flex-grow-1">
              <h2>Completed Goals</h2>
            </div>
        </div>
        <div>
            <ul className="list-group">
              { props.children }
            </ul>
        </div>
      </>
    );
  }

  const ConfirmDeleteAccountModal = () => {
    return (
        <>
            <div className="modal fade" id="deleteAccountModal" tabIndex="-1" aria-labelledby="deleteAccountModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">Delete Account</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        Are you sure you want to delete this account? This action cannot be undone.
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button disabled={btnDisabled} type="button" data-bs-dismiss="modal" className="btn btn-danger" onClick={() => confirmDeleteAccount()}>Delete</button>
                    </div>
                    </div>
                </div>
            </div>
        </>
    );
  }

  return (
    isAuthenticated && (
      <>
      {/* <ProfilePicture /> */}
      <div className="d-flex justify-content-center">
        <button className="btn" data-bs-toggle="collapse" data-bs-target="#changeProfile">
          <img src={ profile.picture || user.picture } id="profilePicture" className="rounded-circle" alt='profile' style={{width:"150px", height:"150px"}}></img>
        </button>
        </div>
        <div className="d-flex justify-content-center mt-2">
          <div className="collapse"  id="changeProfile">
          <input type="file" id="profileInput" value={pictureFile || ''} onChange={(event) =>{setPictureFile(event.target.value); uploadPicture(event)}} hidden></input>
          <button className="btn btn-dark"><label htmlFor="profileInput">Change Profile Picture</label></button>
          </div>
        </div>

      <div className="container mt-4 mb-3 mobile">
        <SuccessAlert message="Profile Successfully Updated!" hideFunction={setAlertHidden} hidden={alertHidden.success}/>
        <ErrorAlert message="Profile Update Failed!" hideFunction={setAlertHidden} hidden={alertHidden.error}/>
        <div className="mb-3 row">
          <div className="col">
            <h1>My Profile</h1>
          </div>
          <div className="col">
            <button onClick={() => history.push('/home')} type="button" className="btn btn-outline-secondary float-end">Back</button>
          </div>
        </div>
        {/* <ProfileForm /> */}
        <form>
          <div className="mb-3">
              <label htmlFor="firstname" className="form-label">First Name</label>
              <input type="text" id="firstname" className="form-control" value={profile.firstname|| ''} onChange={(event) => setProfile({...profile, firstname:event.target.value})} maxLength="32"/>
          </div>
          <div className="mb-3">
              <label htmlFor="lastname" className="form-label">Last Name</label>
              <input type="text" id="lastname" className="form-control" value={profile.lastname|| ''} onChange={(event) => setProfile({...profile, lastname:event.target.value})} maxLength="32" />
          </div>
          <div className="mb-3">
              <label htmlFor="category" className="form-label">Gender</label>
              <select id="category" className="form-select" value={profile.gender|| 'N'} onChange={(event) => setProfile({...profile, gender:event.target.value})}>
                <option  value="N">Not Selected</option>
                <option  value="F">Female</option>
                <option  value="M">Male</option>
              </ select>
          </div>
          <div className="mb-3">
              <label htmlFor="birthday" className="form-label">Birthday</label>
              <input type="date" className="form-control" value={profile.birthday|| ''} onChange={(event) => setProfile({...profile, birthday:event.target.value})} id="birthday" />
          </div>
          
          <div className="mb-3">
              <label htmlFor="encouragement" className="form-label">Motivation <br/><small style={{color:"gray"}}>This can be anything: a quote, your personal motto, a bible verse, saying something to yourself, a reward you are expecting...<br/>Think of what will push you to keep going when things get hard.</small></label>
              <input type="text" id="encouragement" className="form-control" value={profile.encouragement|| ''} onChange={(event) => setProfile({...profile, encouragement:event.target.value})} />
          </div>

          <div className="mb-3">
            <label htmlFor="subscribed" className="form-label">
              <input type="checkbox" id="subscribed" className="form-checkbox me-2" checked={ profile.subscribed } onChange={(event) => setProfile({...profile, subscribed:event.target.checked})} />
              Subscribed to email notifications
            </label>
          </div>
            <button disabled={ btnDisabled } type="submit" className="btn btn-primary" onClick={(event)=>HandleSave(event)}>
            <SpinnerButton id="save">Save</SpinnerButton>
            </button>
        </form>
        <hr className="mt-5 mb-5" />
        <CompletedGoals>
          {
            completedGoals && completedGoals.length > 0 && completedGoals.slice(0, showing).map(goal => {
              return (
                <li className="list-group-item" key={goal.id}>
                  <div className="d-flex justify-content-between" style={{color:"gray"}}>
                    {`${goal.name} - ${getUserFriendlyDate(goal.completion_date)}`}
                    <SpinnerButton id={goal.id} bootstrapTheme='danger'>
                      <svg onClick={() => handleDeleteGoal(goal.id)} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" className="bi bi-trash" viewBox="0 0 16 16" >
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                    </SpinnerButton>
                  </div>
                </li>
              );
            })
          }
          
            <button id="showMore" hidden={showBtn} type='button' className='btn btn-warning mt-3 w-25 me-auto ms-auto' onClick={(b) => showMore(b)}>
                Show More   
            </button>   
        </CompletedGoals>

        <hr className="mt-5 mb-5" />
        <h2> Danger Zone </h2>
        <button id="deleteAccount" type='button' className='btn btn-danger mt-3' data-bs-toggle="modal" data-bs-target="#deleteAccountModal">
                Delete Account   
        </button>  
      </div>

      <ConfirmDeleteAccountModal/>

      </>
    )
  );
};

export default Profile;