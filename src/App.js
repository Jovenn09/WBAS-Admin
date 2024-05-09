import React, { useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import Login from "./components/Login/Login";
import StudentDashboard from "./components/StudentDashBoard/StudentDashBoard";
import TeacherSidebar from "./components/TeacherDashBoard/TeacherSidebar";
import DashBoard from "./components/TeacherDashBoard/DashBoard/DashBoard";
import Reports from "./components/TeacherDashBoard/Reports/Reports";
import Attendance from "./components/TeacherDashBoard/Attendance/Attendance";
import Students from "./components/TeacherDashBoard/Students/Students";
import EditProfile from "./components/TeacherDashBoard/EditProfile/EditProfile";
import EditProfileStudent from "./components/StudentDashBoard/EditProfileStudent";
import Categories from "./components/Selections/Categories";
import TeacherLogin from "./components/TeacherDashBoard/TeacherLogin";
import SecretarySidebar from "./components/Secretary/SecretarySidebar";
import AssignStudents from "./components/Secretary/AssignStudents/AssignStudents";
import ListStudents from "./components/Secretary/ListStudents/ListStudents";
import SecretaryLogin from "./components/Secretary/SecretaryLogin";
import { AuthContext } from "./context/AuthContext";
import TeacherAccount from "./components/Secretary/TeacherAccount/TeacherAccount";
import Subject from "./components/Secretary/Subject/Subject";
import Student from "./components/Secretary/Student/Student";
import Section from "./components/Secretary/Section/Section";

const PrivateRoute = ({ component: Component, access, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        access ? <Component {...props} /> : <Redirect to="/" />
      }
    />
  );
};

const PublicRoute = ({ component: Component, access, ...rest }) => {
  let redirect = "/";

  switch (access) {
    case "student":
      redirect = "/studentdashboard";
      break;
    case "instructor":
      redirect = "/teacher-sidebar/dashboard";
      break;
    case "admin":
      redirect = "/admin-sidebar/assign-students";
      break;
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        !access ? <Component {...props} /> : <Redirect to={redirect} />
      }
    />
  );
};

function App() {
  const { user } = useContext(AuthContext);

  const instructor = user?.user_metadata?.access === "instructor";
  const admin = user?.user_metadata?.access === "admin";
  const student = user?.user_metadata?.access === "student";

  useEffect(() => {
    // const changeRole = async () => {
    //   const { data, error } = await supabaseAdmin.from("teachers").select("*");

    //   if (error) console.log(error);

    //   data.forEach(async (teacher) => {
    //     await supabaseAdmin.auth.admin.updateUserById(teacher.uuid, {
    //       user_metadata: { access: "instructor" },
    //     });
    //   });
    // };
    // changeRole();
    console.log(user);
  }, []);

  return (
    <Router>
      <div className="App">
        <Switch>
          <PublicRoute
            path="/"
            access={user?.user_metadata?.access}
            exact
            component={Categories}
          />
          <PublicRoute
            path="/teacherlogin"
            access={user?.user_metadata?.access}
            exact
            component={TeacherLogin}
          />
          <PublicRoute
            path="/secretarylogin"
            access={user?.user_metadata?.access}
            exact
            component={SecretaryLogin}
          />
          <PublicRoute
            path="/login"
            access={user?.user_metadata?.access}
            exact
            component={Login}
          />
          <PrivateRoute
            path="/studentdashboard"
            component={StudentDashboard}
            access={student}
          />
          <PrivateRoute
            path="/teacher-sidebar"
            access={instructor}
            component={TeacherSidebar}
          />
          <Route path="/edit-profile-student" component={EditProfileStudent} />
          <PrivateRoute
            path="/admin-sidebar"
            access={admin}
            component={SecretarySidebar}
          />
        </Switch>

        <Switch>
          <PrivateRoute
            access={instructor}
            path="/teacher-sidebar/dashboard"
            component={DashBoard}
          />
          <PrivateRoute
            access={instructor}
            path="/teacher-sidebar/attendance"
            component={Attendance}
          />
          <PrivateRoute
            access={instructor}
            path="/teacher-sidebar/students"
            component={Students}
          />
          <PrivateRoute
            access={instructor}
            path="/teacher-sidebar/reports"
            component={Reports}
          />
          <PrivateRoute
            access={instructor}
            path="/teacher-sidebar/edit-profile"
            component={EditProfile}
          />
        </Switch>

        <Switch>
          <PrivateRoute
            access={admin}
            path="/admin-sidebar/assign-students"
            component={AssignStudents}
          />
          <PrivateRoute
            access={admin}
            path="/admin-sidebar/list-of-students"
            component={ListStudents}
          />
          <PrivateRoute
            access={admin}
            path="/admin-sidebar/teacher-account"
            component={TeacherAccount}
          />
          <PrivateRoute
            access={admin}
            path="/admin-sidebar/subjects"
            component={Subject}
          />
          <PrivateRoute
            access={admin}
            path="/admin-sidebar/student-account"
            component={Student}
          />
          <PrivateRoute
            access={admin}
            path="/admin-sidebar/section-management"
            component={Section}
          />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
