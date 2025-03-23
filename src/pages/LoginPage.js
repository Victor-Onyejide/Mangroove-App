import { Link, useNavigate } from "react-router-dom";
export default function LoginPage()
{
  const navigate = useNavigate();

    return(
        <div className="loginPage">
            <h2>Log in to your account</h2>
            <div className="form mt-4">
                <input 
                    class="email mt-3" 
                    type="text" placeholder="Enter your email"
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
            <p className="mt-3">Don't have an account? <Link to="/signup" className="signupText">Sign up for free &#8594;</Link></p>
        </div>
    );
}