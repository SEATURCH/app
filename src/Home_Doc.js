import React, { Component } from 'react';
import { Link } from 'react-router';
import requests from './requests';
import moment from 'moment'
import classnames from 'classnames'
import './css/Home_Doc.scss';
import Comp from './Auth/CustomComp.js'

// This class represents the custom row for a single row of the Patients table
var CustomRow = React.createClass({
    render: function() {
      var patientAge = moment.unix(this.props.dateOfBirth).format("MM/DD/YYYY");
      return (
        <tr>
          <td><Link to={"Dashboard?id="+this.props.patientUUID} >{this.props.name}</Link></td>
          <td>{this.props.gender}</td>
          <td>{patientAge}</td>
          <td>{this.props.phoneNumber}</td>
        </tr>
      );
    }
});

class NewPatientForm extends Component{
  constructor(props){
    super(props);
    this.state = {
      name: "",
      gender: "male",
      dateOfBirth: "",
      bloodType: "",
      medicalNumber: "",
      allergies: "",
      phoneNumber: "",
      emergencyContact: "",
      address: ""
    };
  }
  resetForm (event) {
    this.props.hideForm(event);
    this.setState({
      name: "",
      gender: "male",
      dateOfBirth: "",
      bloodType: "",
      medicalNumber: "",
      allergies: "",
      phoneNumber: "",
      emergencyContact: "",
      address: ""
    });
  }

  checkAll () {
    var nameError = this.refs.name.checkValidation();
    var dateOfBirthError = this.refs.dateOfBirth.checkValidation();
    var bloodTypeError = this.refs.bloodType.checkValidation();
    var medicalNumberError = this.refs.medicalNumber.checkValidation();
    var phoneNumberError = this.refs.phoneNumber.checkValidation();
    var emergencyContactError = this.refs.emergencyContact.checkValidation();
    var addressError = this.refs.address.checkValidation();
    return nameError || dateOfBirthError || bloodTypeError ||
      medicalNumberError || phoneNumberError || emergencyContactError || addressError;
  }

  currentStateObject(){
    return {
        name: this.refs.name.getValue(),
        gender: this.state.gender,
        dateOfBirth: moment(this.refs.dateOfBirth.getValue()).unix(),
        bloodType: this.refs.bloodType.getValue(),
        medicalNumber: this.refs.medicalNumber.getValue(),
        phoneNumber: this.refs.phoneNumber.getValue(),
        emergencyContact: this.refs.emergencyContact.getValue(),
        address: this.refs.address.getValue(),
        notes: this.refs.allergies.getValue()
      }
  }

  genderSel(event){
    var newState = this.currentStateObject();
    newState.gender = event.target.id;
    this.setState(newState);
  }

  //Posts the notification to the appropriate doctor.
  createPatient (event) {
    event.preventDefault(this.state.name)
    var hasError = this.checkAll();
    if(hasError){
      alert("Please fill in all required fields");
    } else {
      var patient = this.currentStateObject();
      requests.createPatient(patient)
        .then((result) => {
          this.setState(this.state);
          this.props.hideForm(event);
        })
        .catch(function(e){
          console.log("Could not create patient");
        });
    }
  }

