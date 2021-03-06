import React, { Component } from 'react';
import './css/AppCont.scss';
import { IndexLink, Link } from 'react-router';
import requests from './requests';
import pubSub from 'pubsub-js'
import classnames from 'classnames';

// Main container component components inside "body' of index component
// Includes the side navigation bar and a content-body div where each children component
// or module of application is rendered.
class AppCont extends Component {
	constructor(props){
			super(props);
			this.state = { 
				patientBroadCast: pubSub.subscribe("PATI SEL", function(msg, data) {
				 	this.setState({ selectedPatient: data });
				}.bind(this)),
				selectedPatient:sessionStorage.currentPatientName,
				role:"",
				userUUID:"",
				name:"",
			};
		}

	componentDidMount() {
		if(requests.whoami().then){
			requests.whoami().then((res) => {
				this.setState(res);
			})
		} else {
			this.setState(requests.whoami())
		}
	}

	componentWillUnmount() {
		pubSub.unsubscribe(this.state.patientBroadCast);
	}

	render() {
		var listShow = classnames({"show":this.state.selectedPatient });
		return (
			<div id="AppContainer">
				{ this.state.userUUID && ( <div style={{height:"100%"}}>
					<div id="navMenu">
						<ul id="menuList">
							{ this.state.role === "Doctor" && (
								<ul id="menuList">
									<li>
										<IndexLink to="/Schedule" activeClassName="active" activeStyle={{fontWeight: 'bold'}}>Schedule</IndexLink>
									</li>
									<li>
										<Link to="/Notifications" activeClassName="active" activeStyle={{fontWeight: 'bold'}}>Notifications</Link>
									</li>
									<li>
										<Link to="/Home_Doc" activeClassName="active" activeStyle={{fontWeight: 'bold'}}>Patients</Link>
									</li>
									<li className="nestedHeaders">
										<ul>
											<li className="main right-align">
												Patient: {this.state.selectedPatient}
											</li>
											<li className={"sub right-align " + listShow}>
												<ul>
													<li>
														<Link to={"/Dashboard?id="+sessionStorage.currentPatient} activeClassName="active" activeStyle={{fontWeight: 'bold'}}>Dashboard</Link>
													</li>
													<li>
														<Link to={"/Documents?id="+sessionStorage.currentPatient} activeClassName="active" activeStyle={{fontWeight: 'bold'}} >Documents</Link>
													</li>
												</ul>
											</li>
										</ul>
									</li>
								</ul>
							)}
							{ this.state.role === "Patient" && (
								<ul id="menuList">
									<li>
										<Link to={"/Dashboard"} activeClassName="active" activeStyle={{fontWeight: 'bold'}}>Dashboard</Link>
									</li>
									<li>
										<Link to={"/Documents"} activeClassName="active" activeStyle={{fontWeight: 'bold'}}>Documents</Link>
									</li>
								</ul>
							)}
						</ul>
					</div>
					<div id="content-body">
						{this.props.children}
					</div> 
				</div> )}
			</div>
		)
	}
}

export default AppCont;
