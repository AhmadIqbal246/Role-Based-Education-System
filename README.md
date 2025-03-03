# Role Based Education System
 This MERN-based project is designed to facilitate an online educational platform with three distinct roles: Admin, Teacher, and Student. Each role has specific capabilities and responsibilities, detailed below
 Roles and Responsibilities
1. Admin
o Create Teacher Accounts: Admin can create and manage teacher accounts via
the Django admin panel.
o Role Management: Admin can promote or demote any user between the roles of
student and teacher.
o Edit Information: Admin can update the information of both teachers and
students.
o Email Notification: Upon creating a teacher account, an email is sent to the
teacher with a random password. The teacher must change this password on their
first login.
2. Teacher
o Create Classes: Teachers can create and manage classes.
o Create Lessons: Within each class, teachers can create and manage lessons.
o Create Questions: Teachers can create various types of questions within each
lesson. The question types include:
▪ Fill in the blanks
▪ True/False
▪ Multiple Choice
o Assign Students to Classes: Teachers can assign students to their classes.
o Provide Answers: Teachers can provide correct answers for the questions they
create.
o Result: Teachers can see the results of all the students in one lesson and question.
3. Student
o Attempt Questions: Students can attempt the questions in each lesson.
o Automatic Scoring: Questions are marked automatically, and students receive a
score of 0 or 10 for each question immediately after submission.
