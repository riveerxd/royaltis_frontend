import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell} from "react-native-confirmation-code-field";
import {useState, useEffect} from "react";
import {useNavigation} from "@react-navigation/native";
import {useSelector} from "react-redux";
import {AntDesign} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useFonts} from "expo-font";

export default function Home() {
    const navigation = useNavigation()
    const isLoggedIn = useSelector(state => state.auth.loggedIn)

    const [fontsLoaded, fontError] = useFonts({
        // Define your font here
        'azonix': require('../assets/fonts/azonix.otf'),
    });

    const styles = StyleSheet.create({
        root: {flex: 1, padding: 20},
        title: {textAlign: 'center', fontSize: 30},
        cell: {
            width: 50,
            height: 50,
            lineHeight: 48,
            fontSize: 24,
            borderWidth: 1.5,
            marginLeft: 2,
            marginRight: 2,
            borderColor: '#00000030',
            textAlign: 'center',
            borderRadius: 15,
            backgroundColor: "#FFFFFF"
        },
        focusCell: {
            borderColor: '#000',
        },
    });
    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({value, cellCount: 6});
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });


    useEffect(() => {
        console.log(AsyncStorage.getItem("token"))
    }, []);
    const renderAdmin = () => {
        if (isLoggedIn) {
            return <>
                <View className={"bg-[#4D5B66] px-3 py-6 rounded-2xl w-full  shadow-2xl shadow-black mt-3"}>
                    <Text className={"text-center text-4xl mb-5 text-white font-azonix"}>Admin panel</Text>

                    <TouchableOpacity className={"border-[3px] border-[#00ADB5] p-5 rounded-xl mb-2  flex-row shadow-2xl"}
                                      onPress={() => navigation.navigate("Editor")}
                    >
                        <Text className={"text-white text-center text-2xl font-azonix mr-auto"}>Editor</Text>
                        <AntDesign name="arrowright" size={28} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity className={"border-[3px] border-[#00ADB5] p-5 rounded-xl mb-2  flex-row shadow-2xl"}
                                      onPress={() => navigation.navigate("GL")}
                    >
                        <Text className={"text-white text-2xl text-center font-azonix mr-auto"}>Templates</Text>
                        <AntDesign name="arrowright" size={28} color="white" />
                    </TouchableOpacity>
                </View>
            </>
        }
    }

    return (
        <View className={"flex-1 bg-[#393E46] flex-col p-1"}>
            <View className={"flex-1 items-center flex-col "}>
                <View className={"bg-[#4D5B66] pb-3 py-6 rounded-2xl w-full shadow-black shadow-2xl"}>
                    <Text className={"text-center text-4xl mb-5 text-white font-azonix"}>Lobby Code</Text>
                    <View className={"flex-row items-center justify-center"}>
                        <CodeField
                            ref={ref}
                            {...props}
                            value={value}
                            onChangeText={setValue}
                            cellCount={6}
                            keyboardType="number-pad"
                            renderCell={({index, symbol, isFocused}) => (
                                <Text
                                    key={index}
                                    style={[styles.cell, isFocused && styles.focusCell]}
                                    onLayout={getCellOnLayoutHandler(index)}>
                                    {symbol || (isFocused ? <Cursor/> : null)}
                                </Text>
                            )}
                        />
                        <TouchableOpacity className={" items-center"}
                                          onPress={() => navigation.navigate("Game")}
                        >

                            <AntDesign name="rightcircleo" size={48} color="#00ADB5"/>
                        </TouchableOpacity>
                    </View>
                </View>

                {
                    renderAdmin()
                }

                {
                    console.log(isLoggedIn)
                }
            </View>
        </View>
    )
}