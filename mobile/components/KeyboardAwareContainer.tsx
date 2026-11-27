import React, {ReactNode} from "react";
import {Keyboard, Pressable} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import KeyboardScrollView from "@/components/KeyboardScrollView";
import useKeyboardInset from "@/hooks/useKeyboardInset";

type Props = {
    children: ReactNode;
};

const KeyboardAwareContainer = ({children}: Props) => {
    const insets = useSafeAreaInsets();
    const {keyboardInset} = useKeyboardInset();
    const paddingBottom = Math.max(0, keyboardInset - insets.bottom);

    return (
        <Pressable style={{flex: 1, paddingBottom}} onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardScrollView keyboardInset={keyboardInset} showsVerticalScrollIndicator={false}>
                {children}
            </KeyboardScrollView>
        </Pressable>
    );
};

export default KeyboardAwareContainer;
