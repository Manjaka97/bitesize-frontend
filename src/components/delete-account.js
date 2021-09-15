import React from 'react';

const DeleteAccount = () => {
    return (
        <div className="container bg-light">
            <h3 className="mt-3 mb-3 text-center">Follow these steps to delete your account. (Warning: This cannot be undone)</h3>
            <div className="d-flex flex-wrap justify-content-evenly">
                <div className="card delete-card">
                    <img className="card-img-top h-75" src='https://res.cloudinary.com/elvnosix/image/upload/v1631739916/bitesize/delete/delete1.png' alt="delete1"/>
                    <div className="card-footer" style={{backgroundColor:"#FEFEFE", height:"15vh"}}>
                        <p className="text-center card-title">
                            1. Log in to your account and click on Profile.
                        </p>
                    </div>
                </div>
                
                <div className="card delete-card">
                    <img className="card-img-top h-75" src='https://res.cloudinary.com/elvnosix/image/upload/v1631739916/bitesize/delete/delete2.png' alt="delete2"/>
                    <div className="card-footer" style={{backgroundColor:"#FEFEFE", height:"15vh"}}>
                        <p className="text-center card-title">
                            2. Scroll to the bottom and click on Delete Account.
                        </p>
                    </div>
                </div>

                <div className="card delete-card">
                    <img className="card-img-top h-75" src='https://res.cloudinary.com/elvnosix/image/upload/v1631739916/bitesize/delete/delete3.png' alt="delete3"/>
                    <div className="card-footer" style={{backgroundColor:"#FEFEFE", height:"15vh"}}>
                        <p className="text-center card-title">
                            3. Confirm to delete your account.
                        </p>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default DeleteAccount;