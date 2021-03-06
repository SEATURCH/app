import React, { Component } from 'react';
import { Link } from 'react-router';
import moment from 'moment'
import requests from './requests';
import './css/Schedule.scss';
import classnames from 'classnames';

// This class represents the custom row for a single row of the Appointments table
class AppointmentRow extends Component{
  render(){
    // when the appointment is compelted (dateScheduled == 0)
    var date;
    if (this.props.dateScheduled === 0){
      date = this.props.dateVisited;
    }else{
      date = this.props.dateScheduled;
    }
    var appDate = moment.unix(date).format("MM/DD/YYYY");
		var startTime = moment.unix(date).format("LT");
		var endTime = moment.unix(date).add("minutes", 60).format("LT");

    return (
			<tr>
        <td>
          <Link to={"Appointments?appt="+this.props.appointmentUUID+"&id="+this.props.patientUUID}>
          <span className="glyphicon glyphicon-search"> </span>{appDate}</Link>
        </td>
				<td>{startTime} - {endTime}</td>
        <td>
          <Link to={"Dashboard?id="+this.props.patientUUID} >{this.props.patientName}</Link>
        </td>
			</tr>
		);
	}
}

// This class represents the entire appointments Table, it has rows of 'AppointmentRow'
var ScheduleTable = React.createClass({
  render:function(){
  	var rows =[];
    var filteredRows = this.props.appts.filter(
      (item) => {
        var date = item.dateVisited || item.dateScheduled;
        //only return this item if its date is between the startDate and endDate
        return((moment.unix(date).isSameOrAfter(this.props.startDate))
              && (moment.unix(date).startOf("day").isSameOrBefore(this.props.endDate)));
       }
    );

  	filteredRows.forEach(function(appt, index){
        rows.push( <AppointmentRow
          appointmentUUID={appt.appointmentUUID}
          patientUUID={appt.patientUUID}
          doctorUUID={appt.doctorUUID}
          patientName={appt.patientName}
          dateScheduled={appt.dateScheduled}
          dateVisited={appt.dateVisited}
          key={appt.appointmentUUID}
          action={this.props.action} /> );
    }.bind(this));

    return (
      <div>
        <table className="table-striped table-hover">
          <thead>
            <tr>
              <th>Date (M/D/Y)</th>
              <th>Time</th>
              <th>Patient</th>
            </tr>
          </thead>
      		<tbody>
      			{rows}
      		</tbody>
    		</table>
      </div>
    );
  }
});

// This class represents the whole schedule page
class Schedule extends Component{
  constructor(props){
    super(props);
    this.state = {
      appointmentsList: [],
      startDate: moment().format("YYYY-MM-DD"),
      endDate: '9999-12-31'
    }
  }

  // call back function that changes the state of 'startDate' state variable
  // used to keep track of user input of start date for filtering
  updateStartRange(event){
    if(moment(event.target.value).isValid()){
      this.setState({startDate: moment(event.target.value).format("MMM/DD/YYYY")});
    }else{
      this.setState({startDate: '2000-01-01'});
    }
  }

  // call back function that changes the state of 'endDate' state variable
  // used to keep track of user input of end date for filtering
  updateEndRange(event){
    if(moment(event.target.value).isValid()){
      this.setState({endDate: moment(event.target.value).format("MMM/DD/YYYY")});
    }else{
      this.setState({endDate: '9999-12-31'});
    }
  }

  componentDidMount(){
  	requests.appointmentsByDocSearch()
  		.then((result) => {
        result.sort(function(a, b){
          var aDate = a.dateScheduled || a.dateVisited;
          var bDate = b.dateScheduled || b.dateVisited;
          return aDate - bDate;
        });
  			this.setState({ appointmentsList:result });
  		})
  		.catch(function(e){
  			console.log("Could not mount request for appointments List from Doc")
  		});
	}

  render(){
    return (
      <div className="schedule">
        <div className="pageHeader">
            <h1 className="mainHeader">Appointments</h1>
        </div>
        <div className="moduleBody">
            <NewAppointmentForm/>
            <form>
                <div className="dateSelector">
                  <p> From: </p>
                  <input type="date" name="start" id="startDateText"
                    onChange={this.updateStartRange.bind(this)}
                    min="2000-01-01" max="9999-12-31" defaultValue={moment().format("YYYY-MM-DD")}/>
                </div>
                <div className="dateSelector">
                  <p> To: </p>
                  <input type="date" name="end" id="endDateText"
                    onChange={this.updateEndRange.bind(this)}
                    max="9999-12-31"/>
                </div>
            </form>
            {this.state.appointmentsList.length > 0 &&
                <ScheduleTable appts={this.state.appointmentsList}
                  action="Record"
                  startDate={this.state.startDate}
                  endDate={this.state.endDate}/>
            }
        </div>
      </div>
    );
  }
}