  render(){
    var gender = this.state.gender.toLowerCase();
    return (
      <div className="newPatientForm">
        <h3 >Create Patient</h3>
        <form className="formContent" >
          <div className="container-fluid">
            <div className="row">
              <div className="col col-md-6">
                <Comp.ValidatedInput ref="name"
                  validation="required" label="Name" name="name" type="text" tabDisable={!this.props.formFocus}
                  value={this.state.name}  errorHelp={{
                  required:"Required"
                }} />
                <div>
                  <label>Gender</label>
                </div>
                <div className="btn-group" data-toggle="buttons">
                    <label style={{opacity:(gender === "male" || gender === "m")?"1":"0.5"}} className="btn btn-primary">
                      <input type="radio" id="male" tabIndex="-1" onClick={this.genderSel.bind(this)} />Male
                    </label>
                    <label style={{opacity:(gender === "female" || gender === "f")?"1":"0.5"}} className="btn btn-primary">
                      <input type="radio" id="female" tabIndex="-1" onClick={this.genderSel.bind(this)} />Female
                    </label>
                </div>
                <Comp.ValidatedInput ref="dateOfBirth"
                  validation="required" label="Date of Birth" name="dateOfBirth" type="date"  max="9999-12-31" tabDisable={!this.props.formFocus}
                  value={this.state.dateOfBirth}  errorHelp={{
                  required:"Required"
                }} />
                <Comp.ValidatedInput ref="bloodType"
                  validation="required" label="Blood Type" name="bloodType" type="text" tabDisable={!this.props.formFocus}
                  value={this.state.bloodType} errorHelp={{
                  required:"Required"
                }} />
                <Comp.ValidatedInput ref="medicalNumber"
                  validation="required" label="Medical Number" name="medicalNumber" type="text" tabDisable={!this.props.formFocus}
                  value={this.state.medicalNumber} errorHelp={{
                  required:"Required"
                }} />
                <label htmlFor="allergeisText"><b>Allergies: </b></label>
                <Comp.TextInput ref="allergies"
                  tabDisable={!this.props.formFocus}
                  value={this.state.allergies} />
              </div>
              <div className="col col-md-6">
                <h4 className="moduleSubHeader">Patient Contacts</h4>
                  <Comp.ValidatedInput ref="phoneNumber"
                    validation="required" label="Phone Number" name="phoneNumber" type="text" tabDisable={!this.props.formFocus}
                    value={this.state.phoneNumber} errorHelp={{
                    required:"Required"
                }} />
                <Comp.ValidatedInput ref="emergencyContact"
                  validation="required" label="Emergency Contact" name="emergencyContact" type="text" tabDisable={!this.props.formFocus}
                  value={this.state.emergencyContact} errorHelp={{
                  required:"Required"
                }} />
                <Comp.ValidatedInput ref="address"
                  validation="required" label="Address" name="address" type="text" tabDisable={!this.props.formFocus}
                  value={this.state.address} errorHelp={{
                  required:"Required"
                }} />
              </div>
            </div>
          </div>
        </form>
        <div className="buttonHolder">
          <button type="button" tabIndex="-1" className="btn btn-danger" onClick={this.resetForm.bind(this)}>Cancel</button>
          <button type="button" tabIndex="-1" className="btn btn-success" onClick={this.createPatient.bind(this)}>Create Patient</button>
        </div>
      </div>
    );
  }
}

class Home_Doc extends Component {
  constructor(props){
		super(props);
		this.state = {
      showForm:false,
			patientsList: [],
      search: ''
		}
	}

  // call back function that changes the state of 'search' state variable
  updateSearch(event){
    this.setState({search: event.target.value.substr(0,20)});
  }

  componentDidMount(){
		requests.patientsByDocSearch()
			.then((result) => {
				this.setState({ patientsList:result });
			})
			.catch(function(e){
				console.log("Could not mount request for patients List from Doc")
			});
	}

  showForm(event) {
    event.preventDefault()
    this.setState({
      showForm:true
    });
  }

  hideForm(event) {
    event.preventDefault()
    this.setState({
      showForm:false
    });
  }

  render() {
    var formClass = classnames("moduleBody patientFormHolder", {"show":this.state.showForm});
    var listClass = classnames("moduleBody patientListHolder", {"show": !this.state.showForm});
    // create rows with all the patient information if patientsList is not empty
    if (this.state.patientsList.length > 0){
        var rows = [];
        var filteredRows = this.state.patientsList.filter(
            //only return this item if you can find 'this.state.search' inside
            // 'item.name' OR 'item.phoneNumber'...leading to filtering
            (item) => {
              return (item.name.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1)
                    ||  (item.phoneNumber.indexOf(this.state.search) !== -1);
             }
        );
        // the filtered rows are mapped to a Custom Row with all required info
        filteredRows.forEach(function(item) {
            rows.push(<CustomRow
                name={item.name}
                gender={item.gender}
                dateOfBirth={item.dateOfBirth}
                phoneNumber={item.phoneNumber}
                patientUUID={item.patientUUID}
                key={item.patientUUID} />);
        });
    }

    return (
      <div className="Home_Doc">
        <div className="pageHeader">
            <h1 className="mainHeader">Patients</h1>
        </div>
        <div className={listClass}>
          <button type="button" className="btn btn-success btn-lg btn-block" onClick={this.showForm.bind(this)}>New Patient</button>
          <form>
            <input className="filterInput" type="text" name="search" placeholder="Search Patient ..."
            onChange={this.updateSearch.bind(this)}
            value={this.state.search}/>
          </form>
          <table className="table-striped table-hover" id="allPatientsTable">
             <thead>
                 <tr>
                     <th>Name</th>
                     <th>Gender</th>
                     <th>Date of Birth (M/D/Y)</th>
                     <th>Phone Number</th>
                 </tr>
             </thead>
             {this.state.patientsList.length > 0 &&
               <tbody>
                 {rows}
               </tbody>
             }
          </table>
        </div>
        <div className={formClass}>
          <NewPatientForm formFocus={this.state.showForm} hideForm={this.hideForm.bind(this)}/>
        </div>
      </div>
    );
  }
}

export default Home_Doc;
