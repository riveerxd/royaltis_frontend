import {StatusBar, Text, TouchableOpacity, View} from "react-native";
import {CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell} from "react-native-confirmation-code-field";
import {useState} from "react";
import {StyleSheet} from "react-native";

export default function Home() {

    const styles = StyleSheet.create({
        root: {flex: 1, padding: 20},
        title: {textAlign: 'center', fontSize: 30},
        codeFieldRoot: {marginTop: 20},
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
            borderRadius: 15
        },
        focusCell: {
            borderColor: '#000',
        },
    });
    const CELL_COUNT = 6;
    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });


    return (
        <View className={"flex-1 items-start  bg-white p-1.5 flex-col justify-center w-full h-"}>
            <View className={"flex-col mb-16 items-center w-full"}>
                <Text className={"text-7xl font-black pt-2"}>Royaltis</Text>
                <Text className={"text-xl font-bold pl-1"}>welcome</Text>
            </View>
            <View className={"items-center justify-center flex-col w-full"}>
                <Text style={styles.title}>Game code</Text>
                <CodeField
                    ref={ref}
                    {...props}
                    // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
                    value={value}
                    onChangeText={setValue}
                    cellCount={CELL_COUNT}
                    rootStyle={styles.codeFieldRoot}
                    keyboardType="number-pad"
                    testID="my-code-input"
                    renderCell={({index, symbol, isFocused}) => (
                        <Text
                            key={index}
                            style={[styles.cell, isFocused && styles.focusCell]}
                            onLayout={getCellOnLayoutHandler(index)}>
                            {symbol || (isFocused ? <Cursor/> : null)}
                        </Text>
                    )}
                />
                <TouchableOpacity className={"bg-transparent border-2 border-green-500 py-3 px-12 rounded-xl mt-4"}>
                    <Text className={"text-5xl pt-1"}>Join</Text>
                </TouchableOpacity>
            </View>
            <StatusBar barStyle={"dark-content"}/>
        </View>
    )
}