// This class represents the new appointment create UI
class NewAppointmentForm extends Component{
  constructor(props){
    super(props);
    this.state = {
      showForm:false,
      patientsList:[]
    }
  }

  componentDidMount(){
    requests.patientListGet()
      .then((result) => {
        console.log("Sucessfully got patients List from server");
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

  // Searches a given list for specific patient by matching name and specialty
  findPatientIndex(query, list){
    var patient;
    if (query){
      //parse query string to extract name and DOB
      var name = query.substring(0, query.indexOf('(')).trim();
      var dob = query.substring((query.indexOf(':') + 2), (query.indexOf(')'))).trim();
      list.forEach(function(elem){
        if(elem.name === name &&
          moment.unix(elem.dateOfBirth).format("MM/DD/YYYY") === dob){
          patient = elem;
        }
      });
    }
    return patient;
  }

  // Creats a new future appointment
  createAppointment(event) {
    event.preventDefault()
    const selectedDate = this.refs.selectedDate.value;
    const selectedTime = this.refs.selectedTime.value;
    var patientDescription = this.refs.selectedPatient.value;
    var patient = this.findPatientIndex(patientDescription, this.state.patientsList);
    var fullTime = selectedDate + " " + selectedTime;
    var finalTime = moment(fullTime, "YYYY-MM-DD hh:mm A").unix();

    if(!patient){
      alert("Please select a valid patient!");
    }else if(moment(selectedDate).isValid() === false
      || moment(selectedDate).isSameOrAfter(moment(), 'day') === false){
      alert("Please check if the date is valid and not in the past!");
    }else if(moment.unix(finalTime).isSameOrAfter(moment(), 'minute') === false){
      alert("Please select a valid time!");
    }else{
      var appt = {
        patientUuid: patient.patientUUID,
        doctorUuid: sessionStorage.userUUID,
        dateScheduled: finalTime
      }

      requests.postFutureAppointment(appt)
        .then((res) => {
          console.log("created future appointment sucessfully");
          location.reload();
        })
        .catch((e) =>{
          console.log("Could not create future appointment");
        });
    }
  }

  render(){
    var patientOptions =[];
    var timeOptions =[];

    // This loop populates the times for the time dropdown input on the UI
    for(var k=0; k<11; k++){
      var t;
      if (k < 4){
        t = k+8 + " AM";
      }else if (k === 4) {
        t = k+8 + " PM";
      }
      else{
        t = k-4 + " PM";
      }
      timeOptions.push(<option key={k}>{t}</option>);
    }

    this.state.patientsList.forEach(function(patient, index){
      var pDob = moment.unix(patient.dateOfBirth).format("MM/DD/YYYY");
      var patientDescip = patient.name + " (DOB: " + pDob + ")";
      patientOptions.push(<option value={patientDescip} key={index}></option>);
    });

    var holderClass = classnames("formContent", {"show":this.state.showForm});
    return (
      <div className="scheduleForm">
        <button type="button" className="btn btn-success btn-lg btn-block" onClick={this.showForm.bind(this)}>New Appointment</button>
        <div>
          <form className={holderClass}>
            <label>Select a Patient:</label>
            <datalist id="patientsData">
              {patientOptions}
            </datalist>
            <input ref="selectedPatient" className="form-control" type="text" list="patientsData" placeholder="Type or select patient name from dropdown"></input>
            <label>Select a date:</label>
            <input ref="selectedDate" type="date" id="newAppointmentDate" max="9999-12-31" min={moment().format("YYYY-MM-DD")} defaultValue={moment().format("YYYY-MM-DD")} className="form-control"/>
            <label>Select a time</label>
            <select ref="selectedTime" className="form-control">
              <option selected disabled hidden>Chose Start Time</option>
              {timeOptions}
            </select>
            <button type="button" className="btn btn-danger" onClick={this.hideForm.bind(this)}>Cancel</button>
            <button type="button" className="btn btn-success" onClick={this.createAppointment.bind(this)}>Create Appointment</button>
          </form>
        </div>
      </div>
		);
	}
}

export default Schedule;
