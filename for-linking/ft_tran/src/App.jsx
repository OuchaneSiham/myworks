import Register from "./Register";
import Login from "./Login";
import Google from './Google.jsx'
import Profile from './Profile.jsx'
import AdminDashboard from './AdminDashboard.jsx'  // ← ADD THIS
import AdminUsers from './AdminUsers.jsx'  // ← ADD THIS
import { Routes, Route } from "react-router-dom";
import {GoogleOAuthProvider} from '@react-oauth/google'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />  {/* ← ADD THIS */}
        <Route path="/admin/users" element={<AdminUsers />} />  {/* ← ADD THIS */}
      </Routes>
      
      <GoogleOAuthProvider clientId="470373993744-tjq6l6bk7ikvbvl46vpbd12pcqepuctb.apps.googleusercontent.com">
        <Google />
      </GoogleOAuthProvider>
    </>
  );
}

export default App