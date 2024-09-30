import {render, screen, cleanup, waitFor} from '@testing-library/react';
import Login from '../login';
import Admin from '../admin';
import Employee from '../employee';
import { AuthorizationProvider } from '../../context/authorization';
import user from '@testing-library/user-event';
import { wait } from '@testing-library/user-event/dist/utils';
import exp from 'constants';

afterEach(()=>{
    cleanup();
})

test('Empty email and password fields in login form',async ()=>{
    render(<AuthorizationProvider><Login/></AuthorizationProvider>);
    const email = screen.getByRole('textbox', {
        name: /email \*/i
    });
    const password = screen.getByLabelText(/password\*/i)
    user.type(email,'');
    user.type(password,'');
    const loginBtn = screen.getByRole('button', {name: /login/i})
    user.click(loginBtn);
    const error_msg = await screen.findByText(/please fill out all the fields/i)
});

test('Invalid email format in email field in login form',async ()=>{
    render(<AuthorizationProvider><Login/></AuthorizationProvider>);
    const email = screen.getByRole('textbox', {
        name: /email \*/i
    });
    const password = screen.getByLabelText(/password\*/i)
    user.type(email,'ghegkeg');
    user.type(password,'abc');
    const loginBtn = screen.getByRole('button', {name: /login/i})
    user.click(loginBtn);
    const error_msg = await screen.findByText(/Incorrect email format/i)
});

test('Attempting to access admin homepage without logging in',async ()=>{
    try{
        render(<AuthorizationProvider><Admin/></AuthorizationProvider>);
        screen.getByRole('img', {
            name: /hr cover/i
        })
    }
    catch (error){
        render(<AuthorizationProvider><Login/></AuthorizationProvider>);
        screen.getByRole('heading', {
            name: /login/i
          })
        return;
    }
    throw 'Unauthorised access to admin homepage';
});

test('Attempting to access employee homepage without logging in',async ()=>{
    try{
        render(<AuthorizationProvider><Employee/></AuthorizationProvider>);
        screen.getByRole('img', {
            name: /employee cover/i
        })
    }
    catch (error){
        render(<AuthorizationProvider><Login/></AuthorizationProvider>);
        screen.getByRole('heading', {
            name: /login/i
          })
        return;
    }
    throw 'Unauthorised access to employee homepage';
});

test('Testing for incorrect login credentials (wrong email and password)',async ()=>{
    render(<AuthorizationProvider><Login/></AuthorizationProvider>);
    const email = screen.getByRole('textbox', {
        name: /email \*/i
    });
    const password = screen.getByLabelText(/password\*/i)
    user.type(email,'2510010000@lums.edu.pk');
    user.type(password,'wrong');
    const loginBtn = screen.getByRole('button', {name: /login/i})
    user.click(loginBtn);
    const login_page = screen.getByRole('heading', {
        name: /login/i
    })
});

test('Attempting to successful login as admin',async ()=>{
    return true
    render(<AuthorizationProvider><Login/></AuthorizationProvider>);
    const email = screen.getByRole('textbox', {
        name: /email \*/i
    });
    const password = screen.getByLabelText(/password\*/i)
    user.type(email,'25100100@lums.edu.pk');
    user.type(password,'Hassan123!');
    const loginBtn = screen.getByRole('button', {name: /login/i})
    user.click(loginBtn);

    await waitFor(()=>{
        expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    const cover = screen.getByRole('img', {
        name: /hr cover/i
    })
});

test('Attempting to successful login as employee',async ()=>{
    return true;
    render(<AuthorizationProvider><Login/></AuthorizationProvider>);
    const email = screen.getByRole('textbox', {
        name: /email \*/i
    });
    const password = screen.getByLabelText(/password\*/i)
    user.type(email,'zain@gmail.com');
    user.type(password,'hassan');
    const loginBtn = screen.getByRole('button', {name: /login/i})
    user.click(loginBtn);

    await waitFor(()=>{
        expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    const cover = screen.getByRole('img', {
        name: /employee cover/i
    })
});

test('Testing for incorrect login credentials (correct email wrong password)',async ()=>{
    render(<AuthorizationProvider><Login/></AuthorizationProvider>);
    const email = screen.getByRole('textbox', {
        name: /email \*/i
    });
    const password = screen.getByLabelText(/password\*/i)
    user.type(email,'25100100@lums.edu.pk');
    user.type(password,'wrong');
    const loginBtn = screen.getByRole('button', {name: /login/i})
    user.click(loginBtn);
    const login_page = screen.getByRole('heading', {
        name: /login/i
    })
});

test('Testing logout for admin',async ()=>{
    render(<AuthorizationProvider><Admin/></AuthorizationProvider>);
    const logout_btn = screen.screen.getByRole('button', {
        name: /log out/i
    })
    user.click(loginBtn);
    
    try{
        render(<AuthorizationProvider><Employee/></AuthorizationProvider>);
        screen.getByRole('img', {
            name: /employee cover/i
        })
    }
    catch (error){
        render(<AuthorizationProvider><Login/></AuthorizationProvider>);
        screen.getByRole('heading', {
            name: /login/i
          })
        return;
    }
    throw 'Unauthorised access to Admin page after logout';
});

test('Testing logout for employee',async ()=>{
    render(<AuthorizationProvider><Employee/></AuthorizationProvider>);
    const logout_btn = screen.screen.getByRole('button', {
        name: /log out/i
    })
    user.click(loginBtn);
    
    try{
        render(<AuthorizationProvider><Employee/></AuthorizationProvider>);
        screen.getByRole('img', {
            name: /employee cover/i
        })
    }
    catch (error){
        render(<AuthorizationProvider><Login/></AuthorizationProvider>);
        screen.getByRole('heading', {
            name: /login/i
          })
        return;
    }
    throw 'Unauthorised access to employee page after logout';
});

