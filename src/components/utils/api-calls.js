// Make an API call to fetch user goals
export const fetchGoals = async(sub, token) => {     
    return fetch(`${process.env.REACT_APP_API_ENDPOINT}/get_goals/${sub}`, {
        method: 'GET',
        headers: {
            'mode': 'cors',
            'Authorization': `Bearer ${token}`,
            'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
        }
    }).then(response => response.json()).then(goals => goals);
};

export const fetchGoal = async(sub, token, goal_id) => {
    return fetch(`${process.env.REACT_APP_API_ENDPOINT}/get_goal/${sub}/${goal_id}`, {
        method: 'GET',
        headers: {
            'mode': 'cors',
            'Authorization': `Bearer ${token}`,
            'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
        }
    }).then(response => response.json()).then(goal => goal);
};

export const fetchCompletedGoals = async(sub, token) => {
    return fetch(`${process.env.REACT_APP_API_ENDPOINT}/get_completed_goals/${sub}`, {
        method: 'GET',
        headers: {
            'mode': 'cors',
            'Authorization': `Bearer ${token}`,
            'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
        }
    }).then(response => response.json()).then(goals => goals);
};

export const fetchCompletedGoalsPaginated = async(sub, token, page, num_per_page) => {
    return fetch(`${process.env.REACT_APP_API_ENDPOINT}/get_completed_goals_paginated/${sub}/${page}/${num_per_page}`, {
        method: 'GET',
        headers: {
            'mode': 'cors',
            'Authorization': `Bearer ${token}`,
            'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
        }
    }).then(response => response.json()).then(goals => goals);
};

export const fetchSteps = async(sub, token) => {
    return fetch(`${process.env.REACT_APP_API_ENDPOINT}/get_user_steps/${sub}`, {
            method: 'GET',
        headers: {
            'mode': 'cors',
            'Authorization': `Bearer ${token}`,
            'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
        }
    }).then(response => response.json()).then(steps => steps);
};

export const fetchGoalSteps = async(sub, token, goal_id) => {
    return fetch(`${process.env.REACT_APP_API_ENDPOINT}/get_steps/${sub}/${goal_id}`, {
        method: 'GET',
        headers: {
            'mode': 'cors',
            'Authorization': `Bearer ${token}`,
            'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
        }
    }).then(response => response.json()).then(steps => steps);
};

export const fetchCompletedSteps = async(sub, token, goal_id) => {
    return fetch(`${process.env.REACT_APP_API_ENDPOINT}/get_completed_steps/${sub}/${goal_id}`, {
        method: 'GET',
        headers: {
            'mode': 'cors',
            'Authorization': `Bearer ${token}`,
            'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
        }
    }).then(response => response.json()).then(steps => steps);
};

export const fetchCategories = async() => {
    return fetch(`${process.env.REACT_APP_API_ENDPOINT}/api/categories`, {
        method: 'GET',
        headers: {
            'mode': 'cors',
        }
    }).then(response => response.json()).then(data => data);
};

export const updateGoal = async(sub, token, goal_id, data) => {
    return fetch(`${process.env.REACT_APP_API_ENDPOINT}/update_goal/${sub}/${goal_id}`, {
        method: 'POST',
        headers: {
            'mode': 'cors',
            'Authorization': `Bearer ${token}`,
            'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
        },
        body: data
    }).then(response => response.json()).then(obj => obj);
};

export const uploadPicture = async(sub, token, goal_id, file) => {
    return fetch(`${process.env.REACT_APP_API_ENDPOINT}/upload_picture/${sub}/${goal_id}`, {
        method: 'POST',
        headers: {
            'Encoding': 'multipart/form-data',
            'mode': 'cors',
            'Authorization': `Bearer ${token}`,
            'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
        },
        body: file
    }).then(res => {
        if (res.status === 201) {
            return res.json();
        } else {
            return Promise.reject(new Error());
        }
    }).then(data => data);
};

export const createStep = async(sub, token, goal_id, data) => {
    return fetch(`${process.env.REACT_APP_API_ENDPOINT}/create_step/${sub}/${goal_id}`, {
        method: 'POST',
        headers: {
            'mode': 'cors',
            'Authorization': `Bearer ${token}`,
            'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
        },
        body: data
    }).then(response => response.json()).then(step => step);
};

export const syncUser = async(sub, token, data) => {
    return fetch(`${process.env.REACT_APP_API_ENDPOINT}/sync_and_fetch_user/${sub}`, {
        method: 'POST',
        headers: {
            'mode': 'cors',
            'Authorization': 'Bearer ' + token,
            'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
        },
        body: data
    }).then(response => response.json()).then(user => user)
};

export const fetchProfile = async(sub, token) => {
    return fetch(`${process.env.REACT_APP_API_ENDPOINT}/get_profile/${sub}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'mode': 'cors',
            'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
        }
      }
    ).then(response => response.json()).then(data => data)
};

export const deleteProfile = async(sub, token) => {
    return fetch(`${process.env.REACT_APP_API_ENDPOINT}/delete_profile/${sub}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'mode': 'cors',
            'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
        }
    }).then(response => response)
};

export const fetchProfilePicture = async(sub, token) => {
    return fetch(`${process.env.REACT_APP_API_ENDPOINT}/get_profile_picture/${sub}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'mode': 'cors',
            'X-CSRFToken': document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, "$1")
        }
      }
    ).then(response => response.json()).then(data => data)
}