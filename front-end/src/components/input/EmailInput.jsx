import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import './EmailInput.css';

function EmailInput(props) {
    const { t } = useTranslation();
    const [emailValue, setEmailValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleEmailChange = (e) => {
        setEmailValue(e.target.value);
    };

    return (
        <div className="form-group">
            <div className={`input-container ${isFocused || emailValue ? 'active' : ''}`}>
                <label htmlFor="emailInput">{t('email_label_text')}</label>
                <input
                    name={props.name}
                    type="email"
                    id="emailInput"
                    className="form-control"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={handleEmailChange}
                />
            </div>
        </div>
    );
}

export default EmailInput;