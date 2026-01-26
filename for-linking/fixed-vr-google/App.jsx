
import Register from "./Register.jsx";
import Login from "./Login.jsx";
import Google from './Google.jsx'
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google'
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <GoogleOAuthProvider clientId="470373993744-tjq6l6bk7ikvbvl46vpbd12pcqepuctb.apps.googleusercontent.com">
        <Google>
        </Google>
      </GoogleOAuthProvider>
    </>
  );
}
export default App