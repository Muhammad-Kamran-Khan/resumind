import { Routes, Route } from 'react-router-dom';
import Upload from './pages/Upload';
import Login from '../src/components/authPages/Login';
import Register from '../src/components/authPages/Register';
import Home from '../src/pages/Home';
import Resume from './pages/Resume';
import ProtectedRoute from '../src/components/ProtectedRoute'; // <-- Import ProtectedRoute
import './App.css'
const App = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />

            {/* Protected Routes */}
            {/* The ProtectedRoute component will now handle the auth check */}
            <Route element={<ProtectedRoute />}>
                <Route path='/' element={<Home />} />
                <Route path='/upload' element={<Upload />} />
                <Route path='/resume/:uuid' element={<Resume />} />
                {/* Add any other protected routes here */}
            </Route>
        </Routes>
    );
};

export default App;