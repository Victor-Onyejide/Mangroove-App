import { useNavigate } from "react-router-dom";

export default function SignUpPage(){
  const navigate = useNavigate();

    return(
        <div className="signupPage">
            <div className="wrapper">
                <h2 className="mt-5"><strong>Sign up for your <br/>Mangroove account</strong></h2>
                <div className="form">
                    <input 
                        class="email mt-3" 
                        type="text" placeholder="Enter your email"
                    />

                    <input 
                        class="role mt-3" 
                        type="text" placeholder="Enter your role"
                    />

                    <input 
                        class="password mt-3" 
                        type="password" placeholder="Password"
                    />

                    <button 
                        className="login-btn mt-3"
                        onClick={() => navigate("/sessions")}
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