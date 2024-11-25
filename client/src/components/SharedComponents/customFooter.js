// Importing the CSS styles for the footer component
import './sharedComponents.css';

// Functional component definition for the custom footer
const CustomFooter = (prop) => {

    return (
        <div className="align-page-bottom">
            {/* Footer section */}
            <footer className="copyright-text">
                {/* Displaying the copyright text */}
                <p>Copyrights &#169; 2024 Reserved.</p>
            </footer>
        </div>
    );
};

// Exporting the CustomFooter component as the default export
export default CustomFooter;
