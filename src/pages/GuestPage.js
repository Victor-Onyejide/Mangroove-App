import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { loginAsUser } from "../features/userSlice";
import user from './database.json';

export default function GuestPage()
{
    const { sessionId, shareLink } = useSelector((state) => state.user);
    const [hasLink, setHasLInk] = useState(false);
    const [session, link] = useState();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleGuest = () => {
        if(shareLink)
        {
            setHasLInk(true);
            navigate(`/session/${sessionId}`)
        }
        navigate('/sessions')
        
    }


    return(
        <div className="loginPage">
                 <h2 className="font-weight-bold">Welcome, Guest!</h2>
                 <p>Please fill form below to continue.</p>
            <div className="form mt-4">

                <input 
                    class="role mt-3" 
                    type="text" placeholder="Enter your role"
                />
 
                <input 
                    class="password mt-3" 
                    type="text" placeholder="Enter Your Name"
                />

               {!hasLink && <input 
                    class="password mt-3" 
                    type="text" placeholder="Enter Session ID"
                />
               }

                <button 
                    className="login-btn mt-3"
                    onClick={() => handleGuest()}
                > 
                    Continue
                </button>
            </div>
        </div>
    );
}