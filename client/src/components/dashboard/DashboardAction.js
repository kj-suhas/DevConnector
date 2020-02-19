import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

const DashboardAction = () => {
	return (
		<Fragment>
			<div className='dash-buttons'>
				<Link to='/edit-profile' className='btn btn-dark'>
					<i className='fas fa-user-circle text-primary' /> Edit Profile
				</Link>
				<Link to='/add-experience' className='btn btn-dark'>
					<i className='fab fa-black-tie text-primary' /> Add Experience
				</Link>
				<Link to='/add-education' className='btn btn-dark'>
					<i className='fas fa-graduation-cap text-primary' /> Add Education
				</Link>
			</div>
		</Fragment>
	);
};

export default DashboardAction;
