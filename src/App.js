import React, { Component, useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  useHistory,
} from "react-router-dom";
import Login from "./components/Login/Login";
import StudentDashboard from "./components/StudentDashBoard/StudentDashBoard";
import TeacherSidebar from "./components/TeacherDashBoard/TeacherSidebar";
import DashBoard from "./components/TeacherDashBoard/DashBoard/DashBoard";
import Reports from "./components/TeacherDashBoard/Reports/Reports";
import Attendance from "./components/TeacherDashBoard/Attendance/Attendance";
import Students from "./components/TeacherDashBoard/Students/Students";
import StudentRegistration from "./components/StudentRegistration/StudentRegistration";
import EditProfile from "./components/TeacherDashBoard/EditProfile/EditProfile";
import Admin from "./components/Admin/Admin";
import EditProfileStudent from "./components/StudentDashBoard/EditProfileStudent";
import Categories from "./components/Selections/Categories";
import AdminLogin from "./components/Admin/AdminLogin";
import TeacherLogin from "./components/TeacherDashBoard/TeacherLogin";
import SecretarySidebar from "./components/Secretary/SecretarySidebar";
import AssignStudents from "./components/Secretary/AssignStudents/AssignStudents";
import ListStudents from "./components/Secretary/ListStudents/ListStudents";
import SecretaryLogin from "./components/Secretary/SecretaryLogin";
import { AuthContext } from "./context/AuthContext";
import supabase, { supabaseAdmin } from "./config/supabaseClient";

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
    case "secretary":
      redirect = "/secretary-sidebar";
      break;
    case "admin":
      redirect = "/admin-dashboard";
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
  const secretary = user?.user_metadata?.access === "secretary";
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
            path="/adminlogin"
            access={user?.user_metadata?.access}
            exact
            component={AdminLogin}
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
          <PrivateRoute
            path="/admin-dashboard"
            access={admin}
            component={Admin}
          />
          <Route path="/edit-profile-student" component={EditProfileStudent} />
          <PrivateRoute
            path="/secretary-sidebar"
            access={secretary}
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
            access={secretary}
            path="/secretary-sidebar/assign-students"
            component={AssignStudents}
          />
          <PrivateRoute
            access={secretary}
            path="/secretary-sidebar/list-of-students"
            component={ListStudents}
          />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
