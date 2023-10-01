import './Footer.css';

function Footer(props){
    return (
        <header className="footer">
            {props.children}
        </header>
    )
}

export default Footer;