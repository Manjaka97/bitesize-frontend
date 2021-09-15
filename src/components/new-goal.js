import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useHistory } from 'react-router-dom';
import generateToken from './authentication/auth-token';
import { useStore } from 'react-redux'
import { ErrorAlert } from './utils/alerts';
import { uploadPicture } from './utils/api-calls';

const NewGoal = () => {  
    const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [ token, setToken ] = useState('');
    const [ goalData, setGoalData ] = useState({id: '', name: '', description: '', deadline: '', category: 1, picture: ''});
    const [ pictureFile, setPictureFile ] = useState('');
    const [ btnDisabled, setBtnDisabled ] = useState(false);
    const [ goalAlertHidden, setGoalAlertHidden ] = useState(true)
    const store = useStore();
    const colors = store.getState().colorReducer;
    const [ color, setColor ] = useState(colors.primary);
    let history = useHistory();

    // useEffect to fetch categories from the store
    useEffect(() => {
        // Check if categories have been dispatched in the store
        var storeCategories = store.getState().categoriesReducer.categories;
        if (!storeCategories || storeCategories.length === 0) {
            // Else fetch categories then dispatch to the store
            fetch(`${process.env.REACT_APP_API_ENDPOINT}/api/categories`, {
                method: 'GET',
                headers: {
                    'mode': 'cors',
                }
            }).then(response => response.json()).then(data => {
                store.dispatch({type: 'SET_CATEGORIES', payload: data});
            })
        }

        // Enable scrolling
        document.body.style.overflow = 'auto';
        // eslint-disable-next-line
    }, []);

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

    // Set goal and make api call to create goal
    const HandleSetGoal = (event) => {
        event.preventDefault();
        setColor(colors.primary);
        setBtnDisabled(true);
        setGoalAlertHidden(true);
        
        if (goalData.name === '') {
            setColor(colors.error);
            setBtnDisabled(false);
            setGoalAlertHidden(false);
            document.getElementById('name').focus();
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
        fetch(`${process.env.REACT_APP_API_ENDPOINT}/create_goal/${user.sub}`, {
            method: 'POST',
            headers: {
                'mode': 'cors',
                'Authorization': `Bearer ${token}`,
                'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
            },
            body: data
        }).then(response => response.json()).then(obj => {goalData.id = obj.id; setGoalData({...goalData});})
        .then(() => {
            // Then upload the picture to Django which will upload the picture to cloudinary and update the url
            if (pictureFile !== null && pictureFile !== '') {
                const file = new FormData();
                file.append('picture', pictureFile);
                
                // Finally go to the new goal page
                uploadPicture(user.sub, token, goalData.id, file).then(() => {
                    // Set goals as stale in the store to trigger a fetch for the new goal
                    // eslint-disable-next-line
                    store.dispatch({
                        type: 'SET_GOALS_STALE',
                        payload: true
                    })
                    // Just go to the new goal page without uploading the picture
                    history.push('/goal/'+goalData.id);
                }).catch(() => setGoalAlertHidden(false));
            }
            else {
                // Set goals as stale in the store to trigger a fetch for the new goal
                // eslint-disable-next-line
                store.dispatch({
                    type: 'SET_GOALS_STALE',
                    payload: true
                })
                // Just go to the new goal page without uploading the picture
                history.push('/goal/'+goalData.id);
            }
        // Update the goal with the new picture url
        }).catch(() => setGoalAlertHidden(false));
    };

    return ( 
        isAuthenticated &&
        <div className="container mt-3 mobile">
            <ErrorAlert hidden={goalAlertHidden} message="Please give a name to your goal" />
            <div className="mb-3 row">
                <div className="col">
                <h1>Set A Goal</h1>
                </div>
                <div className="col">
                <button onClick={() => history.push('/home')} type="button" className="btn btn-outline-secondary float-end">Back</button>
                </div>
            </div>
            <form>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label" style={{color:color}}>What is your goal? * (Be concise and specific)</label>
                    <input type="text" id="name" className="form-control" value={goalData.name} onChange={(event) => setGoalData({...goalData, name:event.target.value})} maxLength="64" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Any additional details?</label>
                    <input type="text" id="name" className="form-control" value={goalData.description} onChange={(event) => setGoalData({...goalData, description:event.target.value})} />
                </div>
                <div className="mb-3">
                    <label htmlFor="deadline" className="form-label">When is the deadline? (Highly recommended: hold yourself accountable)</label>
                    <input type="date" className="form-control" value={goalData.deadline} onChange={(event) => setGoalData({...goalData, deadline:event.target.value})} id="date" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="category" className="form-label">What category is your goal?</label>
                    <select id="category" className="form-select" value={goalData.category.id} onChange={(event) => setGoalData({...goalData, category:event.target.value})}>
                        {
                            store.getState().categoriesReducer.categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))
                        }
                    </ select>
                </div>
                <div className="mb-3">
                    <label htmlFor="picture" className="form-label">Upload a picture to motivate yourself!</label>
                    <input type="file" id="picture" className="form-control" value={goalData.picture} onChange={(event) => {setGoalData({...goalData, picture:event.target.value}); setPictureFile(event.target.files[0]);}} />
                </div>
                <button disabled={ btnDisabled } type="submit" className="btn btn-primary" onClick={(event)=>HandleSetGoal(event)}>Set Goal</button>
            </form>
        </div>
    );
};

export default NewGoal;