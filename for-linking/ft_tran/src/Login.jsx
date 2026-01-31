
import { useState, useRef, useEffect} from "react";
import { Link, useNavigate } from 'react-router-dom'
// import {Link} from "react-router-dom"

function Login(){
    const navigate = useNavigate();
    const url = "http://localhost:8281/api/v1/users/login"
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
            const data = await resp.json();
            // console.log("THE DA-------------------",data.token);
            const sessionToken = data.token;
            const saved = localStorage.setItem("token",sessionToken);
            navigate("/profile");
            // Maps("/profile");
            // console.log(sessionToken);
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
            <Link to="/">Don't have an account? Sign up</Link>
        </div>
        </>
    );
}
export default Login