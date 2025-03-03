import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import styles from './css/AdminDashboard.module.css'; // Import the CSS module

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [newRole, setNewRole] = useState('');
  const [message, setMessage] = useState('');
  const [results, setResults] = useState([]); // For results
  const [alertVisible, setAlertVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState('CreateTeacher'); // Track the current section

  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    fetchUsers();
    handleFetchResults(); // Automatically fetch results when the component loads

    // Prevent going back to login page on browser back button
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };

    return () => {
      window.onpopstate = null;  // Clean up
    };
  }, []);

  const showAlert = (msg) => {
    setMessage(msg);
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 2000); // Hide alert after 2 seconds
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { 'x-auth-token': token },
      });

      setUsers(response.data);
    } catch (err) {
      showAlert('Error fetching users');
      console.error('Error fetching users:', err.response?.data || err.message || err);
    }
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const role = 'Teacher'; // Ensure that role is set to "Teacher"
      const response = await axios.post('http://localhost:5000/api/admin/create-teacher', { name, email, password, role }, {
        headers: { 'x-auth-token': token },
      });
      showAlert(response.data.message || 'Teacher account created successfully!');
      setName('');
      setEmail('');
      setPassword('');
      // Fetch the updated list of users after creating a new teacher
      fetchUsers();
    } catch (err) {
      showAlert('Error creating account. Try another email.');
      console.error('Error creating teacher:', err.response?.data || err.message || err);
    }
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5000/api/admin/edit-user', { userId: selectedUser, name, email, role: newRole }, {
        headers: { 'x-auth-token': token },
      });
      showAlert(response.data.message || 'User information and role updated successfully!');
      // Fetch updated users
      fetchUsers();
    } catch (err) {
      showAlert('Error updating user information or role.');
      console.error('Error updating user:', err.response?.data || err.message || err);
    }
  };

  const handleFetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/results', {
        headers: { 'x-auth-token': token },
      });
      setResults(response.data);
    } catch (err) {
      showAlert('Error fetching results');
      console.error('Error fetching results:', err.response?.data || err.message || err);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from local storage
    navigate('/login', { replace: true }); // Redirect to login page
  };

  return (
    <div className={styles.adminDashboardContainer}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <ul className={styles.navList}>
          <li onClick={() => setCurrentSection('CreateTeacher')} className={currentSection === 'CreateTeacher' ? styles.active : ''}>
            Create Teacher Account
          </li>
          <li onClick={() => setCurrentSection('ManageAndEdit')} className={currentSection === 'ManageAndEdit' ? styles.active : ''}>
            Manage and Edit User Information
          </li>
          <li onClick={() => setCurrentSection('Results')} className={currentSection === 'Results' ? styles.active : ''}>
            Results
          </li>
          <button className={styles.logoutbutton} onClick={handleLogout}>
            Logout
          </button>
        </ul>
      </nav>

      {/* Alert Message */}
      {alertVisible && <div className={styles.alertMessage}>{message}</div>}

      {/* Render section based on selected navbar option */}
      <div className={styles.content}>
        {currentSection === 'CreateTeacher' && (
          <section className={styles.adminSection}>
            <h3>Create Teacher Account</h3>
            <form onSubmit={handleCreateTeacher} className={styles.adminForm}>
              <div className={styles.formGroup}>
                <input type="text" placeholder='Enter Teacher Name' value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <input type="email" placeholder='Email Here' value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <input type="password" placeholder='5 Character Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className={styles.primaryButton}>Create Teacher</button>
            </form>
          </section>
        )}

        {currentSection === 'ManageAndEdit' && (
          <section className={styles.adminSection}>
            <h3>Manage and Edit User Information</h3>
            <form onSubmit={handleUserUpdate} className={styles.adminForm}>
              <div className={styles.formGroup}>
                <label>Select User:</label>
                <select value={selectedUser} onChange={(e) => {
                  setSelectedUser(e.target.value);
                  const user = users.find((user) => user._id === e.target.value);
                  if (user) {
                    setName(user.name);
                    setEmail(user.email);
                    setNewRole(user.role);  // Set the current role
                  }
                }} required>
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>{user.name} ({user.role})</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <input type="text" placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label>Role:</label>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)} required>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                  <option value="Student">Student</option>
                </select>
              </div>
              <button type="submit" className={styles.primaryButton}>Update User</button>
            </form>
          </section>
        )}

        {currentSection === 'Results' && (
          <section className={styles.containerFluid}>
            <h3>All Student Results</h3>
            {results.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Student Name</th>
                    <th scope="col">Lesson Title</th>
                    <th scope="col">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={result._id}>
                      <th scope="row">{index + 1}</th>
                      <td>{result.studentId?.name || 'Unknown'}</td>
                      <td>{result.lessonId?.title || 'Unknown Lesson'}</td>
                      <td>{result.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No results available yet.</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
