import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../../components/ProtectedRoute/ProtectedRoute";

// pages
import Home from "../../pages/Home/Home";
import BlogDetail from "../../pages/BlogDetail/BlogDetail";
import Login from "../../pages/Login/Login";
import Register from "../../pages/Register/Register";
import Profile from "../../pages/Profile/Profile";
import CreateBlog from "../../pages/CreateBlog/CreateBlog";
import EditBlog from "../../pages/EditBlog/EditBlog";

// admin
import AdminLayout from "../../pages/Admin/AdminLayout";
import Dashboard from "../../pages/Admin/Dashboard/Dashboard";
import Categories from "../../pages/Admin/Categories/Categories";
import Users from "../../pages/Admin/Users/Users";

const AppRouter = () => {
  return (
    <Routes>
      {/* public */}
      <Route path="/" element={<Home />} />
      <Route path="/blogs/:slug" element={<BlogDetail />} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/blog" element={<CreateBlog />} />
        <Route path="/edit/:id" element={<EditBlog />} />
      </Route>

      {/* admin */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRouter;
