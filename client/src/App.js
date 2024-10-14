import {BrowserRouter, Route, Routes, Navigate} from 'react-router-dom';

import Login from './components/login';
import Admin from './components/admin';
import Employee from './components/employee';
import FaqsManage from './components/faqsManagement';
import FaqsBoard from './components/faqsBoard';
import ManageRecords from './components/recordsManagement';
import Record from './components/record';
import Workspaces from './components/workspaces';
import MyAccount from './components/myAccount';
import Signup from './components/signup';
import NotFound from './components/notFound';

// For accessing global state for logged in users
import { useAuthorize } from './context/hook/useAuthorization';

function App() {

  const {userAccount} = useAuthorize();

  return (
    <BrowserRouter>
        <Routes>

          {/* Routes for 'admin' and 'employee' homepages */}
          <Route path="/" element={userAccount && userAccount.occupation === 'admin' ? <Admin/> : <Navigate to="/login"/>}/>
          <Route path="/employee" element={userAccount && userAccount.occupation === 'employee' ? <Employee/> : <Navigate to="/login"/>}/>

          {/* Route for login page */}
          <Route path="/login" element={!userAccount ? <Login/> : <Navigate to={userAccount.occupation === 'admin' ? "/" : "/employee"}/>}/> 

          {/* Routes for 'admin' usecases */}
          <Route path="/faqs-manage" element={userAccount && userAccount.occupation === 'admin' ? <FaqsManage/> : <Navigate to="/login"/>}/>
          <Route path="/record-manage" element={userAccount && userAccount.occupation === 'admin' ? <ManageRecords /> : <Navigate to="/login"/>}/>
          <Route path="/employee-account" element={userAccount && userAccount.occupation === 'admin' ? <Record/> : <Navigate to="/login"/>}/>
          <Route path="/create-account" element={userAccount && userAccount.occupation === 'admin' ? <Signup/> : <Navigate to="/login"/>}/>

          {/* Routes for 'employee' usecases */} 
          <Route path="/faqs" element={userAccount && userAccount.occupation === 'employee' ? <FaqsBoard/> : <Navigate to="/login"/>}/>  


          {/* Routes for shared usecases */} 
          <Route path="/account" element={userAccount ? <MyAccount/> : <Navigate to="/login"/>}/>
          <Route path="/workspaces" element={userAccount ? <Workspaces/> : <Navigate to="/login"/>}/>

          {/* Routes for pages not foun */} 
          <Route path="*" element={<NotFound/>} />  
             
        </Routes>
      </BrowserRouter>
  )
}

export default App;
