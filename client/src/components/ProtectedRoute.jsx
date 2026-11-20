import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, organizerOnly = false }) => {
  const { user } = useContext(AuthContext);

  // 1. If not logged in, kick them to Login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 2. 🛡️ NEW LOGIC: Only kick to Home if it's an Organizer-only page 
  // and the user is NOT an Organizer.
  if (organizerOnly && user.role !== 'Organizer') {
    return <Navigate to="/" />;
  }

  // 3. If they are logged in (and pass the role check), let them in!
  return children;
};

export default ProtectedRoute;




















// import { useContext } from 'react';
// import { Navigate } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';

// const ProtectedRoute = ({ children }) => {
//   const { user } = useContext(AuthContext);

//   // 1. If not logged in, kick them to Login
//   if (!user) {
//     return <Navigate to="/login" />;
//   }

//   // 2. If logged in but NOT an Organizer, kick them to Home
//   if (user.role !== 'Organizer') {
//     return <Navigate to="/" />;
//   }

//   // 3. If they are an Organizer, let them in!
//   return children;
// };
// // 🎯 THIS IS THE MISSING LINE:
// export default ProtectedRoute;