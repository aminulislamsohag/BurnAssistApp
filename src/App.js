import './App.css';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import 'font-awesome/css/font-awesome.min.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import View from './components/View';



function App() {
  return (

    <div className="App">
        <Router>
  
        <Routes>
          <Route exact path="/" element={<Login/>}/>
          <Route  path="/home" element={<Home/>}/>
          <Route  path="/view" element={<View/>}/>
         
      
        </Routes>
        
        </Router>
      </div>
    );
  }
  
  export default App;
  
