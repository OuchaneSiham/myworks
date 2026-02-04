import { API_BASE_URL } from './config';
import { useState, useRef, useEffect} from "react";
import { Link, useNavigate } from 'react-router-dom'
import Google from './Google.jsx' // Add this import
// import {Link} from "react-router-dom"

function Login(){
    const navigate = useNavigate();
    const url = `${API_BASE_URL}/users/login`;
    const [formData, setFormData] = useState({});
    const handlechange = (event) =>{
        setFormData({...formData, [event.target.id]: event.target.value})
        console.log(setFormData);
    }
    const handleSubmit = async (event) =>{
        event.preventDefault();
        try {
            const resp = await fetch(url, {
                method: "POST",
                headers:{
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify(formData),
            });
            if (resp.ok)
            {
                const data = await resp.json();
                const sessionToken = data.token;
                localStorage.setItem("token", sessionToken);
                navigate("/profile");
            } 
            else 
            {
                const data = await resp.json();
                alert(data.error || "Login failed!");
            }
        }
        catch(error)
        {
            console.log("error is ", error);
        }

    }
    return(
        <>
        <div className="Login Page">
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">username:</label>
                    <input type="text" onChange={handlechange} id="username" name="username" placeholder="enter your username" required></input>
                </div>
                <br></br>
                <div>
                    <label htmlFor="password">password:</label>
                    <input type="password" onChange={handlechange} id="password" name="password" placeholder="enter your password" required ></input>
                </div>
                <br />
                <div>
                <input type="submit" value="sign in"></input>
                </div>
            </form>
            <br />
            <Google /> 
            <br />
            <Link to="/">Don't have an account? Sign up</Link>
        </div>
        </>
    );
}
export default Login