import {useEffect, useState, } from "react"
import { Link, useNavigate } from 'react-router-dom'


function Profile()
{
  const urlme = "http://localhost:8281/api/v1/users/me"
  const urlup = "http://localhost:8281/api/v1/users/update"
  const [userData, setUserData] = useState(null);
  // hady for user data lijayani mn back setitha l null hiatch ba9i maendich data
  
  const [isEdit, setEdit] = useState(false);
  // hna f l7ala dyal editing ila kan false y3ni off ghir ghady nbyno data
  // walakin lakant true ghady n editiw data y3ni nktbo ach bghina n editiw
  
  const [updatedData, setUpdatedData] = useState({});
  console.log("DRAFT STATE:", updatedData);
    // hady a second copy from the original data li ghady n editiw

    const navigate = useNavigate();
    // hady for navigtiw f pages blaa  nrefriwshiw hadchy kayw93 ghir f memory machy f browser

    // console.log("something");
    useEffect(()=>{
      // hady ghay nruniwha mra whda 
       const getToken = localStorage.getItem("token");
       // fhad l7ala anjibo dak token li setinah f localstorage 
       if(!getToken)
        {
            navigate("/login");
        }
    // console.log("the token that ii get is :" , getToken);
    // hnaya kancreayiw wahd http request lbackend kan3tiwh lheader w token
    // bach back ghady ychekiw f verify ila kan s7i7 ghady y3tini data dyal dak user by id
    const fetchProfile = async () =>{
        try{
            const resp = await fetch(urlme, {
                headers: { "Authorization": "Bearer " + getToken }
            })
            if(resp.ok)
              {
              const data = await resp.json();
              setUserData(data);
              setUpdatedData(data);
              console.log(data, "database user");
              // ila kant resposnse mzyana kanakhdo data lijatna mn back kan7toha f object
            }
            else 
            {
                console.log("server error222");
            }
        }
        catch(err){
          console.log("ups something wrong while fetching  the data try again!!");
        }
    }
    fetchProfile();
    }, []);
    const handleSave = async () =>{
      const getToken =  localStorage.getItem("token");
      try{
        const resp = await fetch(urlup, {
          headers: { "Authorization": "Bearer " + getToken , 
          "Content-Type" : "application/json"},
          method: "PATCH",
          body: JSON.stringify(updatedData)
        })
        if(resp.ok)
          {
            const data = await resp.json();
            setUserData(data);
            setEdit(false);
            setUpdatedData(data);
            console.log(data, "database user");
          }
          else{
            console.log("server error111");
            // alert(data.message)
          }
      }
      catch(err)
      {
        console.log("ups something wrong while updating the data try again!!");
      }
    }
    const handleUpdateChange = (event) =>{
      const name = event.target.name;
      const value = event.target.value;
      setUpdatedData({...updatedData, [name]:value})
      console.log("field:", name, "||typed", value);
    }
    const handleAvatarChange = async (event) =>{
      const file = event.target.files[0];
      const formDada = new FormData();
      formDada.append('avatar', file);
      const getToken =  localStorage.getItem("token");
      try{

        const resp =  await fetch(urlup, {
          headers: { "Authorization": "Bearer " + getToken },
          method: "PATCH",
          body: formDada
        })
        if(resp.ok){
          
        }
      }
      catch(err){

      }
    }
    const handleLogout = async () => {
        await localStorage.removeItem('token');
        navigate('/');
      }
    if(!userData)
    {
        return (<>
        <h1>"Loading..."</h1>
        </>)
    }
    return (
        <>
          <div>
            {isEdit ? (
              <>
                <input
                name="username"
                  type="text"
                  value={updatedData.username}
                  onChange={handleUpdateChange}
                />
                <input
                name="email"
                  type="email"
                  value={updatedData.email}
                  onChange={handleUpdateChange}
                />
                <input
                // name="email"
                  type="file"
                  accept="image/*"
                  // value={updatedData.avatar}
                  onChange={handleAvatarChange}
                />
                <button onClick={handleSave}>Save</button>
                <button onClick={() => setEdit(false)}>Cancel</button>
              </>
            ) : (
              <>
                <h1>welcome back to ur data {userData.username}</h1>
                <p>Email: {userData.email}</p>
      
                <button onClick={() => setEdit(true)}>Edit Profile</button>
              </>
            )}
            <img src={userData.avatar} alt="Profile Avatar" />
            <button onClick={handleLogout}>logout</button>
      
          </div>
        </>
      );
      
}
export default Profile