import React, {ReactNode, useCallback, useEffect, useRef} from "react";
import {
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleProp,
    TextInput,
    View,
    ViewStyle,
} from "react-native";

type Props = {
    children: ReactNode;
    keyboardInset: number;
    contentStyle?: StyleProp<ViewStyle>;
    showsVerticalScrollIndicator?: boolean;
};

const FOCUSED_INPUT_MARGIN = 24;

const KeyboardScrollView = ({children, keyboardInset, contentStyle, showsVerticalScrollIndicator}: Props) => {
    const scrollRef = useRef<ScrollView>(null);
    const contentRef = useRef<View>(null);
    const scrollY = useRef(0);
    const viewportHeight = useRef(0);

    const scrollToFocusedInput = useCallback(() => {
        const input = TextInput.State.currentlyFocusedInput();
        const content = contentRef.current;
        if (!input || !content || viewportHeight.current === 0) {
            return;
        }
        input.measureLayout(
            content,
            (_x, y, _width, height) => {
                const visibleTop = scrollY.current;
                const visibleBottom = visibleTop + viewportHeight.current;
                if (y + height + FOCUSED_INPUT_MARGIN > visibleBottom) {
                    scrollRef.current?.scrollTo({
                        y: y + height + FOCUSED_INPUT_MARGIN - viewportHeight.current,
                        animated: true,
                    });
                } else if (y - FOCUSED_INPUT_MARGIN < visibleTop) {
                    scrollRef.current?.scrollTo({y: Math.max(0, y - FOCUSED_INPUT_MARGIN), animated: true});
                }
            },
            () => undefined,
        );
    }, []);

    useEffect(() => {
        if (keyboardInset > 0) {
            const timer = setTimeout(scrollToFocusedInput, 120);
            return () => clearTimeout(timer);
        }
    }, [keyboardInset, scrollToFocusedInput]);

    const onLayout = (e: LayoutChangeEvent) => {
        viewportHeight.current = e.nativeEvent.layout.height;
        if (keyboardInset > 0) {
            scrollToFocusedInput();
        }
    };

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollY.current = e.nativeEvent.contentOffset.y;
    };

    return (
        <ScrollView
            ref={scrollRef}
            contentContainerStyle={{flexGrow: 1}}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onLayout={onLayout}
            onScroll={onScroll}
            scrollEventThrottle={16}
            bounces={false}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        >
            <View ref={contentRef} collapsable={false} style={[{flexGrow: 1}, contentStyle]}>
                {children}
            </View>
        </ScrollView>
    );
};

export default KeyboardScrollView;
