import React from 'react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { SuccessAlert, ErrorAlert } from '../utils/alerts'
import { ProSidebar, SidebarHeader, SidebarContent, Menu} from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';
import sorted from '../utils/sorter';
import { useStore } from 'react-redux'
import { fetchGoals } from '../utils/api-calls'
import { getRelativeDate, missedDeadline } from '../utils/date'
import party from 'party-js'

const Sidebar = (props) => {
    const [ collapsed, setCollapsed ] = useState(false);
    const [ steps, setSteps ] = useState([]);
    const [ token, setToken ] = useState('');
    const [ user, setUser ] = useState({});
    const [ goals, setGoals ] = useState([]);
    const [ order, setOrder ] = useState(1);
    const [ goal, setGoal ] = useState(0);
    const [ stepAlertHidden, setStepAlertHidden ] = useState({success: true, error: true})
    const store = useStore();
    let history = useHistory();

    // useEffect to set the state from the props
    useEffect(() => {
        setSteps(props.steps);
        setToken(props.token);
        setUser(props.user);
        setGoals(props.goals)
    // eslint-disable-next-line
    }, [props.steps, props.token, props.user]);

    // Toggles the sidebar
    const HandleCollapse = () => {
        setCollapsed(!collapsed);
    };

    // Complete the clicked step from the sidebar
    const HandleCompleteStep = (e, goalId, stepId) => {
        fetch(`${process.env.REACT_APP_API_ENDPOINT}/complete_step/${user.sub}/${goalId}/${stepId}`, {
            method: 'POST',
            headers: {
                'mode': 'cors',
                'Authorization': `Bearer ${token}`,
                'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
            }
        // if status code is 200, remove the step from the steps array and dispatch the goals with updated steps
        }).then(res => {
            if (res.status === 200) {
                // remove the step from the steps array
                e.target.checked = false;
                document.getElementById(`stepName-${stepId}`).classList.remove('text-decoration-line-through');
                // eslint-disable-next-line
                setSteps(steps.filter(s => s.id != stepId));
                // fetch the updated goals and dispatch the store
                fetchGoals(user.sub, token).then(data => {
                    store.dispatch({
                        type: 'SET_GOALS',
                        payload: data
                    });
                    store.dispatch({
                        type: 'SET_GOALS_STALE',
                        payload: false
                    });
                });
                setStepAlertHidden({success: false, error: true});
            } else {
                setStepAlertHidden({success: true, error: false});
            }
        })
    };

    // Determines if user clicked the name of the step or the checkbox
    const HandleClick = (e) => {
        var step_id = e.target.id.split('-')[1];
        // if user clicks on a step name, go to the goal of that step
        if (e.target.tagName !== 'INPUT') {
            // eslint-disable-next-line
            var step = steps.find(step => step.id == step_id)
            if (step) {
                history.push(`/goal/${step.goal_id}`);
            }
        // if user clicks on the step checkbox, complete the step
        } else {
            step_id = e.target.id.split('-')[1];
            // eslint-disable-next-line
            var step = steps.find(step => step.id == step_id)
            if (step) {
                e.target.checked = true;
                document.getElementById(`stepName-${step_id}`).classList.add('text-decoration-line-through');
                HandleCompleteStep(e, step.goal_id, step_id);
            }
        }
    }

    // Toggle button
    if (collapsed) {
        return (
            <div className="container-fluid">
                <button className="btn btn-default btn-sm" onClick={() => {HandleCollapse()}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fillRule="currentColor" className="bi bi-list-task" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M2 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V3a.5.5 0 0 0-.5-.5H2zM3 3H2v1h1V3z"/>
                            <path d="M5 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM5.5 7a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9zm0 4a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9z"/>
                            <path fillRule="evenodd" d="M1.5 7a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5V7zM2 7h1v1H2V7zm0 3.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H2zm1 .5H2v1h1v-1z"/>
                        </svg>
                </button> 
            </div>
            
        );  
    }

    const HeaderButtons = () => {
        return (
            <>
                <div className="d-flex mb-2 justify-content-center" >
                    <div className="btn-group" role="group" >

                        {/* Order by date */}
                        <div className="btn-group" role="group">
                            <button type="button" className="btn dropdown-toggle" data-bs-toggle="dropdown">
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

                        {/* Filter by goal */}
                        <div className="btn-group" role="group">
                            <button type="button" className="btn dropdown-toggle" data-bs-toggle="dropdown">
                                Goal
                            </button>
                            <ul className="dropdown-menu">
                                <li>
                                    <div onClick={() => setGoal(0)} className="dropdown-item">All</div>
                                </li>
                                {
                                    goals && goals.length > 0 && goals.map(g => {
                                        return (
                                            <li key={g.id}>
                                                <div onClick={() => setGoal(g.id)} className="dropdown-item">{g.name}</div>
                                            </li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    </div>     
                </div>          
            </>
        )
    };


    return (
        <>
        <ProSidebar collapsed={collapsed} width="300px" style={{height:"110vh"}}>
            <SidebarHeader style={{backgroundColor:store.getState().colorReducer.grayBg}}>
                <div className="d-flex pt-2 align-items-start" >
                    <div className="">
                        <button className="btn btn-default btn-sm" onClick={() => {HandleCollapse()}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-double-left" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                                <path fillRule="evenodd" d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                            </svg>
                        </button>
                    </div>
                    <div className="flex-grow-1 pt-1" style={{color: "black"}}><p className="text-center font-weight-bold me-4">Next Bitesize Steps {steps && steps.length > 0 && `(${steps.length})`}</p></div>
                </div>
            </SidebarHeader>
            <SidebarContent style={{backgroundColor:store.getState().colorReducer.grayBg}} >
                <SuccessAlert message="Congratulations on completing that step!" hideFunction={setStepAlertHidden} hidden={stepAlertHidden.success} />
                <ErrorAlert message="Step could not be completed" hideFunction={setStepAlertHidden} hidden={stepAlertHidden.error}/>
                <Menu iconShape="square">
                <HeaderButtons />
                    <div id="nextSteps" className="d-flex flex-column" style={{overflowY:"auto", height:"70vh"}}>
                        {
                            // eslint-disable-next-line
                            steps && steps.length > 0 && sorted(steps, order).map(step => {
                                if ((goal === 0) || (goal && goal === step.goal_id)) {
                                    return (
                                        <button className="btn sidebar-link" key={step.id} id={`sidebar-${step.id}`} onClick={(e)=>HandleClick(e)}>
                                                <div id={`sidebarItem-${step.id}`} className="d-flex align-items-baseline ps-3 pe-3 pb-1">
                                                    <div id={`sidebarBullet-${step.id}`} className="me-2">
                                                        <svg id={`stepSvg-${step.id}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={store.getState().colorReducer.primary} className="bi bi-dash" viewBox="0 0 16 16">
                                                            <path id={`stepPath-${step.id}`} d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/>
                                                        </svg>
                                                    </div>
                                                    <p className="flex-grow-1 text-start text-wrap text-break pe-4 " id={`stepName-${step.id}`}>{step.name}<br/><small style={{color: `${(missedDeadline(step.deadline) && 'red') || 'gray'}` }}>Due: {(step.deadline && getRelativeDate(step.deadline)) || 'No Deadline Set'}</small></p>
                                                    <div>
                                                        <input id={`checkbox-${step.id}`} type="checkbox" onMouseDown={(e) => party.confetti(e.target)} className="checkbox-round"/>
                                                    </div>
                                                </div>
                                        </button>
                                    );
                                }
                            })
                        }          
                    </div>
                </Menu>
            </SidebarContent>
        </ProSidebar>
        </>
    );
};

export default Sidebar;