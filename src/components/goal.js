import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useHistory, useParams } from 'react-router-dom';
import generateToken from './authentication/auth-token';
import { useStore } from 'react-redux';
import { SuccessAlert, ErrorAlert } from './utils/alerts'
import sorted from './utils/sorter'
import { getUserFriendlyDate } from './utils/date'
import { fetchCategories, fetchGoal, fetchGoalSteps, fetchCompletedSteps, updateGoal, uploadPicture, createStep } from './utils/api-calls'
import { SpinnerButton } from './buttons/dynamic-buttons'
import party from 'party-js'

const Goal = () => {
    const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [ token, setToken ] = useState('');
    const [ goalData, setGoalData ] = useState({id: '', name: '', description: '', deadline: '', category: 1, picture: ''});
    const [ steps, setSteps ] = useState([]);
    const [ completedSteps, setCompletedSteps ] = useState([]);
    const [ stepData, setStepData ] = useState({id: '', name: '', description: '', deadline: '', recurring: false, created_at: ''})
    const [ picture, setPicture ] = useState({name: '', file: ''});
    const [ placeholder, setPlaceholder ] = useState("");
    const [ btnDisabled, setBtnDisabled ] = useState(false);
    const [ goalAlertHidden, setGoalAlertHidden ] = useState({success: true, error: true})
    const [ stepAlertHidden, setStepAlertHidden ] = useState({success: true, error: true})
    const [ alertMessage, setAlertMessage ] = useState('');
    const [ order, setOrder ] = useState(3);
    let history = useHistory();
    let {goal_id} = useParams();
    const store = useStore();
    const colors = store.getState().colorReducer;
    const [ color, setColor ] = useState(colors.primary);
    // Enable scrolling
    document.body.style.overflow = 'auto';

    // useEffect to fetch categories from the store
    useEffect(() => {
        // Check if categories have been dispatched in the store
        var storeCategories = store.getState().categoriesReducer.categories;
        if (storeCategories && storeCategories.length > 0) {
            // eslint-disable-next-line
            var cat = (storeCategories.find(item => item.id == goalData.category))
            if (cat) {
                setPlaceholder(cat.picture)
            }
        } else {
            // Else fetch categories then dispatch to the store
            fetchCategories().then(data => {
                store.dispatch({type: 'SET_CATEGORIES', payload: data});
                // eslint-disable-next-line
                var cat = (data.find(item => item.id == goalData.category))
                if (cat) {
                    setPlaceholder(cat.picture)
                }
            })
        }
        // eslint-disable-next-line
    }, [goalData]);

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
        }
        // eslint-disable-next-line
    }, [isAuthenticated]);

    // useEffect to fetch the goal and step data
    useEffect(() => {
        if (isAuthenticated && token !== '' && goal_id) {
            // If the goals in the store are not up to date, fetch the goal data
            if (store.getState().goalsReducer.stale) {
                fetchGoal(user.sub, token, goal_id).then((data) => {
                    if (data.complete) {
                        history.push('/home')
                    }
                    goalData.id = goal_id;
                    goalData.name = data.name;
                    goalData.description = data.description;
                    goalData.deadline = data.deadline;
                    goalData.category = data.category_id;
                    goalData.picture = data.picture;
                    setGoalData({...goalData})
                    if (goalData.picture === '') {
                        setGoalData(goalData);
                    }
                    // Redirect to home page if the goal has been deleted
                }).catch(error => history.push('/home'));
            // Else use the goal data from the store
            } else {
                var storeGoals = store.getState().goalsReducer.goals;
                // eslint-disable-next-line
                if (storeGoals && storeGoals.length > 0 && storeGoals.find(item => item.id == goal_id)) {
                    // eslint-disable-next-line
                    const goal = storeGoals.find(item => item.id == goal_id);
                    if (goal.complete) {
                        history.push('/home')
                    }
                    goalData.id = goal_id;
                    goalData.name = goal.name;
                    goalData.description = goal.description;
                    goalData.deadline = goal.deadline;
                    goalData.category = goal.category_id;
                    goalData.picture = goal.picture;
                    setGoalData({...goalData})
                    if (goalData.picture === '') {
                        setGoalData(goalData);
                    }
                // Redirect to home page if the goal has been deleted
                } else {
                    history.push('/home')
                }
            }
                   
            // Fetch steps
            fetchGoalSteps(user.sub, token, goal_id).then(data => setSteps(data)).then(() =>{
                // Automatically scroll to the steps
                const nextSteps = document.getElementById('nextSteps');
                if (nextSteps) {
                    window.scrollTo(0, nextSteps.getBoundingClientRect().y);
                }    
            });

            // Fetch completed steps
            fetchCompletedSteps(user.sub, token, goal_id).then(data => setCompletedSteps(data));
        }
        // eslint-disable-next-line
      }, [token]);
    
    // Set Goal
    const HandleSetGoal = (event) => {
        event.preventDefault();
        var updateButton = document.getElementById('button-update');
        var updateSpinner = document.getElementById('spinner-update');
        updateButton.hidden = true;
        updateSpinner.hidden = false;
        setColor(colors.primary);
        setBtnDisabled(true);
        setGoalAlertHidden({success: true, error: true});
        
        if (goalData.name === '') {
            setColor(colors.error);
            setBtnDisabled(false);
            setAlertMessage('Please enter a name for your goal');
            setGoalAlertHidden({success: true, error: false});
            document.getElementById('name').focus();
            updateButton.hidden = false;
            updateSpinner.hidden = true;
            return
        }
        // Create a new goal without picture first
        const data = new FormData();
        data.append('name', goalData.name);
        data.append('description', goalData.description);
        data.append('deadline', goalData.deadline);
        data.append('category', goalData.category);
        data.append('picture', goalData.picture);
        // The api call will create a new goal and return the id
        updateGoal(user.sub, token, goal_id, data).then(obj => {goalData.id = obj.id; setGoalData({...goalData})})
        .then(() => {
            // Then upload the picture to Django which will upload the picture to cloudinary and update the url
            if (picture.file !== '') {
                const file = new FormData();
                file.append('picture', picture.file);
                uploadPicture(user.sub, token, goalData.id, file).then(data => {
                    // Update the goalData with the new picture url
                    goalData.picture = data.url;
                    setGoalData({...goalData});
                }).then(() => { 
                    setBtnDisabled(false);
                    setAlertMessage('Goal successfully updated');
                    setGoalAlertHidden({success: false, error: true});
                }).catch(err => {
                    setBtnDisabled(false);
                    setAlertMessage('Goal picture could not be updated');
                    setGoalAlertHidden({success: true, error: false});
                })
            }
        }).then(() => {
            setBtnDisabled(false);
            setAlertMessage('Goal successfully updated');
            setGoalAlertHidden({success: false, error: true});
            updateButton.hidden = false;
            updateSpinner.hidden = true;
            // Mark the goals as stale so that the store will fetch the new goal
            // eslint-disable-next-line
            store.dispatch({
                type: 'SET_GOALS_STALE',
                payload: true
            });
            
        }).catch(error => { 
            setBtnDisabled(false);
            setAlertMessage('Goal could not be updated');
            setGoalAlertHidden({success: true, error: false});
            updateButton.hidden = false;
            updateSpinner.hidden = true;
         });
    };

    // Delete Goal
    const HandleDelete = () => {
        setBtnDisabled(true);
        fetch(`${process.env.REACT_APP_API_ENDPOINT}/delete_goal/${user.sub}/${goalData.id}`, {
            method: 'DELETE',
            headers: {
                'mode': 'cors',
                'Authorization': `Bearer ${token}`,
                'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
            }
        // if status code is 200, redirect to home page
        }).then(res => {
            if (res.status === 200) {
                // Mark the goals as stale so that the store will remove this goal
                // eslint-disable-next-line
                store.dispatch({
                    type: 'SET_GOALS_STALE',
                    payload: true })
                history.push('/home')
            } else {
                setBtnDisabled(false);
                setAlertMessage('Goal could not be deleted');
                setGoalAlertHidden({success: true, error: false});
            }
        })
    }

    // Set Step
    const HandleSetStep = (event) => {
        event.preventDefault();
        setBtnDisabled(true);
        
        if (stepData.name === '') {
            setColor(colors.error);
            setBtnDisabled(false);
            return
        }
        
        var saveButton = document.getElementById('button-saveStep');
        var saveSpinner = document.getElementById('spinner-saveStep');
        saveButton.hidden = true;
        saveSpinner.hidden = false;

        // Create a new step
        const data = new FormData();
        data.append('name', stepData.name);
        data.append('description', stepData.description);
        data.append('deadline', stepData.deadline);
        // data.append('recurring', stepData.recurring);
        // The api call will create a new step and return the id
        createStep(user.sub, token, goal_id, data).then(obj => {stepData.id = obj.id; setStepData({...stepData})})
        .then(() => {
            setSteps(steps.concat({id:stepData.id, name:stepData.name, description:stepData.description, deadline:stepData.deadline, recurring:stepData.recurring, created_at:new Date().toISOString()}));
            setBtnDisabled(false);
            setColor(colors.primary);
            saveButton.hidden = false;
            saveSpinner.hidden = true;
            store.dispatch({
                type: 'SET_GOALS_STALE',
                payload: true
            });
            document.getElementById('stepModalClose').click();
        }).catch(error => { 
            setBtnDisabled(false);
            setColor(colors.primary);
            saveButton.hidden = false;
            saveSpinner.hidden = true;
        });
    };

    // Complete goal
    const HandleCompleteGoal = (e) => {
        e.preventDefault();
        setBtnDisabled(true);
        fetch(`${process.env.REACT_APP_API_ENDPOINT}/complete_goal/${user.sub}/${goalData.id}`, {
            method: 'POST',
            headers: {
                'mode': 'cors',
                'Authorization': `Bearer ${token}`,
                'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
            }
        // if status code is 200, redirect to home page
        }).then(res => {
            if (res.status === 200) {
                // Mark the goals as stale so that the store will remove this goal
                // eslint-disable-next-line
                store.dispatch({
                    type: 'SET_GOALS_STALE',
                    payload: true })
                // A modal will be opened which will redirect to home page
            } else {
                setBtnDisabled(false);
                setAlertMessage('Goal could not be completed');
                setGoalAlertHidden({success: true, error: false});
            }
        })
    };

    // Complete Step
    const HandleCompleteStep = (stepId) => {
        setBtnDisabled(true);
        var stepButton = document.getElementById(`button-${stepId}`);
        var stepSpinner = document.getElementById(`spinner-${stepId}`);
        stepButton.hidden = true;
        stepSpinner.hidden = false;
        fetch(`${process.env.REACT_APP_API_ENDPOINT}/complete_step/${user.sub}/${goalData.id}/${stepId}`, {
            method: 'POST',
            headers: {
                'mode': 'cors',
                'Authorization': `Bearer ${token}`,
                'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
            }
        // if status code is 200, remove the step from the steps array and add to completed steps array
        }).then(res => {
            if (res.status === 200) {
                var completed = steps.find(s => s.id === stepId);
                setSteps(steps.filter(s => s.id !== stepId));
                setCompletedSteps(completedSteps.concat(completed));
                store.dispatch({
                    type: 'SET_GOALS_STALE',
                    payload: true
                });
                setAlertMessage('Congratulations on completing that step!')
                setStepAlertHidden({success: false, error: true});
                setBtnDisabled(false);
            } else {
                setBtnDisabled(false);
                setAlertMessage('Step could not be completed');
                setStepAlertHidden({success: true, error: false});
                stepButton.hidden = false;
                stepSpinner.hidden = true;
            }
        })
    };

    // Reset Step data in new step modal
    const resetStepData = () => {
        stepData.name = '';
        stepData.description = '';
        stepData.deadline = goalData.deadline;
        setStepData({...stepData});
    };

    // -------------------------
    // COMPONENTS
    // -------------------------
    const PictureDiv = () => {
        return (
            <div className="jumbotron mb-3" style={{height:"300px"}}>
                <img src={ goalData.picture || placeholder } className="img-fluid" style={{height:"300px", width:"100%", objectFit:"cover"}} alt='goal'></img>
            </div>
        );
    };

    const CurrentSteps = (props) => {
        return (
            <>
                <hr className="mt-5 mb-5"/>
                <div className="d-flex">
                    <div className="flex-grow-1">
                    <h2 id="nextSteps">Next Bitesize Steps</h2>
                    </div>
                    <div className="float-end">
                    <button type="button" data-bs-toggle="modal" data-bs-target="#stepModal" className="btn btn-primary float-end" onClick={() => resetStepData()}>New Step</button>
                    </div>
                </div>
                    
                <SuccessAlert message={alertMessage} hideFunction={setStepAlertHidden} hidden={stepAlertHidden.success} />
                <ErrorAlert message={alertMessage} hideFunction={setStepAlertHidden} hidden={stepAlertHidden.error}/>

                <div className="m-2">
                    <div className="btn-group" role="group">
                        <button type="button" className="btn btn-light dropdown-toggle" data-bs-toggle="dropdown">
                            Order by 
                        </button>
                        <ul className="dropdown-menu">
                            <li>
                                <div onClick={() => setOrder(0)} className="dropdown-item">Name</div>
                            </li>
                            <li>
                                <div onClick={() => setOrder(1)} className="dropdown-item">Closest Deadline</div>
                            </li>
                            <li>
                                <div onClick={() => setOrder(2)} className="dropdown-item">Farthest Deadline</div>
                            </li>
                            <li>
                                <div onClick={() => setOrder(3)} className="dropdown-item">Most Recently Created</div>
                            </li>
                            <li>
                                <div onClick={() => setOrder(4)} className="dropdown-item">Least Recently Created</div>
                            </li>
                        </ul>
                    </div>
                    <div className="accordion accordion-flush" id="stepsAccordion">
                        {props.children}
                    </div>
                </div>
            </>
        );
    };

    const CompletedSteps = () => {
        return (
            <>
            <hr className="mt-5 mb-5"/>
            <div className="d-flex">
                <div className="flex-grow-1">
                  <h2>Completed Steps</h2>
                </div>
            </div>
            <div className="m-2">
                <div className="accordion accordion-flush" id="completedAccordion">
                    {   
                        (completedSteps.length>0) && sorted(completedSteps, order).map(step => (
                            <div className="accordion-item" key={step.id}>
                                <div className="accordion-header d-flex">
                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#completed-${step.id}`}>
                                        {step.name}
                                    </button>
                                </div>
                                <div id={`completed-${step.id}`} className="accordion-collapse collapse" data-bs-parent="#completedAccordion">
                                    <div className="accordion-body" style={{color:"gray"}}>
                                        <p>{step.description || 'No additional details'}</p>
                                        <small>Deadline: { getUserFriendlyDate(step.deadline) }</small>
                                    </div>
                                </div> 
                            </div>
                        ))
                    }
                </div>
            </div>
            </>
        );
    };

    const ConfirmDeleteModal = () => {
        return (
            <>
                <div className="modal fade" id="deleteModal" tabIndex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Delete Goal</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to delete this goal?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button disabled={btnDisabled} type="button" data-bs-dismiss="modal" className="btn btn-danger" onClick={() => HandleDelete()}>Delete</button>
                        </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    return ( 
        isAuthenticated &&
        <>
            <PictureDiv />
            <div className="container mobile">
                <SuccessAlert message={alertMessage} hidden={goalAlertHidden.success} hideFunction={setGoalAlertHidden}/>
                <ErrorAlert message={alertMessage} hidden={goalAlertHidden.error} hideFunction={setGoalAlertHidden}/>
                <div className="mb-3 d-flex">
                    <div className="flex-grow-1">
                    <h1>{goalData.name}</h1>
                    </div>
                    <div className="float-end">
                    <button onClick={() => history.push('/home')} type="button" className="btn btn-outline-secondary float-end">Back</button>
                    </div>
                </div>
                <form className="mb-3">
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label" style={{color:color}}>What is your goal? * (Be concise and specific)</label>
                        <input type="text" id="name" className="form-control" value={goalData.name|| ''} onChange={(event) => setGoalData({...goalData, name:event.target.value})} maxLength="64"/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="description" className="form-label">Any additional details?</label>
                        <input type="text" id="details" className="form-control" value={goalData.description|| ''} onChange={(event) => setGoalData({...goalData, description:event.target.value})}/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="deadline" className="form-label">When is the deadline? (Highly recommended: hold yourself accountable)</label>
                        <input type="date" className="form-control" value={goalData.deadline|| ''} onChange={(event) => setGoalData({...goalData, deadline:event.target.value})} id="date"/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="category" className="form-label">What category is your goal?</label>
                        <select id="category" className="form-select" value={goalData.category || 0} onChange={(event) => setGoalData({...goalData, category:event.target.value})}>
                            {
                                store.getState().categoriesReducer.categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))
                            }
                        </ select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="picture" className="form-label">Upload a picture to motivate yourself!</label>
                        <input type="file" id="picture" className="form-control" value={picture.name|| ''} onChange={(event) => setPicture({...picture, name:event.target.value, file: event.target.files[0]})} />
                    </div>
                    <div className="">
                        <button disabled={ btnDisabled } type="button" className="btn btn-primary" onClick={(event)=>HandleSetGoal(event)}>
                            <SpinnerButton id="update">Update Goal</SpinnerButton>
                        </button>
                        <button disabled={ btnDisabled } type="button" className="ms-3 btn btn-success" data-bs-toggle="modal" data-bs-target="#completeModal" onMouseDown={(e) => party.confetti(e.target)} onClick={(event)=>HandleCompleteGoal(event)}>Completed</button>
                    </div>
                    
                </form>
                <CurrentSteps>
                {   
                    steps && steps.length>0 && sorted(steps, order).map(step => (
                        <div className="accordion-item" key={step.id}>
                            <div className="accordion-header d-flex">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#step-${step.id}`}>
                                    {step.name}
                                </button>
                                <button id={`complete-${step.id}`} type="button" className="btn btn-outline-success align-self-center" onMouseDown={(e) => party.confetti(document.getElementById(`complete-${step.id}`))} onClick={() => HandleCompleteStep(step.id)}>
                                    <SpinnerButton id={step.id} bootstrapTheme="success">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                        </svg>
                                    </SpinnerButton>
                                </button>
                            </div>
                            <div id={`step-${step.id}`} className="accordion-collapse collapse" data-bs-parent="#stepsAccordion">
                                <div className="accordion-body">
                                    <p>{step.description || 'No additional details'}</p>
                                    <small>Deadline: { new Date(step.deadline).toUTCString().substr(0,16) || 'No deadline set'}</small>
                                </div>
                            </div> 
                        </div>
                    ))
                }
                {
                    steps && steps.length === 0 && (
                        <div className="text-center mt-5">
                            <p>Click on "New Step" to set up the next step, or on "Completed" if you have reached your goal!</p>
                        </div>
                    ) 
                }
                </CurrentSteps>
                <CompletedSteps />
                
                {/* Delete Goal Button */}
                <hr className="mt-5 mb-5"/>
                <button type="button" className="btn btn-danger mb-5" data-bs-toggle="modal" data-bs-target="#deleteModal">Delete Goal</button>
            </div>
            
            {/* <NewStepModal /> */}
            {/* --------------------------------------------------------------------------------------------------------- */}
            {/* Something really weird is going on here, and I need to find out what exactly causes it.
                When This part and the new step modal are put in separate functions like the rest in this page,
                onClick stops working inside the modals. Even more bizarre, other modals work fine. I have gone so far
                as to copy and paste the working modals, test a dummy button which works, but when I make the single change 
                of modifying the id of the modal to be triggered by the right button, onClick in that modal stops working */}
            <div className="modal fade" id="stepModal" tabIndex="-1" aria-labelledby="stepModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <ErrorAlert message={alertMessage} hidden={goalAlertHidden.error} hideFunction={setGoalAlertHidden}/>
                        <div className="modal-header">
                            <h5 className="modal-title" id="stepModalLabel">New Step</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="container">
                                <div className="mb-3 row">
                                    <div className="col-9">
                                        <h3>Create A Bitesize Step</h3>
                                    </div>
                                </div>
                                <form>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label" style={{color:color}}>What is the next step? * <br/><small style={{color:"gray"}}>Tip: Make it a small, bitesize step; if it can be broken down into multiple steps, break it down!</small></label>
                                        <input type="text" id="name" className="form-control" value={stepData.name|| ''} onChange={(event) => setStepData({...stepData, name:event.target.value})} maxLength="64"/>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label">Any additional details?</label>
                                        <input type="text" id="description" className="form-control" value={stepData.description|| ''} onChange={(event) => setStepData({...stepData, description:event.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="deadline" className="form-label">When is the deadline?<br/><small style={{color:"gray"}}>Highly recommended: hold yourself accountable</small></label>
                                        <input type="date" className="form-control" value={stepData.deadline || ''} onChange={(event) => setStepData({...stepData, deadline:event.target.value})} id="deadline"/>
                                    </div>   
                                </form>
                                
                            </div>
                            
                        </div>
                        <div className="modal-footer">
                            <button type="button" id="stepModalClose" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button className="btn btn-primary" onClick={(e) => HandleSetStep(e)}><SpinnerButton id="saveStep">Save Step</SpinnerButton></button>
                        </div>
                    </div>
                </div>
            </div>
            {/* --------------------------------------------------------------------------------------------------------- */}
            
            <ConfirmDeleteModal />

            {/* <SuccessModal /> */}
            {/* --------------------------------------------------------------------------------------------------------- */}
            {/* See comment above as to why this cannot be its separate function. Same problem happening here.
                Surprisingly, ConfirmDeleteModal which has also an onClick attribute works fine. */}
            <div className="modal fade" data-bs-backdrop="static" data-bs-keyboard={false} id="completeModal" tabIndex="-1" aria-labelledby="completeModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="successModalLabel">Goal Completed</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>Congratulations on completing that goal!</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-success" data-bs-dismiss="modal" onClick={() => history.push('/home')}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* --------------------------------------------------------------------------------------------------------- */}
        </>
    );
};

export default Goal;