import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/View.css'; // Create a corresponding CSS file for styling
import bodyImage from './body.png'; // Assuming the body image is in the same folder

export default function View() {
    const navigate = useNavigate();
    const location = useLocation();//data change on page to other page
    const { patientname, patientid, admitdate } = location.state.patient;

    const [inputs, setInputs] = useState({
        head: '',
        frontBody: '',
        backBody: '',
        leftLeg: '',
        rightLeg: '',
        leftHand: '',
        rightHand: '',
        hourlyUrineOutput: ''
    });

    const [totalTBSA, setTotalTBSA] = useState(0);
    const [currentIFR, setCurrentIFR] = useState(0);
    const [history, setHistory] = useState([]);
   

    // Fetch history and total burn data on component mount
    // eslint-disable-next-line
    useEffect(() => {
        fetchBurnData(); // Fetch burn data when component mounts
        fetchHistory(); // Fetch history when component mounts
    }, []);

    // eslint-disable-next-line
    useEffect(() => {
        calculateTotalTBSA();
    }, [inputs]);

    // Function to handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs({
            ...inputs,
            [name]: value
        });
    };

    // Function to calculate the total TBSA
    const calculateTotalTBSA = () => {
        const multipliers = {
            head: 9,
            frontBody: 19,
            backBody: 18,
            leftLeg: 18,
            rightLeg: 18,
            leftHand: 9,
            rightHand: 9
        };

        const total = Object.keys(inputs).reduce((sum, key) => {
            if (key !== 'hourlyUrineOutput') {
                return sum + (parseFloat(inputs[key] || 0) / 100) * (multipliers[key] || 1);
            }
            return sum;
        }, 0);
        setTotalTBSA(total);
    };

    // Fetch existing burn data from backend
    const fetchBurnData = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/patientBurn/${patientid}`);
            const burnData = response.data;
            if (burnData) {
                setInputs({
                    head: burnData.head || '',
                    frontBody: burnData.frontBody || '',
                    backBody: burnData.backBody || '',
                    leftLeg: burnData.leftLeg || '',
                    rightLeg: burnData.rightLeg || '',
                    leftHand: burnData.leftHand || '',
                    rightHand: burnData.rightHand || '',
                    hourlyUrineOutput: burnData.hourlyUrineOutput || ''
                });
            }
        } catch (error) {
            console.error('Error fetching burn data:', error);
        }
    };

    // Fetch patient history from backend
    const fetchHistory = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/history/${patientid}`);
            setHistory(response.data); // Make sure the data is set correctly
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    // Handle form submission and save the data
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const tbsa =  totalTBSA; // Use totalBurnInput if entered, otherwise use calculated totalTBSA
            const huo = inputs.hourlyUrineOutput;

            // Call Fuzzy Logic API to predict IFR
            const predictResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/predict`, {
                params: {
                    tbsa: tbsa,
                    urineOutput: huo
                }
            });

            const ifr = predictResponse.data;
            const currentHour= history.length;
            setCurrentIFR(ifr);
            
    // Save patient data (patientid, tbsa, huo, ifr)
    await axios.post(`${process.env.REACT_APP_API_URL}/api/savePatientData`, {
        patientId: patientid,
        tbsa: tbsa, // Save the manually entered or calculated TBSA
        huo,
        ifr
    });

   // Fetch updated history after saving
   fetchHistory();

             // Save patient data (burn percentages) to the backend  
        await axios.post(`${process.env.REACT_APP_API_URL}/api/patientBurn/save`, {
            patientId: patientid,
            head: inputs.head,
            frontBody: inputs.frontBody,
            backBody: inputs.backBody,
            leftLeg: inputs.leftLeg,
            rightLeg: inputs.rightLeg,
            leftHand: inputs.leftHand,
            rightHand: inputs.rightHand
        });

        

         
        } catch (error) {
            console.error('Error saving patient data:', error);
        }
    };

    // Render history grid with 23 boxes (2 rows, 12 columns max)
    const renderHistoryGrid = () => {
        if (!history || history.length === 0) {
            return <p>No history available for this patient.</p>;
        }

        const totalBoxes = 24; // We need 23 boxes in total
        const historyBoxes = [];
        
        // Format the stage (date) to show time first, then day and month
        const formatDate = (stage) => {
            if (!stage) return 'N/A'; // Handle the case when stage is null or undefined
            const date = new Date(stage);
            
            const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); // HH:MM
            const datePart = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }); // DD MMM
            
            return `${time} ${datePart}`; // Combine time and date
        };
        
        for (let i = 0; i < totalBoxes; i++) {
            const data = history[i] || { huo: 'N/A', ifr: 'N/A', stage: null }; // Get history data or use default
        
            const hasData = data.huo !== 'N/A' && data.ifr !== 'N/A'; // Check if both HUO and IFR have valid data
        
            historyBoxes.push(
                <div 
                    key={i} 
                    className={`history-item ${hasData ? 'with-data' : 'no-data'}`} // Apply class based on data availability
                >
                    <p>{formatDate(data.stage)}</p> {/* Format the stage date */}
                    <p>HUO: {data.huo !== 'N/A' ? parseFloat(data.huo).toFixed(2) : 'N/A'}</p>
                    <p>IFR: {data.ifr !== 'N/A' ? parseFloat(data.ifr).toFixed(2) : 'N/A'}</p>
                </div>
            );
        }
        
        return historyBoxes;
    };







return (
        <div className="view-container">
            <div className="header">
                <h2>Name: {patientname}</h2>
                <h2>Patient ID: {patientid}</h2>
                <h2>Admit Date: {admitdate}</h2>
                <button className="btn btn-primary" onClick={() => navigate('/home')}>Back to Home Page</button>
            </div>


            <div className="body-section">
                <div className="body-container">
                    <img src={bodyImage} alt="Human Body" className="body-image" />

                    <input
                        type="number"
                        name="head"
                        value={inputs.head}
                        onChange={handleChange}
                        className="input-field head-input"
                        placeholder="Head %"
                        required
                    />
                    <input
                        type="number"
                        name="frontBody"
                        value={inputs.frontBody}
                        onChange={handleChange}
                        className="input-field front-body-input"
                        placeholder="Front Body %"
                        required
                    />
                    <input
                        type="number"
                        name="backBody"
                        value={inputs.backBody}
                        onChange={handleChange}
                        className="input-field back-body-input"
                        placeholder="Back Body %"
                        required
                    />
                    <input
                        type="number"
                        name="leftHand"
                        value={inputs.leftHand}
                        onChange={handleChange}
                        className="input-field hand-left-input"
                        placeholder="Left Hand %"
                        required
                    />
                    <input
                        type="number"
                        name="rightHand"
                        value={inputs.rightHand}
                        onChange={handleChange}
                        className="input-field hand-right-input"
                        placeholder="Right Hand %"
                        required
                    />
                    <input
                        type="number"
                        name="leftLeg"
                        value={inputs.leftLeg}
                        onChange={handleChange}
                        className="input-field leg-left-input"
                        placeholder="Left Leg %"
                        required
                    />
                    <input
                        type="number"
                        name="rightLeg"
                        value={inputs.rightLeg}
                        onChange={handleChange}
                        className="input-field leg-right-input"
                        placeholder="Right Leg %"
                        required
                    />
            </div>


    <div className="summary-section">
            {/* First column: tbsahuo */}
    <div className="tbsahuo">
                <div className="summary-tbsa">
                    Total = {parseFloat(totalTBSA).toFixed(2)}
                </div>

        <input
            type="number"
            name="hourlyUrineOutput"
            value={inputs.hourlyUrineOutput}
            onChange={handleChange}
            className="input-field huo-input"
            placeholder="HUO"
            required
        />
    </div>

    {/* Second column: summary-process */}
    <div className="summary-process">
        <button onClick={handleSubmit} className="btn btn-primary process-button">
            Process
        </button>
    </div>

    {/* Third column: Predict (dropdown + output-box) */}
    <div className="summary-predict">
        <select className="dropdown">
            <option value="">Calculation</option>
            <option value="option1">FUZZY LOGIC</option>
            <option value="option2">OHTERS</option>
        </select>

        <div className="output-box">
            <p>IFR = {parseFloat(currentIFR).toFixed(2)}</p>
        </div>
    </div>
</div>




 </div>
 <div className="history-section">
                <h3>History</h3>
                <div className="history-grid">
                    {renderHistoryGrid()}
                </div>
            </div>
        </div>
    );
}
