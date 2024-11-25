// Exporting an array of menu options for administrators
export const MenuOptionsAdmin = [
    {
        title: 'Home', // Title displayed in the navigation menu
        path: '/' // Path to the home page
    },
    {
        title: 'My Account', // Title displayed for account management
        path: '/account' // Path to the "My Account" page
    },
    { 
        title: 'User Records', // Title displayed for managing user records
        path: '/record-manage' // Path to the user records management page
    },
    {
        title: 'Add User', // Title displayed for adding new users
        path: '/create-account' // Path to the user creation page
    },
    {
        title: 'Add a WorkSpace', // Title displayed for workspace management
        path: '/workspaces' // Path to the workspace management page
    },
    {
        title: 'FAQS', // Title displayed for managing FAQs
        path: '/faqs-manage' // Path to the FAQ management page
    }
];

// Exporting an array of menu options for employees
export const MenuOptionsEmployee = [
    {
        title: 'Home', // Title displayed in the navigation menu
        path: '/user' // Path to the employee home page
    },
    {
        title: 'My Account', // Title displayed for account management
        path: '/account' // Path to the "My Account" page
    },
    { 
        title: 'View workspaces', // Title displayed for viewing workspaces
        path: '/workspaces' // Path to the workspace viewing page
    },
    { 
        title: 'FAQS', // Title displayed for accessing FAQs
        path: '/faqs' // Path to the FAQ page
    }
];
