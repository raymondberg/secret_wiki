import { React } from "react";
import { BrowserRouter as Router} from "react-router-dom";
import Main from "./components/Main";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
      <Router>
       <Main/>
      </Router>
    )
}

export default App;
