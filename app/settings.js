import React, {useEffect, useState} from 'react';
import {Alert, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export default function Settings() {
    const [apiUrl, setApiUrl] = useState(''); // State for input value

    const saveApiUrl = async () => {
        try {
            await SecureStore.setItemAsync('APIUrl', apiUrl);
            Alert.alert("Success", "All settings have been saved", [{text: "Ok"}])
            // Optionally, provide user feedback (e.g., Toast, Alert) that the URL is saved
        } catch (error) {
            console.error('Error saving API URL:', error);
            // Handle errors appropriately (e.g., display an error message to the user)
        }
    };

    useEffect(() => {
        const retrieveApiUrl = async () => {
            try {
                const storedApiUrl = await SecureStore.getItemAsync('APIUrl');
                if (storedApiUrl) { // Check if a URL exists before updating state
                    setApiUrl(storedApiUrl);
                }
            } catch (error) {
                console.error('Error retrieving API URL:', error);
            }
        };
        retrieveApiUrl(); // Call the function immediately when the component mounts
    }, []);


    return (<View className="flex-1 bg-[#393E46] p-1">
            <View className="bg-gray-200 p-3 rounded-xl items-center flex-row my-2 mx-1">
                <MaterialIcons name="link" size={24} color="#00ADB5" className="mr-2"/>
                <TextInput
                    className="flex-1 font-azonix"
                    placeholder="API Endpoint URL"
                    onChangeText={(text) => setApiUrl(text)}
                    value={apiUrl}
                />
            </View>

            <TouchableOpacity
                className="bg-transparent rounded-xl p-4 items-center flex-row justify-center border-2 border-[#00ADB5]"
                onPress={saveApiUrl}
            >
                <MaterialIcons name="save" size={26} color="#00ADB5" className="mr-2"/>
                <Text className="font-azonix text-white">Save</Text>
            </TouchableOpacity>
        </View>);
}