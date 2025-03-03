import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './css/LoginPage.css'; // Import the CSS file

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Added for signup
  const [studentClass, setStudentClass] = useState(''); // Added for class selection
  const [classes, setClasses] = useState([]); // State to store classes fetched from the backend
  const [signupError, setSignupError] = useState(''); // Error handling for signup
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(''); // Success message for signup
  const navigate = useNavigate();

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/classes');
        setClasses(response.data || []); // Ensure data is not undefined
      } catch (err) {
        console.error('Failed to fetch classes:', err);
      }
    };

    fetchClasses();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');

      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token, role, class: classId } = response.data; // Expecting class from the backend

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        if (role === 'Student' && classId) {
          localStorage.setItem('classId', classId); // Store classId only for students
        }

        console.log("Login successful, role:", role);

        // Navigate to the appropriate dashboard based on the role
        if (role === 'Admin') {
          navigate('/admin-dashboard');
        } else if (role === 'Teacher') {
          navigate('/teacher-dashboard');
        } else if (role === 'Student') {
          navigate('/student-dashboard');
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error("Error during login:", err.response ? err.response.data : err.message);
      setError('Invalid email or password');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      setSignupError('');
      setSignupSuccess('');

      const role = 'Student'; // Hardcode the role to "Student"

      const signupResponse = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        role,
        class: studentClass, // Include the class in the signup request
      });

      // Automatically log the user in after signup
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { token, role: userRole, class: classId } = loginResponse.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', userRole);
      if (userRole === 'Student' && classId) {
        localStorage.setItem('classId', classId); // Store classId only for students
      }

      // Navigate to the appropriate dashboard based on the role
      if (userRole === 'Student') {
        navigate('/student-dashboard');
      }

      setName('');
      setEmail('');
      setPassword('');
      setStudentClass(''); // Clear the class field
      setSignupSuccess('Account created successfully.');
    } catch (err) {
      console.error("Error during signup or login:", err.response ? err.response.data : err.message);
      setSignupError('Error creating account or logging in. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <input type="checkbox" id="flip" />
        <div className="cover">
          <div className="front">
            <img src="/img/Thor.jpg" alt="Cover" />
            <div className="text">
              <span className="text-1">Every new friend is a new adventure</span>
              <span className="text-2">Let's get connected</span>
            </div>
          </div>
          <div className="back">
            <div className="text">
              <span className="text-1">Complete miles of journey with one step</span>
              <span className="text-2">Let's get started</span>
            </div>
          </div>
        </div>
        <div className="forms">
          <div className="form-content">
            <div className="login-form">
              <div className="title">Login</div>
              <form onSubmit={handleLogin}>
                <div className="input-boxes">
                  <div className="input-box">
                    <i className="fas fa-envelope"></i>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-box">
                    <i className="fas fa-lock"></i>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && <p className="error-text">{error}</p>}
                  <div className="text">
                    <Link to="#">Forgot password?</Link>
                  </div>
                  <div className="button input-box">
                    <input type="submit" value="Submit" />
                  </div>
                  <div className="text sign-up-text">
                    Don't have an account? <label htmlFor="flip">Sign up now</label>
                  </div>
                </div>
              </form>
            </div>

            <div className="signup-form">
              <div className="title">Signup</div>
              <form onSubmit={handleSignup}>
                <div className="input-boxes">
                  <div className="input-box">
                    <i className="fas fa-user"></i>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-box">
                    <i className="fas fa-envelope"></i>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-box">
                    <i className="fas fa-lock"></i>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-box">
                    <i className="fas fa-school"></i>
                    <select
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      required
                    >
                      <option value="">Select your class</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  {signupError && <p className="error-text">{signupError}</p>}
                  {signupSuccess && <p className="success-text">{signupSuccess}</p>}
                  <div className="button input-box">
                    <input type="submit" value="Submit" />
                  </div>
                  <div className="text sign-up-text">
                    Already have an account? <label htmlFor="flip">Login now</label>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;