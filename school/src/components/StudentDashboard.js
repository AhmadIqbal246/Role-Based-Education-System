import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './css/StudentDashboard.module.css'; // Import the CSS module

function StudentDashboard() {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState('Lessons'); 
  const [gradedQuestions, setGradedQuestions] = useState([]);
  
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token');
  const getClassId = () => localStorage.getItem('classId'); // Get classId directly from localStorage

  useEffect(() => {
    const classId = getClassId();
    if (classId) {
      fetchLessons(classId);
    }
    fetchResults();

    window.history.pushState(null, '', window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };

    return () => {
      window.onpopstate = null;
    };
  }, []); // Fetch lessons and results on component mount

  const showAlert = (message) => {
    setScore(message);
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
      handleBackToLessons();
    }, 3000); 
  };

  // Fetch lessons for the student's class
  const fetchLessons = async (classId) => {
    const token = getToken();
    if (!token) {
      navigate('/login'); 
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/student/lessons/class/${classId}`, {
        headers: { 'x-auth-token': token },
      });

      console.log('Fetched lessons:', response.data); // Debug: Log the fetched lessons
      setLessons(response.data || []); 
    } catch (error) {
      console.error('Failed to fetch lessons.', error);
    }
  };

  // Fetch results for the student
  const fetchResults = async () => {
    const token = getToken();
    if (!token) {
      navigate('/login'); 
      return;
    }

    try {
      const response = await axios.get('http://localhost:5000/api/student/results', {
        headers: { 'x-auth-token': token },
      });
      setResults(response.data || []); 
    } catch (error) {
      console.error('Failed to fetch results.', error);
    }
  };

  // Fetch questions for a specific lesson
  const fetchQuestions = async (lessonId) => {
    const token = getToken();
    if (!token) {
      navigate('/login'); 
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/student/lessons/${lessonId}/questions`, {
        headers: { 'x-auth-token': token },
      });
      setQuestions(response.data || []); 
      setSelectedLesson(lessonId);
      setAnswers({});
      setSubmitted(false);
      setGradedQuestions([]);
      setScore(0);
    } catch (error) {
      console.error('Failed to fetch questions.', error);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  const submitAnswers = async () => {
    const token = getToken();
    if (!token) {
      navigate('/login'); 
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/student/lessons/${selectedLesson}/submit-answers`,
        { answers },
        { headers: { 'x-auth-token': token } }
      );

      const { score, gradedQuestions } = response.data;
      setScore(score);
      setGradedQuestions(gradedQuestions || []); 
      setSubmitted(true);
      showAlert(score);

      fetchResults();
    } catch (error) {
      console.error('Failed to submit answers.', error);
    }
  };

  const handleBackToLessons = () => {
    setSelectedLesson(null);
    setSubmitted(false);
    setQuestions([]);
    setGradedQuestions([]);
    setCurrentSection('Lessons'); 
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('classId'); // Clear classId on logout
    navigate('/login');
  };

  return (
    <div className={styles.studentDashboard}>
      <nav className={styles.navbar}>
        <h2 className={styles.navTitle}>Student Dashboard</h2>
        <ul>
          <li
            className={`${currentSection === 'Lessons' ? styles.active : ''}`}
            onClick={() => setCurrentSection('Lessons')}
          >
            Lessons
          </li>
          <li
            className={`${currentSection === 'Results' ? styles.active : ''}`}
            onClick={() => setCurrentSection('Results')}
          >
            Results
          </li>
          <li onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </li>
        </ul>
      </nav>

      {alertVisible && <div className={styles.alert}>{`Your Score: ${score}`}</div>}

      <div className={styles.content}>
        {currentSection === 'Lessons' && (
          <>
            {!selectedLesson && (
              <>
                <h5>Available Lessons</h5>
                <div className={styles.lessonCards}>
                  {lessons.length > 0 ? (
                    lessons.map((lesson) => (
                      <div key={lesson._id} className={styles.lessonCard}>
                        <h4>{lesson.title}</h4>
                        <button onClick={() => fetchQuestions(lesson._id)} className={styles.button}>
                          Attempt Test
                        </button>
                      </div>
                    ))
                  ) : (
                    <p>No lessons available for your class.</p>
                  )}
                </div>
              </>
            )}

            {selectedLesson && !submitted && (
              <>
                <button type="button" onClick={handleBackToLessons} className={styles.button}>
                  Back to Lessons
                </button>
                <h3>Attempt Questions</h3>
                <form>
                  {questions.map((question) => (
                    <div key={question._id} className={styles.questionCard}>
                      <p className={styles.questionText}>{question.questionText}</p>
                      {question.type === 'mcq' && (
                        <div className={styles.optionsContainer}>
                          {question.options.map((option, index) => (
                            <label
                              key={index}
                              className={`${styles.option} ${
                                answers[question._id] === option ? styles.selectedOption : ''
                              }`}
                            >
                              <input
                                type="radio"
                                name={question._id}
                                value={option}
                                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      )}
                      {question.type === 'true/false' && (
                        <div className={styles.optionsContainer}>
                          <label className={styles.option}>
                            <input
                              type="radio"
                              name={question._id}
                              value="true"
                              onChange={(e) => handleAnswerChange(question._id, 'true')}
                            />
                            True
                          </label>
                          <label className={styles.option}>
                            <input
                              type="radio"
                              name={question._id}
                              value="false"
                              onChange={(e) => handleAnswerChange(question._id, 'false')}
                            />
                            False
                          </label>
                        </div>
                      )}
                      {question.type === 'fill-in-the-blank' && (
                        <input
                          type="text"
                          placeholder="Enter your answer"
                          onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                          className={styles.input}
                        />
                      )}
                    </div>
                  ))}
                  <div className={styles.buttonContainer}>
                    <button type="button" onClick={submitAnswers} className={styles.button}>
                      Submit Answers
                    </button>
                  </div>
                </form>
              </>
            )}

            {selectedLesson && submitted && (
              <>
                <h3>Your Score: {score}</h3>
                <h4>Graded Questions</h4>
                {gradedQuestions.map((question) => (
                  <div key={question._id} className={styles.questionCard}>
                    <p className={styles.questionText}>{question.questionText}</p>
                    {question.type === 'mcq' && (
                      <div className={styles.optionsContainer}>
                        {question.options.map((option, index) => {
                          const isCorrect = question.correctAnswer === option;
                          const isSelected = answers[question._id] === option;
                          return (
                            <label
                              key={index}
                              className={`${styles.option} ${
                                isCorrect ? styles.correct : isSelected && !isCorrect ? styles.wrong : ''
                              }`}
                            >
                              {option} {isCorrect ? '✔️' : isSelected && !isCorrect ? '❌' : ''}
                            </label>
                          );
                        })}
                      </div>
                    )}
                    {question.type === 'true/false' && (
                      <div className={styles.optionsContainer}>
                        <label
                          className={`${styles.option} ${
                            question.correctAnswer === 'true' ? styles.correct : answers[question._id] === 'true' ? styles.wrong : ''
                          }`}
                        >
                          True {question.correctAnswer === 'true' ? '✔️' : answers[question._id] === 'true' ? '❌' : ''}
                        </label>
                        <label
                          className={`${styles.option} ${
                            question.correctAnswer === 'false' ? styles.correct : answers[question._id] === 'false' ? styles.wrong : ''
                          }`}
                        >
                          False {question.correctAnswer === 'false' ? '✔️' : answers[question._id] === 'false' ? '❌' : ''}
                        </label>
                      </div>
                    )}
                    {question.type === 'fill-in-the-blank' && (
                      <p>
                        Your Answer:{' '}
                        <span className={answers[question._id] === question.correctAnswer ? styles.correct : styles.wrong}>
                          {answers[question._id]}
                        </span>
                        <br />
                        Correct Answer: <span className={styles.correct}>{question.correctAnswer}</span>
                      </p>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleBackToLessons} className={styles.button}>
                  Back to Lessons
                </button>
              </>
            )}
          </>
        )}

        {currentSection === 'Results' && (
          <section className={styles.resultsSection}>
            <h5>Your Results</h5>
            {results.length > 0 ? (
              <table className={styles.resultsTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Lesson Title</th>
                    <th>Score</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={result._id}>
                      <td>{index + 1}</td>
                      <td>{result.lessonId?.title || 'Unknown Lesson'}</td>
                      <td>{result.score}</td>
                      <td>{new Date(result.dateAttempted).toLocaleString()}</td>
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

export default StudentDashboard;