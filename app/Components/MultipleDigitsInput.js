import React, {useCallback, useEffect, useRef, useState} from 'react';
import {TextInput, View} from 'react-native';

const MultipleDigitsInput = ({onCodeComplete}) => {
    const [digits, setDigits] = useState(Array(6).fill(""));
    const inputRefs = useRef([]);

    const handleChange = useCallback(
        (index, text) => {
            const newDigits = [...digits];
            newDigits[index] = text.slice(-1);
            setDigits(newDigits);

            if (text && index < 5) {
                inputRefs.current[index + 1].focus();
            }
        },
        [digits]
    );

    useEffect(() => {
        if (digits.every((digit) => digit !== '')) {
            onCodeComplete(digits.join(''));
            // Clear input fields and remove focus:
            setDigits(Array(6).fill(''));
            inputRefs.current.forEach(input => {
                if (input) {
                    input.blur()
                }
            });

        }
    }, [digits, onCodeComplete]);
    return (
        <View className="flex-1 flex-row justify-evenly">
            {digits.map((digit, index) => (
                <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    className="border-2 border-gray-200 w-14 h-14 text-center text-2xl focus:border-[#00ADB5] rounded-lg"
                    cursorColor={"transparent"}
                    keyboardType="numeric"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleChange(index, text)}
                />
            ))}
        </View>
    );
};

export default MultipleDigitsInput;