import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import styles from "./css/TeacherDashboard.module.css"; // Import the CSS Module

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

function TeacherDashboard() {
  const [classes, setClasses] = useState([]);
  const [newClassName, setNewClassName] = useState("");
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    type: "mcq",
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [classIdToEdit, setClassIdToEdit] = useState("");
  const [lessonIdToEdit, setLessonIdToEdit] = useState("");
  const [questionIdToEdit, setQuestionIdToEdit] = useState("");
  const [currentSection, setCurrentSection] = useState("Create Class");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);

  const navigate = useNavigate(); // Hook for navigation

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetchClasses();
    handleFetchResults();

    // Prevent going back to login page on browser back button
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };

    return () => {
      window.onpopstate = null;  // Clean up
    };
  }, []);

  // Show alert function
  const showAlert = (message) => {
    setAlertMessage(message);
    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 2000);
  };

  // Fetch classes
  const fetchClasses = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await api.get("/teacher/classes", {
        headers: { "x-auth-token": token },
      });
      setClasses(response.data);
    } catch (error) {
      console.error("Failed to fetch classes", error);
    }
  };

  // Fetch lessons
  const fetchLessons = async (classId) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await api.get(`/teacher/classes/${classId}/lessons`, {
        headers: { "x-auth-token": token },
      });
      setLessons(response.data);
    } catch (error) {
      console.error("Failed to fetch lessons", error);
    }
  };

  // Fetch results
  const handleFetchResults = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await api.get("/teacher/results", {
        headers: { "x-auth-token": token },
      });
      setResults(response.data);
    } catch (error) {
      console.error("Failed to fetch results", error);
    }
  };

  // Fetch questions
  const fetchQuestions = async (lessonId) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await api.get(`/teacher/lessons/${lessonId}/questions`, {
        headers: { "x-auth-token": token },
      });
      setQuestions(response.data);
    } catch (error) {
      console.error("Failed to fetch questions", error);
    }
  };

  // Handle Create/Edit Class
  const handleCreateClass = async () => {
    const token = getToken();
    if (!newClassName || !token) return;

    try {
      if (isEditingClass) {
        await api.put(
          `/teacher/classes/${classIdToEdit}/edit`,
          { name: newClassName },
          { headers: { "x-auth-token": token } }
        );
        showAlert("Class updated successfully!");
        setIsEditingClass(false);
      } else {
        const response = await api.post(
          "/teacher/create-class",
          { name: newClassName },
          { headers: { "x-auth-token": token } }
        );
        setClasses([...classes, response.data]);
        showAlert("Class created successfully!");
      }
      setNewClassName("");
      fetchClasses();
    } catch (error) {
      console.error("Failed to create or update class", error);
      showAlert("Failed to create or update class");
    }
  };

  const handleEditClass = (classItem) => {
    setIsEditingClass(true);
    setNewClassName(classItem.name);
    setClassIdToEdit(classItem._id);
    setCurrentSection("Create Class");
  };

  const handleDeleteClass = async (classId) => {
    const token = getToken();
    try {
      await api.delete(`/teacher/classes/${classId}/delete`, {
        headers: { "x-auth-token": token },
      });
      showAlert("Class deleted successfully!");
      fetchClasses();
    } catch (error) {
      console.error("Failed to delete class", error);
      showAlert("Failed to delete class");
    }
  };

  // Handle Create/Edit Lesson
  const handleCreateLesson = async () => {
    const token = getToken();
    if (!newLessonTitle || !selectedClass || !token) return;

    try {
      if (isEditingLesson) {
        await api.put(
          `/teacher/lessons/${lessonIdToEdit}/edit`,
          { title: newLessonTitle },
          { headers: { "x-auth-token": token } }
        );
        showAlert("Lesson updated successfully!");
        setIsEditingLesson(false);
      } else {
        const response = await api.post(
          `/teacher/classes/${selectedClass}/create-lesson`,
          { title: newLessonTitle },
          { headers: { "x-auth-token": token } }
        );
        setLessons([...lessons, response.data]);
        showAlert("Lesson created successfully!");
      }
      setNewLessonTitle("");
      fetchLessons(selectedClass);
    } catch (error) {
      console.error("Failed to create or update lesson", error);
      showAlert("Failed to create or update lesson");
    }
  };

  const handleEditLesson = (lesson) => {
    setIsEditingLesson(true);
    setNewLessonTitle(lesson.title);
    setLessonIdToEdit(lesson._id);
    setCurrentSection("Create Lesson");
  };

  const handleDeleteLesson = async (lessonId) => {
    const token = getToken();
    try {
      await api.delete(`/teacher/lessons/${lessonId}/delete`, {
        headers: { "x-auth-token": token },
      });
      showAlert("Lesson deleted successfully!");
      fetchLessons(selectedClass);
    } catch (error) {
      console.error("Failed to delete lesson", error);
      showAlert("Failed to delete lesson");
    }
  };

  // Handle Create/Edit/Delete Questions
  const handleCreateQuestion = async () => {
    const token = getToken();
    if (
      !newQuestion.questionText ||
      !selectedLesson ||
      !newQuestion.correctAnswer ||
      !token
    ) {
      showAlert("Please fill in all required fields");
      return;
    }

    if (
      newQuestion.type === "mcq" &&
      newQuestion.options.some((option) => option === "")
    ) {
      showAlert("Please fill in all options for multiple-choice questions");
      return;
    }

    try {
      if (isEditingQuestion) {
        await api.put(
          `/teacher/questions/${questionIdToEdit}/edit`,
          newQuestion,
          { headers: { "x-auth-token": token } }
        );
        showAlert("Question updated successfully!");
        setIsEditingQuestion(false);
      } else {
        const response = await api.post(
          `/teacher/lessons/${selectedLesson}/create-question`,
          newQuestion,
          { headers: { "x-auth-token": token } }
        );
        setQuestions([...questions, response.data]);
        showAlert("Question created successfully!");
      }

      setNewQuestion({
        type: "mcq",
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: "",
      });
      fetchQuestions(selectedLesson);
    } catch (error) {
      console.error("Failed to create or update question", error);
      showAlert("Failed to create or update question");
    }
  };

  const handleEditQuestion = (question) => {
    setIsEditingQuestion(true);
    setNewQuestion({
      type: question.type,
      questionText: question.questionText,
      options: question.options,
      correctAnswer: question.correctAnswer,
    });
    setQuestionIdToEdit(question._id);
    setCurrentSection("Create Question");
  };

  const handleDeleteQuestion = async (questionId) => {
    const token = getToken();
    try {
      await api.delete(`/teacher/questions/${questionId}/delete`, {
        headers: { "x-auth-token": token },
      });
      showAlert("Question deleted successfully!");
      fetchQuestions(selectedLesson);
    } catch (error) {
      console.error("Failed to delete question", error);
      showAlert("Failed to delete question");
    }
  };

  const handleSelectClass = (classId) => {
    setSelectedClass(classId);
    fetchLessons(classId);
    setCurrentSection("Create Lesson");
  };

  const handleSelectLesson = (lessonId) => {
    setSelectedLesson(lessonId);
    fetchQuestions(lessonId);
    setCurrentSection("Create Question");
  };

  const handleQuestionTypeChange = (e) => {
    const selectedType = e.target.value;
    const updatedOptions =
      selectedType === "true/false" ? ["True", "False"] : ["", "", "", ""];
    setNewQuestion({
      ...newQuestion,
      type: selectedType,
      options: updatedOptions,
    });
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true }); // Redirect to login page and replace history
  };

  return (
    <div className={styles.teacherDashboardContainer}>
      <nav className={styles.nav}>
        <ul className={styles.ul}>

          <li
            className={`${
              currentSection === "Create Class" ? styles.active : ""
            }`}
            onClick={() => setCurrentSection("Create Class")}
          >
            Create Class
          </li>
          <li
            className={`${
              currentSection === "Create Lesson" ? styles.active : ""
            }`}
            onClick={() => setCurrentSection("Create Lesson")}
          >
            Create Lesson
          </li>
          <li
            className={`${
              currentSection === "Create Question" ? styles.active : ""
            }`}
            onClick={() => setCurrentSection("Create Question")}
          >
            Create Question
          </li>
          <li
            className={`${currentSection === "Results" ? styles.active : ""}`}
            onClick={() => setCurrentSection("Results")}
          >
            Results
          </li>
          <button className={styles.signoutbutton} onClick={handleLogout}>
            Logout
          </button>
        </ul>
      </nav>

      {alertVisible && (
        <div className={styles.alertMessage}>{alertMessage}</div>
      )}

      <div className={styles.content}>
        {/* Create Class Section */}
        {currentSection === "Create Class" && (
          <section className={styles.section}>
            <h2>{isEditingClass ? "Edit Class" : "Create a New Class"}</h2>
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Class Name"
              className={styles.input}
            />
            <button onClick={handleCreateClass} className={styles.button}>
              {isEditingClass ? "Update Class" : "Create Class"}
            </button>
            <h4>Your Classes</h4>
            <div className={styles.classesContainer}>
              {classes.map((classItem) => (
                <div key={classItem._id} className={styles.classCard}>
                  <h4 className={styles.classTitle}>{classItem.name}</h4>
                  <div className={styles.classActions}>
                    <i
                      className={`${styles.icon} ${styles.iconEdit} fa-regular fa-pen-to-square`}
                      onClick={() => handleEditClass(classItem)}
                    ></i>
                    <button
                      className={styles.selectClassButton}
                      onClick={() => handleSelectClass(classItem._id)}
                    >
                      Select Class
                    </button>
                    <i
                      className={`${styles.icon} ${styles.iconDelete} fa-solid fa-trash`}
                      onClick={() => handleDeleteClass(classItem._id)}
                    ></i>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Create Lesson Section */}
        {currentSection === "Create Lesson" && (
          <section className={styles.section}>
            <h2>
              {isEditingLesson
                ? "Edit Lesson"
                : "Select a Class and Create a New Lesson"}
            </h2>
            <select
              value={selectedClass}
              onChange={(e) => handleSelectClass(e.target.value)}
              className={styles.select}
            >
              <option value="">Select Class</option>
              {classes.map((classItem) => (
                <option key={classItem._id} value={classItem._id}>
                  {classItem.name}
                </option>
              ))}
            </select>
            {selectedClass && (
              <>
                <input
                  type="text"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="Lesson Title"
                  className={styles.input}
                />
                <button onClick={handleCreateLesson} className={styles.button}>
                  {isEditingLesson ? "Update Lesson" : "Create Lesson"}
                </button>
                <h4>Existing Lessons</h4>
                <div className={styles.lessonsContainer}>
                  {lessons.map((lesson) => (
                    <div key={lesson._id} className={styles.lessonCard}>
                      <h4 className={styles.lessonTitle}>{lesson.title}</h4>
                      <p className={styles.lessonDescription}>
                        Lesson description goes here
                      </p>
                      <div className={styles.lessonActions}>
                        <i
                          className={`fa-regular fa-pen-to-square ${styles.icon} ${styles.iconEdit}`}
                          onClick={() => handleEditLesson(lesson)}
                        ></i>

                        <button
                          onClick={() => handleSelectLesson(lesson._id)}
                          className={styles.selectLessonButton}
                        >
                          Select Lesson
                        </button>

                        <i
                          className={`fa-solid fa-trash ${styles.icon} ${styles.iconDelete}`}
                          onClick={() => handleDeleteLesson(lesson._id)}
                        ></i>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* Create Question Section */}
        {currentSection === "Create Question" && (
          <section className={styles.section}>
            <h2>Select a Class and Lesson to Create Questions</h2>
            <select
              value={selectedClass}
              onChange={(e) => handleSelectClass(e.target.value)}
              className={styles.select}
            >
              <option value="">Select Class</option>
              {classes.map((classItem) => (
                <option key={classItem._id} value={classItem._id}>
                  {classItem.name}
                </option>
              ))}
            </select>
            {selectedClass && (
              <>
                <select
                  value={selectedLesson}
                  onChange={(e) => handleSelectLesson(e.target.value)}
                  className={styles.select}
                >
                  <option value="">Select Lesson</option>
                  {lessons.map((lesson) => (
                    <option key={lesson._id} value={lesson._id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
                {selectedLesson && (
                  <>
                    <h4>Create a New Question</h4>
                    <select
                      value={newQuestion.type}
                      onChange={handleQuestionTypeChange}
                      className={styles.select}
                    >
                      <option value="true/false">True/False</option>
                      <option value="mcq">Multiple Choice</option>
                      <option value="fill-in-the-blank">
                        Fill in the Blank
                      </option>
                    </select>
                    <input
                      type="text"
                      value={newQuestion.questionText}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          questionText: e.target.value,
                        })
                      }
                      placeholder="Enter the Question"
                      className={styles.input}
                    />
                    {newQuestion.type === "mcq" && (
                      <>
                        {newQuestion.options.map((option, index) => (
                          <input
                            key={index}
                            type="text"
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => {
                              const updatedOptions = [...newQuestion.options];
                              updatedOptions[index] = e.target.value;
                              setNewQuestion({
                                ...newQuestion,
                                options: updatedOptions,
                              });
                            }}
                            className={styles.input}
                          />
                        ))}
                      </>
                    )}
                    {newQuestion.type === "true/false" && (
                      <p>Options: True / False</p>
                    )}
                    <input
                      type="text"
                      placeholder="Correct Answer"
                      value={newQuestion.correctAnswer}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          correctAnswer: e.target.value,
                        })
                      }
                      className={styles.input}
                    />
                    <button
                      onClick={handleCreateQuestion}
                      className={styles.button}
                    >
                      {isEditingQuestion ? "Update Question" : "Create Question"}
                    </button>

                    <h4>Existing Questions</h4>
                    <div className={styles.questionsContainer}>
                      {questions.map((question) => (
                        <div
                          key={question._id}
                          className={styles.questionCard}
                        >
                          <div className={styles.questionHeader}>
                            <h4 className={styles.questionType}>
                              {question.type.toUpperCase()}
                            </h4>
                            <p className={styles.questionText}>
                              {question.questionText}
                            </p>
                          </div>
                          {question.type === "mcq" && (
                            <div className={styles.optionsContainer}>
                              {question.options.map((option, index) => (
                                <div key={index} className={styles.option}>
                                  <span className={styles.optionLabel}>
                                    Option {index + 1}:
                                  </span>{" "}
                                  {option}
                                </div>
                              ))}
                            </div>
                          )}
                          <p className={styles.correctAnswer}>
                            Correct Answer: {question.correctAnswer}
                          </p>
                          <div className={styles.questionActions}>
                            <i
                              className={`fa-regular fa-pen-to-square ${styles.icon} ${styles.iconEdit}`}
                              onClick={() => handleEditQuestion(question)}
                            ></i>

                            <i
                              className={`fa-solid fa-trash ${styles.icon} ${styles.iconDelete}`}
                              onClick={() => handleDeleteQuestion(question._id)}
                            ></i>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </section>
        )}

        {/* Results Section */}
        {currentSection === "Results" && (
          <section className={styles.section}>
            <h1>All Student Results</h1>
            <table className={styles.resultsTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Lesson Title</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={result._id}>
                    <td>{index + 1}</td>
                    <td>{result.studentId?.name || "Unknown"}</td>
                    <td>{result.lessonId?.title || "Unknown Lesson"}</td>
                    <td>{result.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
