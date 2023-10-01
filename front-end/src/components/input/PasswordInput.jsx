import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import './PasswordInput.css';

function PasswordInput(props) {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
  
    const handleFocus = () => {
        setIsFocused(true);
    };
  
    const handleBlur = () => {
        setIsFocused(false);
    };
  
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
    };

    return (
        <div className="form-group">
            <div className={`input-container ${isFocused || inputValue ? 'active' : ''}`}>
                <input 
                    name={props.name}
                    id={props.id}
                    className="form-control"
                    type="password"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={handleInputChange}
                />
                <label htmlFor={props.id}>{t('password_label_text')}</label>
            </div>
        </div>
    );
}

export default PasswordInput;