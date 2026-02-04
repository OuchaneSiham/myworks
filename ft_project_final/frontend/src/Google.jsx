import { API_BASE_URL } from './config';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
function Google()
{
  const navigate = useNavigate();
  const url = `${API_BASE_URL}/users/google-auth`;
    // useEffect(()=>{
    //     google.accounts.id.initialize 
    // })
     const handleSucc = async (credentialResponse) => {

       const resp =  await fetch(url, {
        method: "POST",
        headers:{
            "Content-Type" : "application/json",
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
    });
    // const sessionToken = data.token;
    // const saved = localStorage.setItem("token",sessionToken);
    // navigate("/profile");
    // console.log(credentialResponse);
    if(resp.ok)
      {
        const data = await resp.json();
        const sessionToken = data.token;
        const saved = localStorage.setItem("token",sessionToken);
        navigate("/profile");
        console.log(data, "database user");
      }
      else 
      {
          const data = await resp.json();
          console.log(data, "server error");
      }
      }
      const handleErr =() =>{
        console.log("failed to login");
      }
    return(<>
    <GoogleLogin onSuccess={handleSucc} onError={handleErr}>
        {/* <button ></button> */}
    </GoogleLogin>
    </>);
}
export default Google 