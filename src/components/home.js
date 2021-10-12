import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import generateToken from './authentication/auth-token'
import sorted from './utils/sorter'
import { useStore } from 'react-redux';
import Sidebar from './bars/sidebar';
import Font from 'react-font';
import { fetchGoals, fetchSteps, fetchCategories, syncUser } from './utils/api-calls'
import { getUserFriendlyDate, getRelativeDate, missedDeadline } from './utils/date'

const Home = () => {
    const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [ goals, setGoals ] = useState([]);
    const [ steps, setSteps ] = useState([]);
    const [ token, setToken ] = useState('');
    const [ category, setCategory ] = useState(0);
    const [ order, setOrder ] = useState(3);
    const store = useStore();
    let history = useHistory();
    
    // Initial useEffect
    useEffect(() => {
        // Fetch goals from store and subscribe to changes
        store.subscribe(() => {
            var storeGoals = store.getState().goalsReducer.goals;
            if (storeGoals && storeGoals.length > 0) {
                setGoals(storeGoals);
            }
        });

        // Check if categories have been dispatched in the store
        var storeCategories = store.getState().categoriesReducer.categories;
        if (!storeCategories || storeCategories.length === 0) {
            // Else fetch categories then dispatch to the store
            fetchCategories().then(data => {
                store.dispatch({type: 'SET_CATEGORIES', payload: data});
            })
        }

        // Make the body of this page unscrollable unless mobile
        // window.scrollTo(0, 0);
        window.scrollTo(0, document.getElementById("navbar").getBoundingClientRect().y);
        const isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;
        if (isMobile) {
            document.body.style.overflow = 'auto';
        } else {
            document.body.style.overflow = 'hidden';
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

    // useEffect to sync user data and fetch goals and steps
    useEffect(() => {
        if (isAuthenticated && token !== '') {
            // Email comes from the auth0 profile so it is checked for changes
            const data = new FormData();
            data.append('name', user.nickname);
            data.append('email', user.email);
            data.append('picture', user.picture);
            const storeUser = store.getState().authReducer.user;
            // If the user is not in the store or email is different then sync the user and dispatch to the store
            if (!('id' in storeUser) || storeUser.email !== user.email) {
                // Make an api call sync and fetch the user data
                syncUser(user.sub, token, data).then(data => {
                    store.dispatch({type: 'SET_USER_PROFILE', payload: data});
                });
                // Otherwise we just use the user data from the store
            }
            
            // Make an API call to fetch the user's goals
            if (store.getState().goalsReducer.stale){
                fetchGoals(user.sub, token).then(goals => {
                    setGoals(goals);
                    store.dispatch({type: 'SET_GOALS', payload: goals});
                    store.dispatch({type: 'SET_GOALS_STALE', payload: false});
                });                
            } else {
                setGoals(store.getState().goalsReducer.goals);
            }
            // Make an API call to fetch the users' steps
            fetchSteps(user.sub, token).then(data => setSteps(data));
        }
        // eslint-disable-next-line
    }, [token]);

    // Get the category image
    const getGoalPic = (category) => {
        if (store.getState().categoriesReducer.categories.length > 0) {
            return store.getState().categoriesReducer.categories.find(cat => cat.id === category).picture;
        }
        return "https://res.cloudinary.com/elvnosix/image/upload/v1628697968/bitesize/misc/wait-loader_wj6o1k.png"
    }

    // -------------------------------------------
    // COMPONENTS
    // -------------------------------------------
    const HeaderButtons = () => {
        return (
            <>
                <div className="d-flex mb-4 pt-2 mt-2">
                    <div className="btn-group me-auto" role="group">
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
                        <div className="btn-group" role="group">
                            <button type="button" className="btn btn-light dropdown-toggle" data-bs-toggle="dropdown">
                                Category
                            </button>
                            <ul className="dropdown-menu">
                                <li>
                                    <div onClick={() => setCategory(0)} className="dropdown-item">All</div>
                                </li>
                                {
                                    store.getState().categoriesReducer.categories.map(cat => {
                                        return (
                                            <li key={cat.id}>
                                                <div onClick={() => setCategory(cat.id)} className="dropdown-item">{cat.name}</div>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                    <div className="mt-1">
                        <button className="btn btn-primary" onClick={() => history.push('/new_goal')}>
                            <div className="d-flex">
                                <div className="">
                                    {/* <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
                                    </svg> */}
                                </div>
                                <div className="">
                                    <span className="">New Goal</span>
                                </div>
                            </div>
                        </button>
                    </div>       
                </div>          
            </>
        )
    };

    const GoalCards = () => {
        return (
            <>
                <div id="goalCards" className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4 mt-1 mb-5 pb-5" style={{maxHeight: "75vh", overflowY: "auto", paddingBottom: "5vh"}}>
                    {
                        // Create a column with a card for each user goal
                        // eslint-disable-next-line
                            goals && goals.length > 0 && sorted(goals, order).map(goal => {
                                var ref = '/goal/'+ goal.id;
                                if (category === 0 || goal.category_id === category) {
                                    return (
                                        <div key={ goal.id } className="col">
                                            <Link to={ ref } style={{color: 'black',textDecoration: 'none'}}>
                                                <div className="card h-100">
                                                    <div className="ratio ratio-16x9">
                                                        <img src={ goal.picture || getGoalPic(goal.category_id) } className="card-img-top" alt="goal" />
                                                    </div>
                                                    <div className="card-body" style={{backgroundColor:"#FEFEFE"}}>
                                                        <div className="d-flex align-items-start justify-content-between">
                                                            <div className="card-title">
                                                                { goal.name }
                                                            </div>
                                                            <div className="ms-2 badge bg-primary">
                                                                { goal.total_steps_count - goal.current_steps_count }/{goal.total_steps_count}
                                                            </div>
                                                        </div>
                                                        <p className="card-subtitle" 
                                                        style={{fontSize:".8rem", color: `${(missedDeadline(goal.deadline) && 'red') || 'gray'}` }}>
                                                            Deadline: {  `${getUserFriendlyDate(goal.deadline)} ${(goal.deadline && `(${getRelativeDate(goal.deadline)})`) || ''}` }
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                }
                            })
                    }
                </div>
            
            </>
        )
    };

    if (!isAuthenticated) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{height:"100vh"}}>
                <div className="spinner-border mb-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div>
                    Please make sure you are logged in to continue. 
                    <br/>
                    If you are already logged in, please make sure you have cookies enabled.
                    <br/>
                    This website uses cookies only for login and authentication.
                    <br/>
                    {`You can do so by going to settings > privacy and security > cookies, and enabling cookies and cross-site tracking`}
                </div>
            </div>
        );
    }

    return (
        <>  
                <div className="d-flex" style={{height: "100%", overflowY: "hidden"}}>
                    <div className="min-vh-75">
                        <Sidebar user={user || {}} token={token || ''} steps={steps || []} goals={goals || []}/>
                    </div>
                    <div className="flex-grow-1">
                        <div className="container mt-3">
                                <div className="">
                                    <Font family="Arsenal" weight={400} italic={true}>
                                        <p className="font-italic text-center" style={{fontSize:"1.2rem", color:store.getState().colorReducer.primary}}>{store.getState().userReducer.user.encouragement || ''}</p>
                                    </Font>
                                </div>
                                <hr className="w-50 ms-auto me-auto"/>
                            <div className="container content-row">
                                <HeaderButtons />
                                <GoalCards />
                                { 
                                    isAuthenticated && goals && goals.length === 0 && (
                                        <div className="text-center">
                                            <p>You currently have no goals set. Click on "New Goal" to get started!</p>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                    
                </div>
        </>
    );
};

export default Home;