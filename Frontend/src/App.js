import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<ProtectedRoute> <Home /> </ProtectedRoute>} />
          <Route path='/Login' element={<Login />} />
          <Route path='/Register' element={<Register />} />


        </Routes>
      </BrowserRouter>
    </div>
  );
}

export function ProtectedRoute(props) {

  if (localStorage.getItem("User")) {
    return props.children
  }
  else {
    return (<Navigate to="/login" />)

  }
}

export default App;

