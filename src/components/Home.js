import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import moment from 'moment';

export default function Home() {


  //variable declear
  const navigate = useNavigate(); 
  const [username, setUsername] = useState('');
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  //mini windows declear
  const [showModal, setShowModal] = useState(false);
  //windows variable declear
  const [newPatient, setNewPatient] = useState({
    patientname: '',
    patientid: '',
    admitdate: ''
  });

  //delect windows declear
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  //check authentication ans seasion management
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('auth'); // colleet auth flag
    const storedUsername = localStorage.getItem('username'); // collect user name from previous storage

    if (!isAuthenticated) {
      navigate('/'); // Redirect to login if not authenticated
    } else {
      setUsername(storedUsername); // Set the username from localStorage
      fetchPatients(); // Call fetchPatients to get patient data from database
    }
  }, [navigate]);

  //fatch all patient list form database
  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/patients');//reponse list data
      console.log(response.data); // Log the data to ensure it's correct
      setPatients(response.data); // Store patients data in this state variable from database
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  //logout this id and back to login page
  const handleLogout = () => {
    localStorage.removeItem('auth'); // Remove auth flag from localStorage
    localStorage.removeItem('username'); // Remove username from localStorage
    navigate('/'); // Redirect to login page
  };

//mini window function declear and set true and false for show and minimise
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);


  //handle changes in form input fields
  const handleInputChange = (e) => {
    setNewPatient({
      ...newPatient,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddPatient = async () => {
    try {
       // Format the date before sending it to the backend
       const formattedDate = moment(newPatient.admitdate).format('DD-MM-YYYY');
       const patientData = { ...newPatient, admitdate: formattedDate };

       //patient data sent to API for save in database
      const response = await axios.post('http://localhost:8080/api/addpatient', patientData);//respose status code
      if (response.status === 201) { // assuming 201 is the success status
        const addedPatient = response.data;

        // Update the patients list with the new patient
        setPatients([...patients, addedPatient]);
  
        // Clear the newPatient state to reset the form
        setNewPatient({
          patientname: '',
          patientid: '',
          admitdate: ''
        });
        // Close the modal after successful addition
      handleCloseModal();
      }
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  };

  //delete patients 
  const handleDeletePatient = (patient) => {
    setPatientToDelete(patient);
    setShowDeleteModal(true);
  };

  const confirmDeletePatient = async () => {
    if (patientToDelete) {
      try {
        await axios.delete(`http://localhost:8080/api/deletepatient/${patientToDelete.id}`);
        setPatients(patients.filter(p => p.id !== patientToDelete.id));
        setShowDeleteModal(false);
      } catch (error) {
        console.error('Error deleting patient:', error);
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/search?query=${searchQuery}`);
      setPatients(response.data);
    } catch (error) {
      console.error('Error searching for patient data:', error);
    }
  };

  const handleViewPatient = (patient) => {
    navigate('/view', { state: { patient } });
  };






  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between">
        <h3>User: {username}</h3>
        <button className="btn btn-primary" onClick={handleLogout}>Log out</button>
      </div>

    
      <table className="table table-bordered mt-3">
        <thead className="bg-primary text-white">
          <tr>
            <th>SL</th>
            <th>Patient_Name</th>
            <th>Patient_ID</th>
            <th>Admit_Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
        {patients.map((patient, index) => (
            <tr key={patient.id}>
              <td>{index + 1}</td>
             
              <td>{patient.patientname}</td>
              <td>{patient.patientid}</td>
              <td>{patient.admitdate}</td>
              <td>
                <button className="btn btn-info mx-1"onClick={() => handleViewPatient(patient)}>View</button>
                <button className="btn btn-danger mx-1" onClick={() => handleDeletePatient(patient)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>



 {/* Search Field and Button */}
<div className="d-flex justify-content-center mt-6 mb-5">
<input 
          type="text" 
          className="form-control me-3"
          style={{ maxWidth: '300px' }} //css add here
          placeholder="Search by Name or ID" 
          value={searchQuery} 
          onChange={handleSearchChange} 
        />
        <button className="btn btn-secondary me-2"onClick={handleSearch}>Search</button>
        <button className="btn btn-primary " onClick={handleShowModal} >Add patient</button>
</div>






{/* Modal for adding a new patient */}
<Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Patient Name</Form.Label>
              <Form.Control
                type="text"
                name="patientname"
                value={newPatient.patientname}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Patient ID</Form.Label>
              <Form.Control
                type="text"
                name="patientid"
                value={newPatient.patientid}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="admitdate"
                value={newPatient.admitdate}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddPatient}>
            Add Patient
          </Button>
        </Modal.Footer>
      </Modal>


{/* Modal for confirming deletion */}
<Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        {`Are you sure you want to delete the patient ${patientToDelete ? patientToDelete.patientname : ''}?`}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            No
          </Button>
          <Button variant="danger" onClick={confirmDeletePatient}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>





    </div>
  );
}
