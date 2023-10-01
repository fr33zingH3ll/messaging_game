import React, { useState, Children } from 'react';
import PasswordInput from "../components/input/PasswordInput";
import Form from "./../components/form/Form";
import EmailInput from '../components/input/EmailInput';
import SubmitInput from '../components/input/SubmitInput';

function Login() {
    const [formValues, setFormValues] = useState({});

    const handleSubmit = (event) => {
        const children = Children.toArray(event.children);

        children.forEach(child => {
            if (child.props.name && child.props.value) {
                setFormValues({ ...formValues, [child.props.name]: child.props.value });
            }
        });
    
        alert(`Email: ${formValues.email}, Password: ${formValues.password}`);
    };

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <EmailInput
                    name="email"
                />
                <PasswordInput
                    name="password"
                />
                <SubmitInput/>
            </Form>
        </>
    );
}

export default Login;