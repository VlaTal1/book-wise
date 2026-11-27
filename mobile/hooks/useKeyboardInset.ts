import {useEffect, useState} from "react";
import {Keyboard, KeyboardEvent, Platform} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

type KeyboardInset = {
    keyboardVisible: boolean;
    keyboardInset: number;
};

const useKeyboardInset = (): KeyboardInset => {
    const insets = useSafeAreaInsets();
    const [rawHeight, setRawHeight] = useState(0);

    useEffect(() => {
        const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

        const onShow = (e: KeyboardEvent) => setRawHeight(e.endCoordinates.height);
        const onHide = () => setRawHeight(0);

        const showSub = Keyboard.addListener(showEvent, onShow);
        const hideSub = Keyboard.addListener(hideEvent, onHide);
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const keyboardVisible = rawHeight > 0;
    const keyboardInset = !keyboardVisible
        ? 0
        : Platform.OS === "android" ? rawHeight + insets.bottom : rawHeight;

    return {keyboardVisible, keyboardInset};
};

export default useKeyboardInset;
