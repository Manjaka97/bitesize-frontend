// import React from 'react';

export const SuccessAlert = (props) => {
    return (
        <div id="success" className="alert alert-success alert-dismissible fade show" role="alert" hidden={props.hidden}>
            { props.message }
            <button type="button" className="btn-close" aria-label="Close" onClick={() => props.hideFunction({success:true, error:true})}></button>
        </div>
    );
};

export const ErrorAlert = (props) => {
    return (
        <div id="error" className="alert alert-danger alert-dismissible fade show" role="alert" hidden={props.hidden}>
            { props.message }
            <button type="button" className="btn-close" aria-label="Close" onClick={() => props.hideFunction({success:true, error:true})}></button>
        </div>
    );
}