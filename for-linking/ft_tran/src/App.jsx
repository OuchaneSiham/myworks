
import Register from "./Register";
import Login from "./Login";
import Google from './Google.jsx'
import Profile from './Profile.jsx'
import { Routes, Route, BrowserRouter } from "react-router-dom";
import {GoogleOAuthProvider} from '@react-oauth/google'
function App() {
  return (
    <>
    <Routes>
    <Route path="/" element={<Register />} />
    <Route path="/login" element={<Login />} />
    {/* <Route path="/profile" element={<h1>hello to the profile</h1>}></Route> */}
    <Route path="/profile" element={<Profile />}></Route>
    </Routes>
    <GoogleOAuthProvider clientId="470373993744-tjq6l6bk7ikvbvl46vpbd12pcqepuctb.apps.googleusercontent.com">
          <Google>
          </Google>
        </GoogleOAuthProvider>
    </>
  );
}
export default App