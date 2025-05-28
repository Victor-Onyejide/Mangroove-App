import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signUpUser } from "../features/userSlice";
import { use, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function SignUpPage(){
  const [username, setUsername] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [affiliation, setAffliliation] = useState();
  const [publisher, setPublisher] = useState();
  const [role, setRole] = useState();

  const navigate = useNavigate();
  const dispatch = useDispatch(); 
  const handleSignUp = async () => {
    try {
        // Dispatch the signUpUser thunk
        const result = await dispatch(
            signUpUser({ username, email, role, password, affiliation, publisher })
        ).unwrap();

        // Show success message and navigate to sessions
        toast.success('Welcome!');
        navigate('/sessions');
    } catch (err) {
        // Handle errors
        console.error("Signup error:", err);
        toast.error("Signup failed. Please try again.");
    }
    };

    return(
        <div className="signupPage">
            <div className="wrapper">
                <h2 className="mt-5"><strong>Sign up for your <br/>Mangroove account</strong></h2>
                <div className="form">
                    <input 
                        class="mt-3" 
                        type="text" placeholder="Enter your Name"
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                   <input 
                        class="mt-3" 
                        type="text" placeholder="Enter your email"
                        onChange={(e) => setEmail(e.target.value)}
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
 
                    <input 
                        class="mt-3" 
                        type="password" placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button 
                        className="action-btn mt-3"
                        onClick={() => handleSignUp()}
                    > 
                        Continue
                    </button>
                </div>
            </div>

            <div className="content">
                <h2>Create your free account</h2>
                <p>
                    Effortlessly track your music session data! Start a session,
                    and have all contributors sign in with just a scan of their 
                    QR codes.
                </p>
            </div>
            
        </div>
    )
}