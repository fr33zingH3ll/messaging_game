import './Form.css';
import './../../Api.js';

function Form(props) {
    return (
        <form action={props.action} method={props.method} onSubmit={props.onSubmit}>
            {props.children}
        </form>
    )
}
export default Form;