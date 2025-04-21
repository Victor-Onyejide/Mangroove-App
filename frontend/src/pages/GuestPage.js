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
    const [username, setUsername] = useState();
    const [affiliation, setAffliliation] = useState();
    const [publisher, setPublisher] = useState();
    const [role, setRole] = useState();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleGuest = () => {
        //TODO: Guest route
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
                class="mt-3" 
                type="text" placeholder="Enter your Name"
                onChange={(e) => setUsername(e.target.value)}
                required
            />

            <input 
                class="mt-3" 
                type="text" placeholder="Enter your Affiliation"
                onChange={(e) => setAffliliation(e.target.value)}
                required
            />

            <input 
                class="mt-3" 
                type="text" placeholder="Enter your Publisher"
                onChange={(e) => setPublisher(e.target.value)}
                required
            />

            <input 
                class="mt-3" 
                type="text" placeholder="Enter your role"
                onChange={(e) => setRole(e.target.value)}
                required
            />

               {!hasLink && <input 
                    class="mt-3" 
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